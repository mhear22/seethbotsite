/**
 * Deterministic seeded RNG (mulberry32) for server-side survival simulation.
 *
 * The per-tick survival sim (ServerEnemyAI, WaveManager) MUST be deterministic:
 * no Math.random() / Date.now(). All randomness flows through an instance of
 * this generator seeded from a fixed value (e.g. derived from the matchId), so
 * a given seed + identical inputs always produce identical output. This keeps
 * the modules unit-testable without a DB and reproducible across runs.
 */
export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    // Ensure a non-zero 32-bit unsigned state.
    this.state = (seed >>> 0) || 0x9e3779b9;
  }

  /** Next float in [0, 1). */
  next(): number {
    // mulberry32
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Next float in [min, max). */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** Returns true with the given probability (0..1). */
  chance(p: number): boolean {
    return this.next() < p;
  }

  /** Derive a stable seed integer from an arbitrary string (e.g. matchId). */
  static seedFromString(s: string): number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
}
