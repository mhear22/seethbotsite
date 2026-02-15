/**
 * RingWorldSky - Shader for Halo-like ring world skybox
 * Renders a rotating O'Neill cylinder interior with:
 * - Curved colony landscape visible in the distance
 * - Planet visible through the "top" of the ring
 * - Starfield background
 * - Atmospheric effects
 */
import * as THREE from 'three';

export function createRingWorldSkyMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      time: { value: 0.0 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      varying vec3 vDirection;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        vDirection = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 vWorldPosition;
      varying vec3 vDirection;

      // Hash functions for procedural generation
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float hash3(vec3 p) {
        return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
      }

      // Noise for terrain
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec3 dir = normalize(vDirection);

        // The ring world is a cylinder spinning around the Y axis
        // Player is inside looking "up" at the other side of the ring
        // Planet is visible above (positive Y direction)

        float rotationAngle = time * 0.02; // Slow rotation of the ring

        // Rotate the view direction around Y for the ring rotation effect
        float cosR = cos(rotationAngle);
        float sinR = sin(rotationAngle);
        vec3 rotatedDir = vec3(
          dir.x * cosR + dir.z * sinR,
          dir.y,
          -dir.x * sinR + dir.z * cosR
        );

        // Base space color
        vec3 spaceColor = vec3(0.02, 0.02, 0.05);
        vec3 color = spaceColor;

        // === STARFIELD ===
        vec3 starDir = normalize(vWorldPosition);
        if (starDir.y > -0.2) {
          vec2 starUV = starDir.xz / (max(0.1, abs(starDir.y)) + 0.1) * 30.0;
          float starVal = hash(floor(starUV + time * 0.1));
          if (starVal > 0.985) {
            float twinkle = 0.5 + 0.5 * sin(time * 3.0 + starVal * 100.0);
            color += vec3(twinkle * 0.8);
          }
        }

        // === PLANET (visible when looking up/positive Y) ===
        if (dir.y > 0.0) {
          // Planet is "above" - visible through the center of the ring
          // Project direction onto XZ plane to find planet position
          vec2 planetPos = vec2(0.0, 0.0); // Center of the sky
          vec2 planetDir = vec2(dir.x, dir.z);

          float planetRadius = 0.35;
          float dist2D = length(planetDir);

          // Planet appears as a disk in the sky
          if (dist2D < planetRadius && dir.y > 0.3) {
            float normalizedDist = dist2D / planetRadius;
            float sphereY = sqrt(max(0.0, 1.0 - normalizedDist * normalizedDist));

            // Planet colors - gas giant with bands
            vec3 deepBlue = vec3(0.1, 0.2, 0.5);
            vec3 lightBlue = vec3(0.3, 0.5, 0.8);
            vec3 cream = vec3(0.9, 0.85, 0.7);
            vec3 orange = vec3(0.8, 0.5, 0.3);

            // Latitude bands
            float angle = atan(dir.z, dir.x) + rotationAngle * 0.5;
            float bandNoise = fbm(vec2(angle * 3.0, dir.y * 5.0));
            float bands = sin(angle * 5.0 + bandNoise * 2.0) * 0.5 + 0.5;

            vec3 planetColor = mix(deepBlue, lightBlue, bands);
            planetColor = mix(planetColor, cream, smoothstep(0.4, 0.6, bands + bandNoise * 0.3));
            planetColor = mix(planetColor, orange, smoothstep(0.7, 0.9, bands * bandNoise));

            // Lighting from sun (coming from side)
            float light = dot(normalize(vec3(dir.x, sphereY, dir.z)), normalize(vec3(0.5, 0.3, 1.0)));
            light = max(0.2, light);

            color = planetColor * light;

            // Atmosphere glow at edges
            float edgeDist = planetRadius - dist2D;
            if (edgeDist < 0.08) {
              float glow = edgeDist / 0.08;
              vec3 atmosColor = vec3(0.4, 0.6, 1.0);
              color = mix(atmosColor * 0.8, color, glow);
            }
          }
        }

        // === RING WORLD INTERIOR (visible all around) ===
        // The ring curves up and over - visible as landscape that curves upward

        // Calculate angle from "down" - this determines what part of the ring we see
        float vertAngle = asin(clamp(dir.y, -1.0, 1.0));
        float horizAngle = atan(rotatedDir.z, rotatedDir.x);

        // The ring surface is visible when looking at angles
        // We map the view direction to a position on the inner ring surface
        // Ring radius conceptually at distance where surface would be

        float ringVisibility = 1.0 - abs(dir.y); // More visible at horizon
        ringVisibility = smoothstep(0.0, 0.5, ringVisibility);

        if (ringVisibility > 0.1) {
          // Create the ring surface texture
          vec2 ringUV = vec2(
            horizAngle / 3.14159 * 0.5 + 0.5, // Wrap around ring
            vertAngle / 1.5708 * 0.5 + 0.5     // Vertical position
          );

          // Terrain-like procedural texture
          float terrain = fbm(ringUV * 8.0 + vec2(time * 0.01, 0.0));

          // Ring surface colors - farmland/terrain patches
          vec3 groundDark = vec3(0.1, 0.15, 0.1);  // Dark green
          vec3 groundLight = vec3(0.2, 0.3, 0.15); // Lighter green
          vec3 water = vec3(0.1, 0.2, 0.35);       // Blue water
          vec3 city = vec3(0.3, 0.3, 0.35);        // Gray structures

          // Create patches
          float patchVal = hash(floor(ringUV * 20.0));
          vec3 surfaceColor = groundDark;

          if (patchVal > 0.7) {
            surfaceColor = mix(groundLight, groundDark, terrain);
          } else if (patchVal > 0.5) {
            surfaceColor = water;
          } else if (patchVal > 0.4) {
            surfaceColor = city;
          } else {
            surfaceColor = mix(groundDark, groundLight, terrain);
          }

          // Add city lights (visible in darker areas)
          if (patchVal > 0.35 && patchVal < 0.45) {
            float cityLight = hash(floor(ringUV * 100.0));
            if (cityLight > 0.8) {
              surfaceColor += vec3(0.3, 0.25, 0.1); // Warm city lights
            }
          }

          // Atmospheric haze based on distance
          float haze = smoothstep(0.1, 0.7, ringVisibility);
          vec3 hazeColor = vec3(0.15, 0.2, 0.3);

          // Sunlight stripes through ring windows (Banksian strips)
          float sunlight = sin(horizAngle * 8.0 + time * 0.05) * 0.5 + 0.5;
          sunlight = smoothstep(0.6, 0.8, sunlight);
          surfaceColor += vec3(0.2, 0.18, 0.1) * sunlight;

          // Apply haze
          surfaceColor = mix(surfaceColor, hazeColor, haze * 0.5);

          // Blend with space background
          color = mix(color, surfaceColor, ringVisibility * 0.9);

          // Add subtle glow from the ring
          color += vec3(0.02, 0.03, 0.05) * ringVisibility;
        }

        // === ATMOSPHERIC FOG at horizon ===
        float horizonGlow = exp(-abs(dir.y) * 3.0) * 0.3;
        vec3 horizonColor = vec3(0.2, 0.3, 0.5);
        color = mix(color, horizonColor, horizonGlow);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

/**
 * Create the ring world skybox mesh
 */
export function createRingWorldSky(): THREE.Mesh {
  const skyGeometry = new THREE.SphereGeometry(900, 64, 32);
  const skyMaterial = createRingWorldSkyMaterial();
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  return sky;
}

/**
 * Update ring world shader time uniform each frame
 */
export function updateRingWorldSky(material: THREE.ShaderMaterial, time: number): void {
  material.uniforms.time.value = time;
}
