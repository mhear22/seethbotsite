/**
 * MapRenderer - Converts MapDefinition data into Three.js scene objects
 * Handles static geometry, environment setup, dynamic element updates, and hazard visuals
 */
import * as THREE from 'three';
import type { Building } from './BattleScene';
import type {
  MapDefinition,
  StaticGeometry,
  DynamicElement,
  HazardZone,
  MaterialDef,
  EnvironmentDef,
  LightDef,
} from '@shared/types/MapDefinition';
import { getDynamicElementTransform, isHazardActive } from '@shared/types/MapDefinition';

interface DynamicMeshEntry {
  element: DynamicElement;
  mesh: THREE.Object3D;
}

interface HazardVisualEntry {
  hazard: HazardZone;
  warningMesh: THREE.Mesh;
  pulseMesh: THREE.Mesh;
}

export class MapRenderer {
  private scene: THREE.Scene;
  private buildings: Building[] = [];
  private dynamicMeshes: DynamicMeshEntry[] = [];
  private hazardVisuals: HazardVisualEntry[] = [];
  private windowMeshes: THREE.Mesh[] = [];
  private mapDef: MapDefinition | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Load a full map into the scene. Returns Building[] for collision detection.
   */
  loadMap(map: MapDefinition): Building[] {
    this.mapDef = map;
    this.buildings = [];

    // Setup environment (sky, lighting, floor, fog)
    this.setupEnvironment(map.environment, map.arena.width, map.arena.depth);

    // Create static geometry
    for (const geom of map.staticGeometry) {
      this.createStaticGeometry(geom);
    }

    // Create dynamic elements
    for (const elem of map.dynamicElements) {
      this.createDynamicElement(elem);
    }

    // Create hazard zone visuals
    for (const hazard of map.hazardZones) {
      this.createHazardVisual(hazard);
    }

    return this.buildings;
  }

  /**
   * Setup environment: sky, lighting, floor, fog, grid, boundary walls
   */
  private setupEnvironment(env: EnvironmentDef, arenaWidth: number, arenaDepth: number): void {
    // Sky
    if (env.skyType === 'procedural_stars') {
      this.createProceduralStarSky();
    } else if (env.skyType === 'solid_color' && env.skyColor) {
      this.scene.background = new THREE.Color(env.skyColor);
    }
    // 'none' = no sky (indoor maps rely on ceiling geometry)

    // Ambient light
    const ambient = new THREE.AmbientLight(new THREE.Color(env.ambientLightColor), env.ambientLightIntensity);
    this.scene.add(ambient);

    // Lights
    for (const lightDef of env.lights) {
      this.createLight(lightDef);
    }

    // Floor
    const floorGeo = new THREE.PlaneGeometry(arenaWidth, arenaDepth);
    const floorMat = this.createMaterial(env.floorMaterial);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Grid
    if (env.showGrid) {
      const gridSize = env.gridSize ?? arenaWidth;
      const gridHelper = new THREE.GridHelper(gridSize, gridSize / 2, 0x4a5568, 0x374151);
      gridHelper.position.y = 0.01;
      this.scene.add(gridHelper);
    }

    // Boundary walls
    if (env.showBoundaryWalls) {
      const wallHeight = 10;
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        transparent: true,
        opacity: 0.3,
      });
      const halfW = arenaWidth / 2;
      const halfD = arenaDepth / 2;

      const createWall = (w: number, h: number, d: number, x: number, z: number) => {
        const geo = new THREE.BoxGeometry(w, h, d);
        const wall = new THREE.Mesh(geo, wallMaterial);
        wall.position.set(x, h / 2, z);
        this.scene.add(wall);
      };

      createWall(arenaWidth, wallHeight, 0.5, 0, -halfD);
      createWall(arenaWidth, wallHeight, 0.5, 0, halfD);
      createWall(0.5, wallHeight, arenaDepth, -halfW, 0);
      createWall(0.5, wallHeight, arenaDepth, halfW, 0);
    }

    // Fog
    if (env.fog) {
      this.scene.fog = new THREE.Fog(new THREE.Color(env.fog.color), env.fog.near, env.fog.far);
    }
  }

  /**
   * Create the procedural star sky (same as original BattleScene)
   */
  private createProceduralStarSky(): void {
    const skyGeometry = new THREE.SphereGeometry(800, 32, 16);
    const skyMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {},
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPosition;
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        void main() {
          vec3 dir = normalize(vWorldPosition);
          float elevation = dir.y;
          vec3 zenith = vec3(0.039, 0.039, 0.102);
          vec3 magenta = vec3(1.0, 0.0, 1.0);
          vec3 cyan = vec3(0.0, 1.0, 1.0);
          float horizonBand = smoothstep(0.2, 0.0, abs(elevation));
          float angle = atan(dir.x, dir.z) * 0.5 + 0.5;
          vec3 horizonColor = mix(magenta, cyan, angle);
          vec3 skyColor = mix(zenith * 0.5, zenith, smoothstep(-0.3, 0.3, elevation));
          skyColor = mix(skyColor, horizonColor, horizonBand * 0.6);
          if (elevation > 0.05) {
            vec2 starUV = dir.xz / (elevation + 0.001) * 20.0;
            float starVal = hash(floor(starUV));
            float starBright = step(0.985, starVal);
            float twinkle = hash(floor(starUV) + vec2(0.5));
            starBright *= (0.6 + 0.4 * twinkle);
            skyColor += vec3(starBright) * smoothstep(0.05, 0.3, elevation);
          }
          gl_FragColor = vec4(skyColor, 1.0);
        }
      `,
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(sky);
  }

  /**
   * Create a light from definition
   */
  private createLight(def: LightDef): void {
    switch (def.type) {
      case 'directional': {
        const light = new THREE.DirectionalLight(new THREE.Color(def.color), def.intensity);
        light.position.set(def.position[0], def.position[1], def.position[2]);
        if (def.castShadow) {
          light.castShadow = true;
          light.shadow.camera.left = -200;
          light.shadow.camera.right = 200;
          light.shadow.camera.top = 200;
          light.shadow.camera.bottom = -200;
          light.shadow.mapSize.width = 2048;
          light.shadow.mapSize.height = 2048;
        }
        this.scene.add(light);
        break;
      }
      case 'point': {
        const light = new THREE.PointLight(new THREE.Color(def.color), def.intensity, def.distance, def.decay);
        light.position.set(def.position[0], def.position[1], def.position[2]);
        if (def.castShadow) light.castShadow = true;
        this.scene.add(light);
        break;
      }
      case 'hemisphere': {
        const light = new THREE.HemisphereLight(
          new THREE.Color(def.color),
          new THREE.Color(def.groundColor),
          def.intensity,
        );
        this.scene.add(light);
        break;
      }
    }
  }

  /**
   * Create a Three.js material from MaterialDef
   */
  private createMaterial(def: MaterialDef): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(def.color),
      roughness: def.roughness ?? 0.5,
      metalness: def.metalness ?? 0.5,
      emissive: def.emissive ? new THREE.Color(def.emissive) : undefined,
      emissiveIntensity: def.emissiveIntensity ?? 0,
      transparent: def.transparent ?? false,
      opacity: def.opacity ?? 1.0,
    });
  }

  /**
   * Add edge highlight lines to a mesh
   */
  private addEdgeHighlight(mesh: THREE.Mesh, geometry: THREE.BufferGeometry, edgeColor?: string): void {
    if (!edgeColor) return;
    const edgeGeo = new THREE.EdgesGeometry(geometry);
    const edgeMat = new THREE.LineBasicMaterial({ color: new THREE.Color(edgeColor) });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    mesh.add(edges);
  }

  /**
   * Create static geometry mesh and add to scene + buildings array
   */
  private createStaticGeometry(geom: StaticGeometry): void {
    let threeGeom: THREE.BufferGeometry;
    let width = 0, height = 0, depth = 0;

    switch (geom.type) {
      case 'box': {
        [width, height, depth] = geom.size;
        threeGeom = new THREE.BoxGeometry(width, height, depth);
        break;
      }
      case 'cylinder': {
        const segments = geom.segments ?? 16;
        threeGeom = new THREE.CylinderGeometry(geom.radiusTop, geom.radiusBottom, geom.height, segments);
        width = Math.max(geom.radiusTop, geom.radiusBottom) * 2;
        height = geom.height;
        depth = width;
        break;
      }
      case 'ramp': {
        // Approximate ramp as a box (visual + collision)
        width = geom.width;
        height = geom.height;
        depth = geom.depth;
        threeGeom = new THREE.BoxGeometry(width, height, depth);
        break;
      }
      case 'plane': {
        threeGeom = new THREE.PlaneGeometry(geom.width, geom.height);
        width = geom.width;
        height = geom.height;
        depth = 0.1; // Thin for collision purposes
        break;
      }
    }

    const mat = this.createMaterial(geom.material);
    const mesh = new THREE.Mesh(threeGeom, mat);
    mesh.position.set(geom.position[0], geom.position[1], geom.position[2]);

    if (geom.rotation) {
      mesh.rotation.set(geom.rotation[0], geom.rotation[1], geom.rotation[2]);
    }

    if (geom.castShadow) mesh.castShadow = true;
    if (geom.receiveShadow) mesh.receiveShadow = true;

    // Add edge highlights
    this.addEdgeHighlight(mesh, threeGeom, geom.material.edgeColor);

    this.scene.add(mesh);

    // Track windows for shader replacement
    if (geom.tags?.includes('window')) {
      this.windowMeshes.push(mesh);
    }

    // Add to buildings array for collision detection
    if (geom.collision) {
      this.buildings.push({
        mesh,
        position: new THREE.Vector3(geom.position[0], geom.position[1], geom.position[2]),
        width,
        height,
        depth,
      });
    }
  }

  /**
   * Create a dynamic element mesh
   */
  private createDynamicElement(elem: DynamicElement): void {
    let mesh: THREE.Mesh;

    switch (elem.type) {
      case 'conveyor': {
        const geo = new THREE.BoxGeometry(elem.size[0], elem.size[1], elem.size[2]);
        const mat = this.createMaterial(elem.material);
        mesh = new THREE.Mesh(geo, mat);
        this.addEdgeHighlight(mesh, geo, elem.material.edgeColor);
        break;
      }
      case 'rotating': {
        let geo: THREE.BufferGeometry;
        if (elem.shape === 'box') {
          geo = new THREE.BoxGeometry(elem.size[0], elem.size[1], elem.size[2]);
        } else {
          geo = new THREE.CylinderGeometry(elem.size[0], elem.size[2], elem.size[1], 16);
        }
        const mat = this.createMaterial(elem.material);
        mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        this.addEdgeHighlight(mesh, geo, elem.material.edgeColor);
        break;
      }
      case 'piston': {
        const geo = new THREE.BoxGeometry(elem.size[0], elem.size[1], elem.size[2]);
        const mat = this.createMaterial(elem.material);
        mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        this.addEdgeHighlight(mesh, geo, elem.material.edgeColor);
        break;
      }
    }

    mesh.position.set(elem.position[0], elem.position[1], elem.position[2]);
    if (elem.rotation) {
      mesh.rotation.set(elem.rotation[0], elem.rotation[1], elem.rotation[2]);
    }

    this.scene.add(mesh);
    this.dynamicMeshes.push({ element: elem, mesh });
  }

  /**
   * Create hazard zone visual (warning + active pulse meshes)
   */
  private createHazardVisual(hazard: HazardZone): void {
    let warningGeo: THREE.BufferGeometry;
    let pulseGeo: THREE.BufferGeometry;

    if (hazard.shape === 'sphere') {
      warningGeo = new THREE.SphereGeometry(hazard.radius ?? 10, 32, 16);
      pulseGeo = new THREE.SphereGeometry(hazard.radius ?? 10, 32, 16);
    } else if (hazard.shape === 'cylinder') {
      const r = hazard.radius ?? 10;
      const h = hazard.height ?? 50;
      warningGeo = new THREE.CylinderGeometry(r, r, h, 32, 1, true);
      pulseGeo = new THREE.CylinderGeometry(r, r, h, 32, 1, true);
    } else {
      const [w, h, d] = hazard.size ?? [10, 10, 10];
      warningGeo = new THREE.BoxGeometry(w, h, d);
      pulseGeo = new THREE.BoxGeometry(w, h, d);
    }

    // Warning mesh (wireframe, fades in during warning phase)
    const warningMat = new THREE.MeshBasicMaterial({
      color: this.getHazardColor(hazard.damageType),
      wireframe: true,
      transparent: true,
      opacity: 0,
    });
    const warningMesh = new THREE.Mesh(warningGeo, warningMat);
    warningMesh.position.set(hazard.position[0], hazard.position[1] + (hazard.height ?? 0) / 2, hazard.position[2]);

    // Pulse mesh (semi-transparent, visible during active phase)
    const pulseMat = new THREE.MeshBasicMaterial({
      color: this.getHazardColor(hazard.damageType),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    pulseMesh.position.copy(warningMesh.position);

    this.scene.add(warningMesh);
    this.scene.add(pulseMesh);

    this.hazardVisuals.push({ hazard, warningMesh, pulseMesh });
  }

  private getHazardColor(type: string): number {
    switch (type) {
      case 'radiation': return 0x10b981;
      case 'fire': return 0xf97316;
      case 'electric': return 0x3b82f6;
      case 'crushing': return 0xef4444;
      default: return 0xff0000;
    }
  }

  /**
   * Update dynamic element transforms each frame
   */
  updateDynamicElements(elapsedTime: number): void {
    for (const { element, mesh } of this.dynamicMeshes) {
      const transform = getDynamicElementTransform(element, elapsedTime);
      mesh.position.set(transform.position[0], transform.position[1], transform.position[2]);
      mesh.rotation.set(transform.rotation[0], transform.rotation[1], transform.rotation[2]);
    }
  }

  /**
   * Update hazard zone visuals each frame
   */
  updateHazardVisuals(elapsedTime: number): void {
    for (const { hazard, warningMesh, pulseMesh } of this.hazardVisuals) {
      const state = isHazardActive(hazard, elapsedTime);

      const warningMat = warningMesh.material as THREE.MeshBasicMaterial;
      const pulseMat = pulseMesh.material as THREE.MeshBasicMaterial;

      if (state.active) {
        warningMat.opacity = 0;
        pulseMat.opacity = 0.3;
      } else if (state.warning) {
        // Pulsing warning effect
        const pulseSpeed = 4;
        warningMat.opacity = 0.3 + 0.2 * Math.sin(elapsedTime * pulseSpeed * Math.PI * 2);
        pulseMat.opacity = 0;
      } else {
        warningMat.opacity = 0;
        pulseMat.opacity = 0;
      }
    }
  }

  /**
   * Get window meshes for shader replacement (Space Colony)
   */
  getWindowMeshes(): THREE.Mesh[] {
    return this.windowMeshes;
  }

  /**
   * Get buildings array for collision detection
   */
  getBuildings(): Building[] {
    return this.buildings;
  }

  /**
   * Get map definition
   */
  getMapDef(): MapDefinition | null {
    return this.mapDef;
  }
}
