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

/**
 * World-space sun/planet/moon BASE directions (normalised) — the "today, mid-
 * morning" look. DayNightCycle rotates these by one shared quaternion each
 * frame to sweep the whole sky together; StoryWorld feeds the rotated result
 * into updateOverworldSky every frame (see that function below). The raw
 * constants stay exported so DayNightCycle has a fixed starting pose to spin.
 */
export const SUN_DIRECTION = new THREE.Vector3(0.42, 0.5, 0.32).normalize()

/** World direction to the big companion planet (normalised): well above the
 *  horizon and roughly opposite the sun, so we see its lit face + terminator. */
export const PLANET_DIRECTION = new THREE.Vector3(-0.55, 0.42, -0.72).normalize()

/** World direction to the small crescent moon (normalised), near the planet
 *  for depth/scale contrast. */
export const MOON_DIRECTION = new THREE.Vector3(-0.16, 0.60, -0.42).normalize()

export function createOverworldSkyMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      time: { value: 0.0 },
      sunDir: { value: SUN_DIRECTION.clone() },
      planetDir: { value: PLANET_DIRECTION.clone() },
      moonDir: { value: MOON_DIRECTION.clone() },
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
      uniform vec3 moonDir;
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
        vec3 sunN = normalize(sunDir);
        float h = clamp(dir.y, 0.0, 1.0);
        float elev = sunN.y; // sun elevation: >0 day, <0 below horizon

        // --- Day/dusk/night elevation weights (mirrors DayNightCycle's own
        //     bands so the sky and the scene lighting agree on where "dusk"
        //     sits) — sum to 1, used to barycentric-blend the three palettes
        //     below instead of a single hard-coded gradient. ---
        float dayAmt = smoothstep(-0.02, 0.28, elev);
        float nightAmt = 1.0 - smoothstep(-0.30, 0.10, elev);
        float duskAmt = clamp(1.0 - dayAmt - nightAmt, 0.0, 1.0);

        // --- Alien sky gradient: three palettes (day / dusk / night), each
        //     built with the same horizon->zenith shape, blended by the
        //     weights above. ---
        vec3 dayHorizon = vec3(0.74, 0.52, 0.47);
        vec3 dayMid     = vec3(0.40, 0.36, 0.52);
        vec3 dayZenith  = vec3(0.10, 0.11, 0.26);
        vec3 daySky = mix(dayHorizon, dayMid, smoothstep(0.0, 0.30, h));
        daySky = mix(daySky, dayZenith, smoothstep(0.22, 0.85, h));

        vec3 duskHorizon = vec3(0.95, 0.42, 0.22);
        vec3 duskMid     = vec3(0.52, 0.28, 0.40);
        vec3 duskZenith  = vec3(0.08, 0.08, 0.22);
        vec3 duskSky = mix(duskHorizon, duskMid, smoothstep(0.0, 0.30, h));
        duskSky = mix(duskSky, duskZenith, smoothstep(0.18, 0.75, h));

        vec3 nightHorizon = vec3(0.05, 0.055, 0.09);
        vec3 nightMid     = vec3(0.02, 0.025, 0.06);
        vec3 nightZenith  = vec3(0.005, 0.006, 0.02);
        vec3 nightSky = mix(nightHorizon, nightMid, smoothstep(0.0, 0.30, h));
        nightSky = mix(nightSky, nightZenith, smoothstep(0.18, 0.75, h));

        vec3 sky = daySky * dayAmt + duskSky * duskAmt + nightSky * nightAmt;

        // Warm band hugging the sun's side of the sky, strongest right at
        // dawn/dusk and low on the horizon — a rotating world's terminator glow.
        vec2 sunHorizRaw = vec2(sunN.x, sunN.z);
        vec2 sunHoriz = sunHorizRaw / max(length(sunHorizRaw), 0.0001);
        vec2 dirHorizRaw = vec2(dir.x, dir.z);
        vec2 dirHoriz = dirHorizRaw / max(length(dirHorizRaw), 0.0001);
        float sunSide = max(dot(dirHoriz, sunHoriz), 0.0);
        sky += vec3(1.0, 0.42, 0.16) * sunSide * duskAmt * (1.0 - h) * 0.5;

        // --- Stars (thin atmosphere): sparse round points, not grid cells.
        //     Faint by day, much brighter as the sun sets, and visible lower
        //     in the sky once night has taken over. ---
        vec2 sph = vec2(atan(dir.z, dir.x), asin(clamp(dir.y, -1.0, 1.0)));
        vec2 gv = sph * 130.0;
        vec2 gid = floor(gv);
        vec2 gf = fract(gv) - 0.5;
        float present = step(0.90, hash(gid));                 // ~10% of cells
        vec2 jit = (vec2(hash(gid + 1.3), hash(gid + 2.7)) - 0.5) * 0.6;
        float point = smoothstep(0.09, 0.0, length(gf - jit));
        float twinkle = 0.7 + 0.3 * sin(time * 1.6 + hash(gid) * 100.0);
        float starGate = smoothstep(mix(0.03, -0.15, nightAmt), mix(0.45, 0.10, nightAmt), dir.y);
        float star = present * point * twinkle * starGate;
        float starBoost = 0.85 + 3.2 * (nightAmt + 0.4 * duskAmt);
        sky += vec3(0.85, 0.9, 1.0) * star * starBoost;

        // --- Local star (small, fierce, blue-white); fades out below the
        //     horizon so it never ghosts through once night has taken over. ---
        float sun = max(dot(dir, sunN), 0.0);
        float disk = smoothstep(0.9992, 0.9997, sun);
        float glow = pow(sun, 900.0) * 0.7 + pow(sun, 40.0) * 0.18;
        float sunVisible = clamp(dayAmt + duskAmt, 0.0, 1.0);
        vec3 sunColor = vec3(1.0, 0.95, 0.86);
        sky += sunColor * glow * sunVisible;
        sky = mix(sky, vec3(1.0, 0.98, 0.94), disk * sunVisible);

        // --- Companion moon (small crescent, near the big planet); a
        //     brighter night colour keeps it reading against a dark sky. ---
        vec4 moon = renderPlanet(dir, normalize(moonDir), sunN, 0.055,
                                 normalize(vec3(0.3, 1.0, 0.1)),
                                 vec3(0.72, 0.70, 0.68), vec3(0.14, 0.14, 0.18),
                                 2.0, 2.0); // ringInner==ringOuter → no ring
        sky = mix(sky, moon.rgb, moon.a);

        // --- The big ringed gas giant (hero element for scale); same
        //     brighter night colour so it stays a night-sky feature. ---
        vec4 planet = renderPlanet(dir, normalize(planetDir), sunN,
                                   0.34,                              // ~19° radius (huge)
                                   normalize(vec3(0.28, 1.0, 0.22)),  // tilted spin axis
                                   vec3(0.86, 0.80, 0.68),            // day band colour
                                   vec3(0.20, 0.24, 0.34),            // night/shadow colour
                                   1.38, 2.30);                       // ring extent (radii)
        sky = mix(sky, planet.rgb, planet.a);

        // --- Horizon haze (alien warm tint by day/dusk, dark cool at night) ---
        float haze = pow(1.0 - h, 3.0);
        vec3 hazeColor = mix(vec3(0.04, 0.045, 0.08), vec3(0.72, 0.55, 0.52), dayAmt + duskAmt);
        sky = mix(sky, hazeColor, haze * 0.45);

        gl_FragColor = vec4(sky, 1.0);
      }
    `,
  })
}

/**
 * Advance the sky's animated uniforms: `time` (twinkle/spin) plus the current
 * sun/planet/moon directions (driven by DayNightCycle's rotating sky — see
 * StoryWorld.updateSky). Copies into the existing uniform Vector3s in place;
 * never allocates.
 */
export function updateOverworldSky(
  material: THREE.ShaderMaterial,
  time: number,
  sunDir: THREE.Vector3,
  planetDir: THREE.Vector3,
  moonDir: THREE.Vector3,
): void {
  material.uniforms.time.value = time
  ;(material.uniforms.sunDir.value as THREE.Vector3).copy(sunDir)
  ;(material.uniforms.planetDir.value as THREE.Vector3).copy(planetDir)
  ;(material.uniforms.moonDir.value as THREE.Vector3).copy(moonDir)
}
