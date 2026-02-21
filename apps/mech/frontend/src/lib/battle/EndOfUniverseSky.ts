/**
 * End of Universe Sky - Two black holes with accretion disks.
 * Uses the exact same shader as OrbitalMechanicsPage plus gravitational lensing
 * post-processing for both black holes.
 */
import * as THREE from 'three';

// ── Accretion disk fragment shader (identical to OrbitalMechanicsPage) ───────
const DISK_FRAG = `
  uniform float time;
  uniform float innerRadius;
  uniform float outerRadius;
  varying vec2 vUv;
  varying vec3 vPosition;

  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
      f.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.1 + vec2(1.3, 0.7);
      a *= 0.5;
    }
    return v;
  }
  void main() {
    float r = length(vPosition.xy);
    float normalizedR = clamp((r - innerRadius) / (outerRadius - innerRadius), 0.0, 1.0);
    float angle = atan(vPosition.y, vPosition.x);
    float angularSpeed = 0.6 / max(r * 0.18, 0.1);
    float sweptAngle = angle - time * angularSpeed;
    vec2 polarUv = vec2(sweptAngle / (2.0 * 3.14159) + 0.5, normalizedR);
    float turbulence = fbm(polarUv * vec2(12.0, 4.0) + vec2(time * 0.05, 0.0));
    float fineTurb   = fbm(polarUv * vec2(30.0, 8.0) - vec2(time * 0.08, 0.0));
    turbulence = turbulence * 0.7 + fineTurb * 0.3;
    float doppler = pow(0.5 + 0.5 * cos(angle), 1.5);
    vec3 innerColor = vec3(1.0,  0.98, 0.85);
    vec3 midColor   = vec3(1.0,  0.55, 0.08);
    vec3 outerColor = vec3(0.45, 0.05, 0.0);
    vec3 color = normalizedR < 0.5
      ? mix(innerColor, midColor, normalizedR * 2.0)
      : mix(midColor, outerColor, (normalizedR - 0.5) * 2.0);
    color *= turbulence * (1.0 + doppler * 0.6);
    float filament = smoothstep(0.0, 0.15, normalizedR) * (1.0 - smoothstep(0.15, 0.35, normalizedR));
    color += vec3(1.0, 0.9, 0.6) * filament * fbm(polarUv * vec2(20.0, 2.0) + time * 0.1) * 1.2;
    float alpha = smoothstep(0.0, 0.04, normalizedR) * (1.0 - smoothstep(0.78, 1.0, normalizedR));
    alpha *= mix(0.5, 1.0, turbulence);
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

const DISK_VERT = `
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ── Gravitational lensing post-process shader (two black holes) ──────────────
const LENSING_VERT = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

const LENSING_FRAG = `
  uniform sampler2D tDiffuse;
  uniform float schwarzschildRadius;
  uniform float lensingStrength;
  uniform vec2 bh1Pos;   // screen-space UV of black hole 1
  uniform vec2 bh2Pos;   // screen-space UV of black hole 2
  varying vec2 vUv;

  vec3 applyLens(vec3 color, vec2 uv, vec2 bhPos) {
    vec2 delta = uv - bhPos;
    float dist = length(delta);
    float einsteinRadius = schwarzschildRadius * 0.03;
    float influence = 1.0 - smoothstep(einsteinRadius * 2.0, einsteinRadius * 4.0, dist);
    if (influence <= 0.0) return color;

    float lensingFactor = (dist > einsteinRadius * 0.5)
      ? lensingStrength * einsteinRadius / dist * influence
      : 0.0;
    vec2 distortedUv = uv - delta * lensingFactor;
    color = texture2D(tDiffuse, distortedUv).rgb;

    // Event horizon
    color *= smoothstep(einsteinRadius * 0.5, einsteinRadius * 0.6, dist);

    // Einstein ring
    float ring = smoothstep(einsteinRadius * 0.95, einsteinRadius, dist)
               * (1.0 - smoothstep(einsteinRadius, einsteinRadius * 1.05, dist));
    color += vec3(1.0, 0.95, 0.9) * ring * 0.5;

    // Accretion glow
    float diskGlow = smoothstep(einsteinRadius * 0.6, einsteinRadius, dist)
                   * (1.0 - smoothstep(einsteinRadius * 1.3, einsteinRadius * 1.5, dist));
    color += mix(vec3(0.8, 0.4, 0.0), vec3(1.0, 0.6, 0.1), diskGlow) * diskGlow * 0.3;

    return color;
  }

  void main() {
    vec3 color = texture2D(tDiffuse, vUv).rgb;
    color = applyLens(color, vUv, bh1Pos);
    color = applyLens(color, vUv, bh2Pos);
    gl_FragColor = vec4(color, 1.0);
  }
`;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LensingSetup {
  target: THREE.WebGLRenderTarget;
  material: THREE.ShaderMaterial;
  quad: THREE.Mesh;
  quadCamera: THREE.OrthographicCamera;
  quadScene: THREE.Scene;
  bh1: THREE.Object3D;
  bh2: THREE.Object3D;
}

// ── Factory ───────────────────────────────────────────────────────────────────

function makeBlackHole(
  sphereRadius: number,
  diskInner: number,
  diskOuter: number,
): { group: THREE.Group; diskMaterial: THREE.ShaderMaterial } {
  const group = new THREE.Group();

  // Event horizon sphere (black)
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, 32, 32);
  const sphereMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  group.add(new THREE.Mesh(sphereGeo, sphereMat));

  // Accretion disk — exact orbital page shader
  const diskGeo = new THREE.RingGeometry(diskInner, diskOuter, 256, 64);
  const diskMat = new THREE.ShaderMaterial({
    uniforms: {
      time:        { value: 0.0 },
      innerRadius: { value: diskInner },
      outerRadius: { value: diskOuter },
    },
    vertexShader:   DISK_VERT,
    fragmentShader: DISK_FRAG,
    side:        THREE.DoubleSide,
    transparent: true,
    blending:    THREE.AdditiveBlending,
    depthWrite:  false,
  });
  const disk = new THREE.Mesh(diskGeo, diskMat);
  disk.rotation.x = Math.PI / 2.2; // same tilt as orbital page
  group.add(disk);

  return { group, diskMaterial: diskMat };
}

/**
 * Create two black holes and a gravitational lensing post-processing setup.
 * Call this from MapRenderer after creating the renderer but before the first render.
 */
export function createEndOfUniverseSky(
  scene: THREE.Scene,
  rendererSize: { width: number; height: number },
): { group: THREE.Group; diskMaterials: THREE.ShaderMaterial[]; lensing: LensingSetup } {
  const group = new THREE.Group();
  const diskMaterials: THREE.ShaderMaterial[] = [];

  // Black hole 1 — faces player spawning at +Z (behind them, on the -Z horizon)
  const bh1 = makeBlackHole(18, 26, 115);
  bh1.group.position.set(0, 8, -310);
  scene.add(bh1.group);
  diskMaterials.push(bh1.diskMaterial);

  // Black hole 2 — faces player spawning at -Z (behind them, on the +Z horizon)
  const bh2 = makeBlackHole(18, 26, 115);
  bh2.group.position.set(0, 8, 310);
  scene.add(bh2.group);
  diskMaterials.push(bh2.diskMaterial);

  group.userData.bh1 = bh1.group;
  group.userData.bh2 = bh2.group;

  // ── Dark star background sphere ───────────────────────────────────────────
  const skyGeo = new THREE.SphereGeometry(800, 32, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: { time: { value: 0 } },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 vWorldPosition;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec3 dir = normalize(vWorldPosition);
        // Near-dead universe: very dark with faint dying red stars
        vec3 col = vec3(0.008, 0.004, 0.012);
        if (dir.y > -0.4) {
          vec2 uv = dir.xz / (abs(dir.y) + 0.01) * 18.0;
          float v = hash(floor(uv));
          float bright = step(0.991, v);
          vec3 sc = mix(vec3(0.9, 0.2, 0.0), vec3(0.2, 0.04, 0.0), hash(floor(uv) + 0.8));
          col += sc * bright * 0.5;
        }
        // Faint red horizon glow from accretion disks
        float hg = smoothstep(0.25, 0.0, abs(dir.y));
        col += vec3(0.08, 0.01, 0.0) * hg;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const skySphere = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skySphere);
  group.userData.skyMat = skyMat;

  // ── Gravitational lensing post-processing ────────────────────────────────
  const target = new THREE.WebGLRenderTarget(rendererSize.width, rendererSize.height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });

  const lensingMat = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse:          { value: null },
      schwarzschildRadius: { value: 1.0 },
      lensingStrength:   { value: 1.0 },
      bh1Pos:            { value: new THREE.Vector2(0.5, 0.5) },
      bh2Pos:            { value: new THREE.Vector2(0.5, 0.5) },
    },
    vertexShader:   LENSING_VERT,
    fragmentShader: LENSING_FRAG,
  });
  lensingMat.uniforms.tDiffuse.value = target.texture;

  const quadScene = new THREE.Scene();
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lensingMat);
  quadScene.add(quad);

  const lensing: LensingSetup = {
    target,
    material: lensingMat,
    quad,
    quadCamera: quadCam,
    quadScene,
    bh1: bh1.group,
    bh2: bh2.group,
  };

  return { group, diskMaterials, lensing };
}

/**
 * Update time uniforms and compute screen-space black hole positions for lensing.
 */
export function updateEndOfUniverseSky(
  diskMaterials: THREE.ShaderMaterial[],
  lensing: LensingSetup,
  camera: THREE.Camera,
  elapsedTime: number,
): void {
  for (const mat of diskMaterials) {
    mat.uniforms.time.value = elapsedTime;
  }

  // Project both BH world positions to NDC → UV for the lensing shader
  const project = (obj: THREE.Object3D): THREE.Vector2 => {
    const pos = new THREE.Vector3();
    obj.getWorldPosition(pos);
    pos.project(camera);
    return new THREE.Vector2((pos.x + 1) / 2, (pos.y + 1) / 2);
  };

  lensing.material.uniforms.bh1Pos.value = project(lensing.bh1);
  lensing.material.uniforms.bh2Pos.value = project(lensing.bh2);
}
