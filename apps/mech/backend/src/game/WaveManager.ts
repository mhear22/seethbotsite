/**
 * WaveManager — pure, DB-free survival wave state machine.
 *
 * Owns: current wave, difficulty tier escalation, per-wave stat scale, AI mech
 * spawn descriptors, AI-death -> wave-complete -> between-wave repair -> next
 * wave, survival score, and the survival end condition (all humans destroyed).
 *
 * Deterministic: takes a SeededRNG; no Math.random()/Date.now(). All timing is
 * driven by deltaTime passed to tick(). No prisma / DB imports — unit-testable.
 *
 * NOTE: This module DESCRIBES spawns and decides state transitions. It does NOT
 * own MechEntity/projectile objects; MatchInstance creates the actual server
 * mech entity from the WaveSpawn descriptor and feeds death/health back in.
 */

import type {
  MechLoadout,
  WeaponConfig,
  AbilityConfig,
  AIDifficultyTier,
  AIMechPreview,
  WaveRepairInfo,
} from '../shared/types/NetworkMessages';
import {
  MECH,
  COMBAT,
  SURVIVAL,
  survivalStatScaleForWave,
  survivalDifficultyIndexForWave,
} from '../shared/constants/GameConstants';
import { SeededRNG } from './SeededRNG';

/** Phase of the survival run. */
export type WavePhase = 'active' | 'between_waves' | 'defeat';

/** Descriptor the host (MatchInstance) uses to materialize an AI mech entity. */
export interface WaveSpawn {
  id: string;
  name: string;
  difficulty: AIDifficultyTier;
  wave: number;
  loadout: MechLoadout;
  /** Scaled max health for this wave's archetype. */
  maxHealth: number;
  /** Movement speed for this AI (units/s). */
  moveSpeed: number;
  /** Spawn position. */
  position: [number, number, number];
  /** Seed for this AI's deterministic ServerEnemyAI instance. */
  aiSeed: number;
}

/** Minimal human-player view the WaveManager needs for repair + defeat checks. */
export interface WaveHumanView {
  playerId: string;
  /** Current health (mutated externally by combat). */
  getHealth(): number;
  /** Max health for this human. */
  getMaxHealth(): number;
  /** Restore `amount` health (clamped to max by the host). Returns new health. */
  heal(amount: number): number;
}

/** Per-difficulty archetype: base health + weapon/ability ids + speed. */
interface AIArchetype {
  name: string;
  baseHealth: number;
  moveSpeed: number;
  leftWeapon: keyof typeof COMBAT.WEAPONS;
  rightWeapon: keyof typeof COMBAT.WEAPONS;
  ability: AbilityConfig['type'];
  hasJumpJets: boolean;
}

/**
 * Server-side archetypes mirroring the client difficulty presets, expressed in
 * the on-wire MechLoadout vocabulary (WeaponConfig types from COMBAT.WEAPONS).
 */
const ARCHETYPES: Record<AIDifficultyTier, AIArchetype> = {
  tutorial: { name: 'Training Bot',  baseHealth: 150, moveSpeed: 22, leftWeapon: 'autocannon', rightWeapon: 'autocannon', ability: 'shield', hasJumpJets: false },
  easy:     { name: 'Scout Mech',    baseHealth: 200, moveSpeed: 30, leftWeapon: 'autocannon', rightWeapon: 'laser',      ability: 'speed_boost', hasJumpJets: true },
  medium:   { name: 'Assault Mech',  baseHealth: 300, moveSpeed: 28, leftWeapon: 'laser',      rightWeapon: 'railgun',    ability: 'shield', hasJumpJets: false },
  hard:     { name: 'Heavy Mech',    baseHealth: 400, moveSpeed: 26, leftWeapon: 'missile_launcher', rightWeapon: 'railgun', ability: 'repair', hasJumpJets: true },
  boss:     { name: 'TITAN Destroyer', baseHealth: 600, moveSpeed: 28, leftWeapon: 'plasma_cannon', rightWeapon: 'railgun', ability: 'shield', hasJumpJets: true },
};

const BASE_DIFFICULTY_INDEX = SURVIVAL.DIFFICULTY_ORDER.indexOf(SURVIVAL.BASE_DIFFICULTY); // 2 ('medium')

function buildWeaponConfig(type: keyof typeof COMBAT.WEAPONS, scale: number): WeaponConfig {
  const w = COMBAT.WEAPONS[type];
  return {
    type,
    name: type,
    damage: Math.round(w.damage * (1 + (scale - 1) * 0.5)), // damage scales at half the stat rate
    fireRate: w.fireRate,
    projectileSpeed: w.projectileSpeed,
    energyCost: w.energyCost,
    cooldown: w.cooldown,
  };
}

function buildAbilityConfig(type: AbilityConfig['type']): AbilityConfig {
  return { type, name: type, duration: 3000, cooldown: 10000, energyCost: 30 };
}

export class WaveManager {
  private wave: number;
  private phase: WavePhase = 'active';
  private score = 0;
  private rng: SeededRNG;
  private matchId: string;

  /** ms remaining in the between-wave staging interval. */
  private betweenWaveRemaining = 0;
  /** Spawn descriptor produced for the next wave (consumed by the host). */
  private pendingSpawn: WaveSpawn | null = null;

  // Spawn geometry.
  private spawnPosition: [number, number, number];

  constructor(opts: {
    matchId: string;
    rng: SeededRNG;
    spawnPosition: [number, number, number];
    startWave?: number;
  }) {
    this.matchId = opts.matchId;
    this.rng = opts.rng;
    this.spawnPosition = opts.spawnPosition;
    this.wave = opts.startWave ?? SURVIVAL.START_WAVE;
  }

  getWave(): number { return this.wave; }
  getPhase(): WavePhase { return this.phase; }
  getScore(): number { return this.score; }
  isBetweenWaves(): boolean { return this.phase === 'between_waves'; }

  /** Difficulty tier for the current wave. */
  currentDifficulty(): AIDifficultyTier {
    const idx = survivalDifficultyIndexForWave(BASE_DIFFICULTY_INDEX, this.wave);
    return SURVIVAL.DIFFICULTY_ORDER[idx];
  }

  /** Stat scale for the current wave. */
  currentStatScale(): number {
    return survivalStatScaleForWave(this.wave);
  }

  /**
   * Build the spawn descriptor(s) for the current wave. ENEMIES_PER_WAVE is 1
   * today; returns an array for forward-compatibility.
   */
  buildCurrentWaveSpawns(): WaveSpawn[] {
    const difficulty = this.currentDifficulty();
    const scale = this.currentStatScale();
    const archetype = ARCHETYPES[difficulty];
    const spawns: WaveSpawn[] = [];

    for (let i = 0; i < SURVIVAL.ENEMIES_PER_WAVE; i++) {
      const id = `ai_${this.matchId}_w${this.wave}_${i}`;
      const loadout: MechLoadout = {
        chassisType: difficulty,
        leftWeapon: buildWeaponConfig(archetype.leftWeapon, scale),
        rightWeapon: buildWeaponConfig(archetype.rightWeapon, scale),
        ability: buildAbilityConfig(archetype.ability),
      };
      spawns.push({
        id,
        name: `${archetype.name} W${this.wave}`,
        difficulty,
        wave: this.wave,
        loadout,
        maxHealth: Math.round(archetype.baseHealth * scale),
        moveSpeed: archetype.moveSpeed,
        position: [...this.spawnPosition] as [number, number, number],
        aiSeed: this.rng.next() * 0xffffffff >>> 0,
      });
    }
    return spawns;
  }

  /** Lightweight preview list for MatchFound / wave_started events. */
  buildPreviews(spawns: WaveSpawn[]): AIMechPreview[] {
    return spawns.map((s) => ({
      id: s.id,
      name: s.name,
      difficulty: s.difficulty,
      loadout: s.loadout,
    }));
  }

  /** True when every AI in the supplied set is dead (health <= 0). */
  allAIDead(aiHealths: number[]): boolean {
    if (aiHealths.length === 0) return true;
    return aiHealths.every((h) => h <= 0);
  }

  /** True when every human is dead -> survival defeat. */
  allHumansDead(humans: WaveHumanView[]): boolean {
    if (humans.length === 0) return true;
    return humans.every((h) => h.getHealth() <= 0);
  }

  /**
   * Called when the active wave's AI are all dead. Awards score, applies the
   * between-wave repair to humans, advances the wave counter, and stages the
   * next spawn. Returns the completion info (for the wave_complete event).
   *
   * Score model mirrors the client's endBattle victory math, condensed:
   *   waveScore = 200 (clear) + wave*100 (depth) + sum(human health fraction)*200
   */
  completeWave(humans: WaveHumanView[]): {
    wave: number;
    waveScore: number;
    totalScore: number;
    repair: WaveRepairInfo[];
    repairDurationMs: number;
  } {
    const clearedWave = this.wave;

    // --- Score. ---
    let healthBonus = 0;
    for (const h of humans) {
      const max = h.getMaxHealth() || 1;
      healthBonus += (Math.max(0, h.getHealth()) / max);
    }
    const waveScore = Math.round(200 + clearedWave * 100 + healthBonus * 200);
    this.score += waveScore;

    // --- Repair humans. ---
    const repair: WaveRepairInfo[] = [];
    for (const h of humans) {
      if (h.getHealth() <= 0) continue; // dead humans aren't repaired
      const before = h.getHealth();
      const amount = h.getMaxHealth() * SURVIVAL.REPAIR_FRACTION;
      const newHealth = h.heal(amount);
      repair.push({
        playerId: h.playerId,
        healthRestored: Math.max(0, newHealth - before),
        newHealth,
      });
    }

    // --- Advance + stage next wave. ---
    this.wave = clearedWave + 1;
    this.phase = 'between_waves';
    this.betweenWaveRemaining = SURVIVAL.BETWEEN_WAVE_DURATION;
    this.pendingSpawn = null; // built when the timer elapses (uses new wave)

    return {
      wave: clearedWave,
      waveScore,
      totalScore: this.score,
      repair,
      repairDurationMs: SURVIVAL.BETWEEN_WAVE_DURATION,
    };
  }

  /**
   * Advance the between-wave timer. Returns the spawn descriptors when the
   * staging interval elapses (caller materializes them + re-enters 'active'),
   * else null. No-op outside the between-wave phase.
   */
  tickBetweenWaves(deltaTimeMs: number): WaveSpawn[] | null {
    if (this.phase !== 'between_waves') return null;
    this.betweenWaveRemaining -= deltaTimeMs;
    if (this.betweenWaveRemaining > 0) return null;

    this.phase = 'active';
    return this.buildCurrentWaveSpawns();
  }

  /** Mark the run as a defeat (all humans dead). */
  markDefeat(): void {
    this.phase = 'defeat';
  }
}
