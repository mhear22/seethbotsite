/**
 * Friendly daytime overworld sky for Story Mode.
 *
 * A single back-side sphere shader that renders:
 *  - a rich vertical gradient (deep blue zenith → pale haze at the horizon),
 *  - a soft glowing sun disk + bloom,
 *  - cheap drifting fbm clouds in the upper hemisphere,
 *  - atmospheric haze thickening toward the horizon.
 *
 * Built to mirror the technique in battle/RingWorldSky.ts (procedural fragment
 * shader on a BackSide sphere) but kept squarely daytime/overworld. The returned
 * material exposes a `time` uniform — drive it each frame via updateOverworldSky.
 *
 * All objects created by the caller are markRaw'd / disposed there.
 */
import * as THREE from 'three'

/** World-space sun direction (normalised). Shared with lighting so they agree. */
export const SUN_DIRECTION = new THREE.Vector3(0.42, 0.5, 0.32).normalize()

export function createOverworldSkyMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      time: { value: 0.0 },
      sunDir: { value: SUN_DIRECTION.clone() },
    },
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 sunDir;
      varying vec3 vDir;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
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
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.02;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec3 dir = normalize(vDir);
        float h = clamp(dir.y, 0.0, 1.0);

        // --- Sky gradient: pale warm haze at horizon -> blue zenith ---
        vec3 horizon = vec3(0.78, 0.86, 0.92);
        vec3 mid     = vec3(0.42, 0.64, 0.90);
        vec3 zenith  = vec3(0.18, 0.42, 0.80);
        vec3 sky = mix(horizon, mid, smoothstep(0.0, 0.35, h));
        sky = mix(sky, zenith, smoothstep(0.3, 0.9, h));

        // --- Sun ---
        float sun = max(dot(dir, normalize(sunDir)), 0.0);
        float disk = smoothstep(0.9985, 0.9995, sun);
        float glow = pow(sun, 220.0) * 0.6 + pow(sun, 18.0) * 0.25;
        vec3 sunColor = vec3(1.0, 0.96, 0.85);
        sky += sunColor * glow;
        sky = mix(sky, vec3(1.0, 0.98, 0.92), disk);

        // --- Clouds (upper hemisphere only, drifting) ---
        if (dir.y > 0.02) {
          // Project the view dir onto a plane "above" for stable cloud UVs.
          vec2 uv = dir.xz / (dir.y + 0.15);
          uv *= 1.6;
          uv += vec2(time * 0.012, time * 0.006);
          float clouds = fbm(uv);
          clouds = smoothstep(0.55, 0.95, clouds);
          // Fade clouds out near the horizon and toward the zenith edge.
          float band = smoothstep(0.04, 0.25, dir.y) * (1.0 - smoothstep(0.85, 1.0, dir.y));
          clouds *= band;
          // Light the clouds slightly from the sun side.
          float shade = 0.85 + 0.15 * smoothstep(0.0, 1.0, sun);
          vec3 cloudColor = mix(vec3(0.78, 0.80, 0.85), vec3(1.0, 0.99, 0.96), shade);
          sky = mix(sky, cloudColor, clouds * 0.9);
        }

        // --- Horizon haze ---
        float haze = pow(1.0 - h, 3.0);
        sky = mix(sky, vec3(0.86, 0.90, 0.93), haze * 0.4);

        gl_FragColor = vec4(sky, 1.0);
      }
    `,
  })
}

export function updateOverworldSky(material: THREE.ShaderMaterial, time: number): void {
  material.uniforms.time.value = time
}
