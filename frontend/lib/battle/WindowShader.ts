/**
 * WindowShader - Animated planet shader for Space Colony Interior windows
 * Renders starfield background with a large planet sphere and atmosphere glow
 * Planet slowly orbits based on time uniform
 */
import * as THREE from 'three';

export function createWindowMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    uniforms: {
      time: { value: 0.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;

      // Hash for stars
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        vec2 uv = vUv;

        // Background: deep space
        vec3 color = vec3(0.02, 0.02, 0.06);

        // Starfield
        vec2 starGrid = floor(uv * 80.0);
        float starVal = hash(starGrid);
        if (starVal > 0.97) {
          float brightness = (starVal - 0.97) / 0.03;
          float twinkle = 0.7 + 0.3 * sin(time * 2.0 + starVal * 100.0);
          color += vec3(brightness * twinkle);
        }

        // Planet - orbits slowly
        float planetAngle = time * 0.05;
        vec2 planetCenter = vec2(0.5 + 0.15 * sin(planetAngle), 0.4 + 0.05 * cos(planetAngle * 0.7));
        float planetRadius = 0.2;
        float dist = distance(uv, planetCenter);

        if (dist < planetRadius) {
          // Planet surface
          float normalizedDist = dist / planetRadius;
          float sphereY = sqrt(1.0 - normalizedDist * normalizedDist);

          // Planet color gradient (earth-like)
          vec3 deep = vec3(0.05, 0.15, 0.4);  // Ocean
          vec3 land = vec3(0.15, 0.35, 0.15);  // Land
          vec3 ice = vec3(0.7, 0.8, 0.9);      // Poles

          // Latitude-based coloring
          float lat = (uv.y - planetCenter.y) / planetRadius;
          vec3 planetColor = mix(deep, land, smoothstep(0.0, 0.3, abs(sin(lat * 8.0 + time * 0.1))));
          planetColor = mix(planetColor, ice, smoothstep(0.7, 1.0, abs(lat)));

          // Lighting (sun from upper-right)
          float light = dot(normalize(vec3(uv - planetCenter, sphereY)), normalize(vec3(0.5, 0.3, 1.0)));
          light = max(0.1, light);

          color = planetColor * light;
        }

        // Atmosphere glow
        float atmosDist = dist - planetRadius;
        if (atmosDist > 0.0 && atmosDist < 0.06) {
          float glow = 1.0 - atmosDist / 0.06;
          glow = pow(glow, 2.0);
          vec3 atmosColor = vec3(0.3, 0.5, 1.0);
          color = mix(color, atmosColor, glow * 0.6);
        }

        gl_FragColor = vec4(color, 0.95);
      }
    `,
  });
}

/**
 * Apply window shader to window meshes from MapRenderer
 * Call this after loadMap() to replace window materials with animated shader
 */
export function applyWindowShaders(windowMeshes: THREE.Mesh[]): THREE.ShaderMaterial[] {
  const materials: THREE.ShaderMaterial[] = [];

  for (const mesh of windowMeshes) {
    const mat = createWindowMaterial();
    mesh.material = mat;
    materials.push(mat);
  }

  return materials;
}

/**
 * Update window shader time uniforms each frame
 */
export function updateWindowShaders(materials: THREE.ShaderMaterial[], time: number): void {
  for (const mat of materials) {
    mat.uniforms.time.value = time;
  }
}
