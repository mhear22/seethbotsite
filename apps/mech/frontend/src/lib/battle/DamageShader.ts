/**
 * DamageShader - Post-processing pixel sort effect triggered on player taking damage.
 * Uses fake pixel sorting (horizontal span shifting + chromatic aberration + red tint).
 * Intensity decays over ~0.8s after being triggered.
 */
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'

export const DamageShaderDef = {
  uniforms: {
    tDiffuse: { value: null as unknown },
    intensity: { value: 0.0 },
    time: { value: 0.0 },
    brightness: { value: 1.08 }, // compensate for EffectComposer render target gamma shift
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    uniform float time;
    uniform float brightness;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      vec4 orig = texture2D(tDiffuse, vUv);

      if (intensity < 0.001) {
        gl_FragColor = vec4(orig.rgb * brightness, orig.a);
        return;
      }

      // Chromatic aberration — applied everywhere, scales with intensity
      float ca = intensity * 0.006;
      float rChan = texture2D(tDiffuse, vUv + vec2(ca, 0.0)).r;
      float bChan = texture2D(tDiffuse, vUv - vec2(ca, 0.0)).b;
      vec4 color = vec4(rChan, orig.g, bChan, 1.0);

      // Per-row pixel sort spans
      // Snap to discrete rows so each row gets a consistent random span this frame
      float rowN = floor(vUv.y * 540.0);
      float frameT = floor(time * 12.0); // ~12 new span layouts per second

      float spanStart = hash(vec2(rowN,         frameT));
      float spanWidth = hash(vec2(rowN + 200.0, frameT)) * intensity * 0.6;
      float spanEnd   = spanStart + spanWidth;

      if (vUv.x >= spanStart && vUv.x <= spanEnd && spanWidth > 0.005) {
        // Inside an active span: shift the sample with chromatic split
        float shift = (hash(vec2(rowN * 0.3, frameT + 1.0)) - 0.5) * intensity * 0.10;
        vec2 sortUv = vec2(clamp(vUv.x + shift, 0.0, 1.0), vUv.y);

        float rS = texture2D(tDiffuse, sortUv + vec2(ca * 2.0, 0.0)).r;
        float gS = texture2D(tDiffuse, sortUv).g;
        float bS = texture2D(tDiffuse, sortUv - vec2(ca * 2.0, 0.0)).b;
        color = vec4(rS, gS, bS, 1.0);
      }

      // Red damage vignette — stronger in corners
      vec2 centered = vUv - 0.5;
      float vignette = dot(centered, centered) * 3.0;
      color.r = min(1.0, color.r + intensity * 0.4 * vignette);

      // Full-screen red wash
      color.r = min(1.0, color.r + intensity * 0.15);

      // Apply brightness correction
      color.rgb *= brightness;

      gl_FragColor = color;
    }
  `,
}

export function createDamageShaderPass(): ShaderPass {
  return new ShaderPass(DamageShaderDef)
}

/** Decay intensity toward 0. Call every frame with deltaTime. Returns new intensity. */
export function decayDamageIntensity(current: number, deltaTime: number): number {
  const DECAY_RATE = 1.6 // reaches zero in ~0.6s from intensity 1.0
  return Math.max(0, current - deltaTime * DECAY_RATE)
}
