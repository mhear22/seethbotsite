/**
 * Alien-world overworld sky for Story Mode ("The Talus Reach" is a colony belt in
 * another star system, so the sky should read as *not Earth*).
 *
 * A single back-side sphere shader that renders, in one fragment pass:
 *  - an otherworldly vertical gradient (deep indigo-violet zenith → warm dusty
 *    rose haze at the horizon),
 *  - faint daytime stars in the upper sky (thin alien atmosphere lets them show),
 *  - a small, fierce local star (the sun that actually lights the scene),
 *  - a HUGE ringed gas giant hanging above the horizon — banded, with a real
 *    day/night terminator, limb darkening, an atmospheric rim, and a tilted ring
 *    system — the hero element that sells the sense of scale,
 *  - a small crescent moon near it for depth/scale contrast,
 *  - atmospheric haze thickening toward the horizon.
 *
 * Technique mirrors battle/RingWorldSky.ts (procedural fragment shader on a
 * BackSide sphere). The returned material exposes a `time` uniform — drive it
 * each frame via updateOverworldSky. The caller markRaw's / disposes it.
 *
 * IMPORTANT (see StoryWorld.setupSky): the camera far plane is 1000, so the sky
 * dome must follow the camera and render with depth off, or its far side clips.
 */
import * as THREE from 'three'

/** World-space sun direction (normalised). Shared with lighting so they agree. */
export const SUN_DIRECTION = new THREE.Vector3(0.42, 0.5, 0.32).normalize()

/** World direction to the big companion planet (normalised): well above the
 *  horizon and roughly opposite the sun, so we see its lit face + terminator. */
export const PLANET_DIRECTION = new THREE.Vector3(-0.55, 0.42, -0.72).normalize()

export function createOverworldSkyMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      time: { value: 0.0 },
      sunDir: { value: SUN_DIRECTION.clone() },
      planetDir: { value: PLANET_DIRECTION.clone() },
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
      uniform vec3 planetDir;
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

      // Render the big companion planet (and its ring) seen in view direction dir.
      // Returns rgb colour, and alpha = coverage (0 = sky shows through).
      vec4 renderPlanet(vec3 dir, vec3 c, vec3 sun, float angRad, vec3 axis,
                        vec3 dayCol, vec3 nightCol, float ringInner, float ringOuter) {
        float cd = dot(dir, c);
        if (cd < 0.0) return vec4(0.0);           // behind us

        float sinA = sin(angRad);
        vec3 proj = dir - c * cd;                 // component perpendicular to centre
        float r = length(proj);
        float rr = r / sinA;                      // 0 at centre, 1 at the limb

        // Ring frame: tilt/foreshortening from the fixed spin axis.
        float tilt = clamp(abs(dot(axis, c)), 0.18, 1.0);
        vec3 rA = normalize(cross(axis, c));      // ring's un-compressed direction
        vec3 rB = normalize(cross(c, rA));        // compressed by the viewing tilt
        float rx = dot(proj, rA);
        float ry = dot(proj, rB) / tilt;
        float ringRad = sqrt(rx * rx + ry * ry) / sinA;

        vec3 col = vec3(0.0);
        float alpha = 0.0;

        // --- The ring (drawn where it does not overlap the planet disk) ---
        if (rr >= 1.0 && ringRad > ringInner && ringRad < ringOuter) {
          float span = ringOuter - ringInner;
          float u = (ringRad - ringInner) / span;             // 0..1 across the ring
          // Soft inner/outer edges + a Cassini-style gap.
          float edges = smoothstep(0.0, 0.08, u) * smoothstep(1.0, 0.9, u);
          float gap = 1.0 - 0.85 * smoothstep(0.42, 0.48, u) * smoothstep(0.60, 0.54, u);
          float grain = 0.75 + 0.35 * fbm(vec2(ringRad * 22.0, 0.0));
          float ringA = edges * gap * grain * 0.9;
          // Ring is lit by the same star; dim its far (night) arc a touch.
          float ringLit = 0.55 + 0.45 * smoothstep(-0.2, 0.5, dot(c, sun));
          vec3 ringCol = mix(vec3(0.42, 0.38, 0.45), vec3(0.82, 0.74, 0.66), grain) * ringLit;
          col = ringCol;
          alpha = ringA;
        }

        // --- The planet body (opaque; drawn over the ring) ---
        if (rr < 1.0) {
          float h = sqrt(max(0.0, 1.0 - rr * rr));           // z of the sphere point
          vec2 disk = vec2(dot(proj, rA), dot(proj, rB)) / sinA;
          vec3 N = normalize(rA * disk.x + rB * disk.y + c * h);

          // Latitude/longitude on the planet for banding + slow rotation.
          float lat = dot(N, axis);
          vec3 eqA = normalize(cross(axis, c));
          vec3 eqB = cross(axis, eqA);
          float lon = atan(dot(N, eqB), dot(N, eqA)) + time * 0.03;
          float swirl = fbm(vec2(lon * 1.6, lat * 5.0 + time * 0.02));
          float bands = 0.5 + 0.5 * sin((lat * 3.1 + 0.35 * swirl) * 6.2831 * 1.6);
          bands = mix(bands, swirl, 0.25);
          vec3 base = mix(nightCol * 1.4 + vec3(0.05), dayCol, bands);

          // A single great-storm oval for character.
          float storm = smoothstep(0.16, 0.0, length(vec2((lon - 1.1) * 0.6, (lat + 0.25) * 1.6)));
          base = mix(base, vec3(0.72, 0.34, 0.30), storm * 0.7);

          // Day/night terminator + soft limb darkening.
          float lambert = dot(N, sun);
          float day = smoothstep(-0.12, 0.35, lambert);
          float limb = mix(1.0, 0.55, smoothstep(0.55, 1.0, rr));
          vec3 pcol = mix(nightCol * 0.35, base, day) * limb;
          // Warm glow along the day-side limb (forward scattering).
          pcol += dayCol * 0.5 * day * smoothstep(0.75, 1.0, rr);

          col = pcol;
          alpha = 1.0;
        } else if (rr < 1.09) {
          // Thin atmosphere just beyond the limb, lit on the day side.
          float day = smoothstep(-0.1, 0.4, dot(c, sun));
          float halo = smoothstep(1.09, 1.0, rr);
          vec3 atmo = vec3(0.55, 0.62, 0.85) * (0.35 + 0.65 * day);
          // Composite the halo over whatever ring alpha we already have.
          col = mix(col, atmo, halo);
          alpha = max(alpha, halo * 0.9);
        }

        return vec4(col, clamp(alpha, 0.0, 1.0));
      }

      void main() {
        vec3 dir = normalize(vDir);
        float h = clamp(dir.y, 0.0, 1.0);

        // --- Alien sky gradient: warm rose haze -> violet -> deep indigo zenith ---
        vec3 horizon = vec3(0.74, 0.52, 0.47);
        vec3 mid     = vec3(0.40, 0.36, 0.52);
        vec3 zenith  = vec3(0.10, 0.11, 0.26);
        vec3 sky = mix(horizon, mid, smoothstep(0.0, 0.30, h));
        sky = mix(sky, zenith, smoothstep(0.22, 0.85, h));

        // --- Faint daytime stars (thin atmosphere): sparse round points, not
        //     grid cells. Stronger higher up; each cell may host one small star. ---
        vec2 sph = vec2(atan(dir.z, dir.x), asin(clamp(dir.y, -1.0, 1.0)));
        vec2 gv = sph * 130.0;
        vec2 gid = floor(gv);
        vec2 gf = fract(gv) - 0.5;
        float present = step(0.90, hash(gid));                 // ~10% of cells
        vec2 jit = (vec2(hash(gid + 1.3), hash(gid + 2.7)) - 0.5) * 0.6;
        float point = smoothstep(0.09, 0.0, length(gf - jit));
        float twinkle = 0.7 + 0.3 * sin(time * 1.6 + hash(gid) * 100.0);
        float star = present * point * twinkle * smoothstep(0.03, 0.45, dir.y);
        sky += vec3(0.85, 0.9, 1.0) * star * 0.85;

        // --- Local star (small, fierce, blue-white) ---
        float sun = max(dot(dir, normalize(sunDir)), 0.0);
        float disk = smoothstep(0.9992, 0.9997, sun);
        float glow = pow(sun, 900.0) * 0.7 + pow(sun, 40.0) * 0.18;
        vec3 sunColor = vec3(1.0, 0.95, 0.86);
        sky += sunColor * glow;
        sky = mix(sky, vec3(1.0, 0.98, 0.94), disk);

        // --- Companion moon (small crescent, near the big planet) ---
        vec3 moonDir = normalize(vec3(-0.16, 0.60, -0.42));
        vec4 moon = renderPlanet(dir, moonDir, normalize(sunDir), 0.055,
                                 normalize(vec3(0.3, 1.0, 0.1)),
                                 vec3(0.72, 0.70, 0.68), vec3(0.10, 0.10, 0.13),
                                 2.0, 2.0); // ringInner==ringOuter → no ring
        sky = mix(sky, moon.rgb, moon.a);

        // --- The big ringed gas giant (hero element for scale) ---
        vec4 planet = renderPlanet(dir, normalize(planetDir), normalize(sunDir),
                                   0.34,                              // ~19° radius (huge)
                                   normalize(vec3(0.28, 1.0, 0.22)),  // tilted spin axis
                                   vec3(0.86, 0.80, 0.68),            // day band colour
                                   vec3(0.16, 0.20, 0.30),            // night/shadow colour
                                   1.38, 2.30);                       // ring extent (radii)
        sky = mix(sky, planet.rgb, planet.a);

        // --- Horizon haze (alien warm tint) ---
        float haze = pow(1.0 - h, 3.0);
        sky = mix(sky, vec3(0.72, 0.55, 0.52), haze * 0.45);

        gl_FragColor = vec4(sky, 1.0);
      }
    `,
  })
}

export function updateOverworldSky(material: THREE.ShaderMaterial, time: number): void {
  material.uniforms.time.value = time
}
