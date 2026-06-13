import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as THREE from 'three'
import { EnemyAI, type IncomingThreat } from '../EnemyAI'
import type { MechEntity } from '../MechEntity'

/**
 * Minimal stand-in for a MechEntity that exposes only the fields/methods the
 * EnemyAI actually reads. We avoid constructing a real MechEntity so the tests
 * stay free of three.js mesh assembly / async model loading.
 */
function makeFakeMech(opts: {
  pos?: THREE.Vector3
  vel?: THREE.Vector3
  rotationY?: number
  health?: number
  maxHealth?: number
  speed?: number
  accuracy?: number
  arm?: THREE.Vector3
  core?: THREE.Vector3
  hasJumpJets?: boolean
}): MechEntity {
  const position = (opts.pos ?? new THREE.Vector3()).clone()
  const armPos = opts.arm ?? position.clone()
  const corePos = opts.core ?? position.clone()
  const fake = {
    position,
    rotation: new THREE.Euler(0, opts.rotationY ?? 0, 0),
    velocity: (opts.vel ?? new THREE.Vector3()).clone(),
    isJumping: false,
    weightPenalty: 1,
    stats: {
      currentHealth: opts.health ?? 300,
      maxHealth: opts.maxHealth ?? 300,
      speed: opts.speed ?? 60,
      accuracy: opts.accuracy ?? 50,
    },
    loadout: { rack: opts.hasJumpJets ? { id: 'rack-jump-jets' } : null },
    getCorePosition: () => corePos.clone(),
    getArmPosition: (_arm: 'left' | 'right') => armPos.clone(),
  }
  return fake as unknown as MechEntity
}

describe('EnemyAI.setDifficulty', () => {
  it('selects distinct profiles across difficulty tiers', () => {
    // Two AIs at the extremes of the ladder must behave differently. We can't
    // read the private profile directly, but the boss leads shots harder and is
    // far more accurate than the tutorial bot, both of which are observable.
    const projectileSpeed = 40

    // Player moving fast laterally so the lead offset is large and measurable.
    const playerVel = new THREE.Vector3(20, 0, 0)
    const playerPos = new THREE.Vector3(0, 0, 0)
    const enemyPos = new THREE.Vector3(0, 0, 30)

    const lead = (difficulty: any): number => {
      const ai = new EnemyAI(difficulty)
      const enemy = makeFakeMech({ pos: enemyPos })
      // Seed the AI's player-velocity estimate by stepping update twice so the
      // smoothed estimate picks up the lateral motion.
      const p0 = makeFakeMech({ pos: playerPos })
      ai.update(enemy, p0, 0.016)
      const p1 = makeFakeMech({ pos: playerPos.clone().add(playerVel.clone().multiplyScalar(0.016)) })
      // Many updates to converge the smoothed estimate toward playerVel.
      for (let i = 1; i < 60; i++) {
        const pp = makeFakeMech({
          pos: playerPos.clone().add(playerVel.clone().multiplyScalar(0.016 * i)),
        })
        ai.update(enemy, pp, 0.016)
      }
      void p1
      // aimSkill 0 cone is undesirable here; stub randomness so cone is centered.
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
      const finalPlayer = makeFakeMech({
        pos: playerPos.clone().add(playerVel.clone().multiplyScalar(0.016 * 60)),
        core: playerPos.clone().add(playerVel.clone().multiplyScalar(0.016 * 60)),
      })
      const aim = ai.computeAimPoint(enemy, finalPlayer, projectileSpeed)
      const lateralLead = aim.x - finalPlayer.getCorePosition().x
      ;(Math.random as any).mockRestore?.()
      return lateralLead
    }

    const bossLead = lead('boss')
    const tutorialLead = lead('tutorial')

    // Boss leadFactor (1.0) >> tutorial leadFactor (0.2), so the boss aims much
    // further ahead of a laterally-moving target.
    expect(Math.abs(bossLead)).toBeGreaterThan(Math.abs(tutorialLead))
  })
})

describe('EnemyAI.computeAimPoint leading', () => {
  let randSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Center the aim-error cone (0.5 - 0.5 = 0 axis, angle factor irrelevant) so
    // the returned point reflects pure leading with no random spread.
    randSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })
  afterEach(() => {
    randSpy.mockRestore()
  })

  function leadingAim(playerVel: THREE.Vector3) {
    const ai = new EnemyAI('boss') // leadFactor 1.0 -> strongest, clearest lead
    const enemyPos = new THREE.Vector3(0, 0, 40)
    const playerStart = new THREE.Vector3(0, 0, 0)
    const enemy = makeFakeMech({ pos: enemyPos, arm: enemyPos.clone() })

    // Drive update() so the AI estimates the player's velocity. Converge the
    // smoothed estimate over many frames.
    const dt = 0.016
    for (let i = 0; i < 80; i++) {
      const pos = playerStart.clone().add(playerVel.clone().multiplyScalar(dt * i))
      ai.update(enemy, makeFakeMech({ pos }), dt)
    }

    const finalPos = playerStart.clone().add(playerVel.clone().multiplyScalar(dt * 80))
    const player = makeFakeMech({ pos: finalPos, core: finalPos })
    const aim = ai.computeAimPoint(enemy, player, 40)
    return { aim, current: player.getCorePosition() }
  }

  it('offsets the aim point ahead of a laterally-moving target toward its velocity', () => {
    const { aim, current } = leadingAim(new THREE.Vector3(15, 0, 0)) // moving +x
    // The aim point should be shifted in +x (the direction of travel).
    expect(aim.x).toBeGreaterThan(current.x + 0.5)
  })

  it('returns ~current position when the target is stationary', () => {
    const { aim, current } = leadingAim(new THREE.Vector3(0, 0, 0))
    expect(aim.distanceTo(current)).toBeLessThan(0.05)
  })
})

describe('EnemyAI aim-error cone width vs aimSkill', () => {
  it('produces a wider angular spread at low aimSkill than at high aimSkill', () => {
    // For each difficulty, sample the angle between the perfect aim direction
    // and the actual returned aim direction across many random draws, then
    // compare the maximum spread. Low aimSkill (tutorial) must spread more than
    // high aimSkill (boss). Randomness drives the cone, so we sample many times
    // with a non-stubbed Math.random and compare aggregate magnitude.
    const projectileSpeed = 1e6 // effectively no lead, so dir == toward target

    function maxSpread(difficulty: any): number {
      const ai = new EnemyAI(difficulty)
      const enemyPos = new THREE.Vector3(0, 0, 0)
      const targetPos = new THREE.Vector3(0, 0, 20)
      const enemy = makeFakeMech({ pos: enemyPos, arm: enemyPos.clone() })
      // No velocity estimate -> playerVelEstimate stays ~0 -> negligible lead.
      const perfectDir = targetPos.clone().sub(enemyPos).normalize()
      let maxAngle = 0
      for (let i = 0; i < 400; i++) {
        const player = makeFakeMech({ pos: targetPos, core: targetPos })
        const aim = ai.computeAimPoint(enemy, player, projectileSpeed)
        const dir = aim.clone().sub(enemyPos).normalize()
        const angle = perfectDir.angleTo(dir)
        if (angle > maxAngle) maxAngle = angle
      }
      return maxAngle
    }

    const tutorialSpread = maxSpread('tutorial') // aimSkill 0.15 -> wide cone
    const bossSpread = maxSpread('boss') // aimSkill 0.95 -> near-zero cone

    expect(tutorialSpread).toBeGreaterThan(bossSpread)
    // Boss cone half-angle is 0.18 * (1 - 0.95) = 0.009 rad — very tight.
    expect(bossSpread).toBeLessThan(0.02)
    // Tutorial cone half-angle is 0.18 * (1 - 0.15) = 0.153 rad — clearly wide.
    expect(tutorialSpread).toBeGreaterThan(0.05)
  })
})

describe('EnemyAI incoming-dodge detection', () => {
  /**
   * detectIncomingDodge is private, but it drives an observable behaviour: when
   * a threat is on an intercept course the AI commits to a sidestep dodge that
   * perturbs the enemy's velocity. We force the dodge roll to always pass by
   * stubbing Math.random low, then check whether the enemy gains sideways speed
   * (relative to a no-threat control run).
   */
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function runWithThreat(threats: IncomingThreat[]): number {
    // Stub randomness: 0 makes the evade roll (Math.random < evadeFrequency)
    // always succeed and keeps profile-driven jitter deterministic.
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const ai = new EnemyAI('boss') // evadeFrequency 0.9, reactionTime 0.08
    const enemy = makeFakeMech({ pos: new THREE.Vector3(0, 0, 0) })
    const player = makeFakeMech({ pos: new THREE.Vector3(0, 0, 30) })
    ai.feedThreats(threats)
    // Step several frames so the reaction timer elapses and the dodge commits.
    let maxLateral = 0
    for (let i = 0; i < 30; i++) {
      ai.feedThreats(threats)
      ai.update(enemy, player, 0.05)
      // Lateral component is along x here (threat travels along z toward enemy).
      maxLateral = Math.max(maxLateral, Math.abs(enemy.velocity.x))
    }
    return maxLateral
  }

  it('flags/commits a dodge for a projectile on an intercept course', () => {
    // Projectile at (0,2.5,-15) moving +z straight at the enemy center (0,2.5,0).
    const intercept: IncomingThreat = {
      position: new THREE.Vector3(0, 2.5, -15),
      velocity: new THREE.Vector3(0, 0, 40),
    }
    const lateral = runWithThreat([intercept])
    // The committed sidestep is perpendicular (x-axis) -> measurable x velocity.
    expect(lateral).toBeGreaterThan(1)
  })

  it('does not dodge a projectile moving away from the enemy', () => {
    // Projectile behind the enemy moving further away (-z), never approaching.
    const awayThreat: IncomingThreat = {
      position: new THREE.Vector3(0, 2.5, 15),
      velocity: new THREE.Vector3(0, 0, 40), // heading +z, enemy is at z=0 behind it
    }
    const lateral = runWithThreat([awayThreat])
    // With no intercept the AI only strafes/roams; with Math.random stubbed to 0
    // the strafe direction and waypoint are deterministic and produce far less
    // lateral velocity than a committed 2.5x dodge impulse.
    expect(lateral).toBeLessThan(1)
  })
})
