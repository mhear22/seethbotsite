/**
 * Pure unit tests for WaveManager — DB-free survival wave state machine.
 *
 * Determinism: every test seeds SeededRNG with a fixed value, so spawn ids,
 * seeds, and score math are fully reproducible.
 */
import { WaveManager, WaveHumanView } from '../WaveManager';
import { SeededRNG } from '../SeededRNG';
import {
  SURVIVAL,
  survivalStatScaleForWave,
} from '../../shared/constants/GameConstants';

const SPAWN: [number, number, number] = [0, 0, 25];

function makeManager(startWave?: number): WaveManager {
  return new WaveManager({
    matchId: 'match-test',
    rng: new SeededRNG(12345),
    spawnPosition: SPAWN,
    startWave,
  });
}

/** A simple mutable human view for repair/defeat tests. */
function makeHuman(playerId: string, health: number, maxHealth = 100): WaveHumanView & {
  _health: number;
} {
  const h = {
    playerId,
    _health: health,
    getHealth() {
      return this._health;
    },
    getMaxHealth() {
      return maxHealth;
    },
    heal(amount: number) {
      this._health = Math.min(maxHealth, this._health + amount);
      return this._health;
    },
  };
  return h;
}

describe('WaveManager — difficulty escalation', () => {
  it('starts at the base difficulty tier on wave 1', () => {
    const wm = makeManager();
    expect(wm.getWave()).toBe(1);
    expect(wm.currentDifficulty()).toBe(SURVIVAL.BASE_DIFFICULTY); // 'medium'
    expect(wm.getPhase()).toBe('active');
  });

  it('escalates difficulty up the ladder as waves progress', () => {
    // base = medium (index 2), steps up every DIFFICULTY_STEP_WAVES (2) waves.
    // wave 1-2 => medium, wave 3-4 => hard, wave 5+ => boss (capped).
    const expected: Record<number, string> = {
      1: 'medium',
      2: 'medium',
      3: 'hard',
      4: 'hard',
      5: 'boss',
      6: 'boss',
      99: 'boss', // capped at top tier
    };
    for (const [waveStr, tier] of Object.entries(expected)) {
      const wm = makeManager(Number(waveStr));
      expect(wm.currentDifficulty()).toBe(tier);
    }
  });

  it('difficulty is monotonically non-decreasing across consecutive waves', () => {
    const order = SURVIVAL.DIFFICULTY_ORDER as readonly string[];
    let prevIdx = -1;
    for (let wave = 1; wave <= 12; wave++) {
      const wm = makeManager(wave);
      const idx = order.indexOf(wm.currentDifficulty());
      expect(idx).toBeGreaterThanOrEqual(prevIdx);
      prevIdx = idx;
    }
  });
});

describe('WaveManager — stat scale growth', () => {
  it('wave 1 scale is 1.0 and grows linearly per wave', () => {
    expect(makeManager(1).currentStatScale()).toBeCloseTo(1.0, 6);
    expect(makeManager(2).currentStatScale()).toBeCloseTo(
      1 + SURVIVAL.STAT_SCALE_PER_WAVE,
      6,
    );
    expect(makeManager(5).currentStatScale()).toBeCloseTo(
      survivalStatScaleForWave(5),
      6,
    );
  });

  it('stat scale strictly increases each wave', () => {
    let prev = 0;
    for (let wave = 1; wave <= 10; wave++) {
      const s = makeManager(wave).currentStatScale();
      expect(s).toBeGreaterThan(prev);
      prev = s;
    }
  });

  it('scaled spawn maxHealth grows with the wave', () => {
    const w1 = makeManager(1).buildCurrentWaveSpawns()[0]; // medium base 300, scale 1.0
    const w3 = makeManager(3).buildCurrentWaveSpawns()[0]; // hard base 400, scale 1.24
    expect(w1.maxHealth).toBe(300);
    // hard base 400 * (1 + 2*0.12) = 400 * 1.24 = 496
    expect(w3.maxHealth).toBe(Math.round(400 * survivalStatScaleForWave(3)));
    expect(w3.maxHealth).toBeGreaterThan(w1.maxHealth);
  });
});

describe('WaveManager — spawn descriptors & previews', () => {
  it('builds ENEMIES_PER_WAVE spawns with the documented id format', () => {
    const wm = makeManager(3);
    const spawns = wm.buildCurrentWaveSpawns();
    expect(spawns).toHaveLength(SURVIVAL.ENEMIES_PER_WAVE);
    // aiId format: ai_<matchId>_w<wave>_<index>
    expect(spawns[0].id).toBe('ai_match-test_w3_0');
    expect(spawns[0].wave).toBe(3);
    expect(spawns[0].difficulty).toBe('hard');
    expect(spawns[0].position).toEqual(SPAWN);
    expect(spawns[0].position).not.toBe(SPAWN); // copied, not aliased
  });

  it('spawn aiSeed is deterministic for a fixed RNG seed', () => {
    const a = makeManager(1).buildCurrentWaveSpawns()[0].aiSeed;
    const b = makeManager(1).buildCurrentWaveSpawns()[0].aiSeed;
    expect(a).toBe(b);
    expect(Number.isInteger(a)).toBe(true);
  });

  it('previews mirror spawn id/name/difficulty/loadout', () => {
    const wm = makeManager(2);
    const spawns = wm.buildCurrentWaveSpawns();
    const previews = wm.buildPreviews(spawns);
    expect(previews).toHaveLength(spawns.length);
    expect(previews[0]).toEqual({
      id: spawns[0].id,
      name: spawns[0].name,
      difficulty: spawns[0].difficulty,
      loadout: spawns[0].loadout,
    });
  });
});

describe('WaveManager — AI death advances wave + repairs players', () => {
  it('allAIDead reports correctly', () => {
    const wm = makeManager();
    expect(wm.allAIDead([])).toBe(true); // empty => all dead
    expect(wm.allAIDead([0, 0])).toBe(true);
    expect(wm.allAIDead([0, 5])).toBe(false);
    expect(wm.allAIDead([100])).toBe(false);
  });

  it('completeWave advances the wave and enters the between-wave phase', () => {
    const wm = makeManager(1);
    const human = makeHuman('p1', 100, 100);
    const before = wm.getWave();
    const result = wm.completeWave([human]);

    expect(result.wave).toBe(before); // result reports the CLEARED wave
    expect(wm.getWave()).toBe(before + 1); // counter advanced
    expect(wm.getPhase()).toBe('between_waves');
    expect(wm.isBetweenWaves()).toBe(true);
    expect(result.repairDurationMs).toBe(SURVIVAL.BETWEEN_WAVE_DURATION);
  });

  it('repairs each living human by REPAIR_FRACTION of max health (clamped)', () => {
    const wm = makeManager(1);
    const damaged = makeHuman('p1', 50, 100);
    const nearFull = makeHuman('p2', 90, 100);

    const result = wm.completeWave([damaged, nearFull]);

    // p1: 50 + 35 = 85
    const r1 = result.repair.find((r) => r.playerId === 'p1')!;
    expect(r1.newHealth).toBe(85);
    expect(r1.healthRestored).toBe(35);
    expect(damaged.getHealth()).toBe(85);

    // p2: 90 + 35 clamped to 100 => restored 10
    const r2 = result.repair.find((r) => r.playerId === 'p2')!;
    expect(r2.newHealth).toBe(100);
    expect(r2.healthRestored).toBe(10);
    expect(nearFull.getHealth()).toBe(100);
  });

  it('does not repair dead humans', () => {
    const wm = makeManager(1);
    const alive = makeHuman('p1', 40, 100);
    const dead = makeHuman('p2', 0, 100);

    const result = wm.completeWave([alive, dead]);

    expect(result.repair.map((r) => r.playerId)).toEqual(['p1']);
    expect(dead.getHealth()).toBe(0);
  });

  it('tickBetweenWaves stages the next wave only after the timer elapses', () => {
    const wm = makeManager(1);
    wm.completeWave([makeHuman('p1', 100, 100)]); // wave -> 2, between_waves

    // Partial elapse: still staging, no spawns.
    expect(wm.tickBetweenWaves(SURVIVAL.BETWEEN_WAVE_DURATION - 1)).toBeNull();
    expect(wm.isBetweenWaves()).toBe(true);

    // Cross the threshold: returns the next wave's spawns + re-enters active.
    const spawns = wm.tickBetweenWaves(2);
    expect(spawns).not.toBeNull();
    expect(spawns!).toHaveLength(SURVIVAL.ENEMIES_PER_WAVE);
    expect(spawns![0].wave).toBe(2);
    expect(spawns![0].id).toBe('ai_match-test_w2_0');
    expect(wm.getPhase()).toBe('active');

    // Subsequent ticks are a no-op now that we're active again.
    expect(wm.tickBetweenWaves(5000)).toBeNull();
  });

  it('tickBetweenWaves is a no-op while active', () => {
    const wm = makeManager(1);
    expect(wm.getPhase()).toBe('active');
    expect(wm.tickBetweenWaves(99999)).toBeNull();
  });
});

describe('WaveManager — survival score accrual', () => {
  it('score starts at zero and accumulates across waves', () => {
    const wm = makeManager(1);
    expect(wm.getScore()).toBe(0);

    // Wave 1 cleared at full health: 200 + 1*100 + 1.0*200 = 500
    const r1 = wm.completeWave([makeHuman('p1', 100, 100)]);
    expect(r1.waveScore).toBe(500);
    expect(r1.totalScore).toBe(500);
    expect(wm.getScore()).toBe(500);

    // Advance to wave 2 then clear at full health: 200 + 2*100 + 200 = 600.
    wm.tickBetweenWaves(SURVIVAL.BETWEEN_WAVE_DURATION);
    const r2 = wm.completeWave([makeHuman('p2', 100, 100)]);
    expect(r2.waveScore).toBe(600);
    expect(r2.totalScore).toBe(1100); // accumulated
    expect(wm.getScore()).toBe(1100);
  });

  it('lower remaining health yields a lower wave score', () => {
    const full = makeManager(1).completeWave([makeHuman('p1', 100, 100)]).waveScore;
    const hurt = makeManager(1).completeWave([makeHuman('p1', 0, 100)]).waveScore;
    // full: 200 + 100 + 200 = 500 ; hurt: 200 + 100 + 0 = 300
    expect(full).toBe(500);
    expect(hurt).toBe(300);
    expect(hurt).toBeLessThan(full);
  });
});

describe('WaveManager — survival defeat', () => {
  it('allHumansDead is true only when every human is dead', () => {
    const wm = makeManager();
    expect(wm.allHumansDead([makeHuman('p1', 0, 100)])).toBe(true);
    expect(wm.allHumansDead([makeHuman('p1', 1, 100)])).toBe(false);
    expect(
      wm.allHumansDead([makeHuman('p1', 0, 100), makeHuman('p2', 10, 100)]),
    ).toBe(false);
    expect(
      wm.allHumansDead([makeHuman('p1', 0, 100), makeHuman('p2', 0, 100)]),
    ).toBe(true);
    expect(wm.allHumansDead([])).toBe(true); // no humans => defeat
  });

  it('markDefeat moves the run into the defeat phase', () => {
    const wm = makeManager();
    expect(wm.getPhase()).toBe('active');
    wm.markDefeat();
    expect(wm.getPhase()).toBe('defeat');
    // Defeat halts wave staging.
    expect(wm.tickBetweenWaves(99999)).toBeNull();
  });
});
