/**
 * ProjectileSystem Tests
 * Tests for projectile lifecycle, physics, collision detection, and networking state
 */

import { ProjectileSystem } from '../../src/game/ProjectileSystem';
import { MechEntity } from '../../src/game/MechEntity';
import { MechLoadout } from '../../src/shared/types/NetworkMessages';
import { COMBAT, PHYSICS } from '../../src/shared/constants/GameConstants';

const createLoadout = (): MechLoadout => ({
  chassisType: 'standard',
  leftWeapon: {
    type: 'autocannon',
    name: 'AC-20',
    damage: 8,
    fireRate: 300,
    projectileSpeed: 100,
    energyCost: 5,
    cooldown: 200,
  },
  rightWeapon: {
    type: 'laser',
    name: 'Pulse Laser',
    damage: 12,
    fireRate: 120,
    projectileSpeed: 200,
    energyCost: 8,
    cooldown: 500,
  },
  ability: {
    type: 'shield',
    name: 'Energy Shield',
    duration: 5000,
    cooldown: 30000,
    energyCost: 50,
  },
});

describe('ProjectileSystem', () => {
  let system: ProjectileSystem;

  beforeEach(() => {
    system = new ProjectileSystem();
  });

  describe('spawnProjectile', () => {
    it('should create a projectile and return its ID', () => {
      const id = system.spawnProjectile(
        'player1',
        [0, 5, 0],
        [1, 0, 0],
        'autocannon',
        8
      );

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id).toContain('proj_');
    });

    it('should generate unique IDs for each projectile', () => {
      const id1 = system.spawnProjectile('p1', [0, 5, 0], [1, 0, 0], 'autocannon', 8);
      const id2 = system.spawnProjectile('p1', [0, 5, 0], [1, 0, 0], 'autocannon', 8);

      expect(id1).not.toBe(id2);
    });

    it('should increment projectile count', () => {
      expect(system.getProjectileCount()).toBe(0);

      system.spawnProjectile('p1', [0, 5, 0], [1, 0, 0], 'autocannon', 8);
      expect(system.getProjectileCount()).toBe(1);

      system.spawnProjectile('p1', [0, 5, 0], [0, 0, 1], 'laser', 12);
      expect(system.getProjectileCount()).toBe(2);
    });

    it('should normalize direction vector', () => {
      system.spawnProjectile('p1', [0, 5, 0], [3, 0, 4], 'autocannon', 8);

      const states = system.getProjectileStates();
      expect(states).toHaveLength(1);

      // Direction [3,0,4] normalized = [0.6, 0, 0.8]
      // With autocannon speed 100: velocity = [60, 0, 80]
      const speed = COMBAT.WEAPONS.autocannon.projectileSpeed;
      expect(states[0].velocity[0]).toBeCloseTo(0.6 * speed);
      expect(states[0].velocity[1]).toBeCloseTo(0);
      expect(states[0].velocity[2]).toBeCloseTo(0.8 * speed);
    });

    it('should use weapon projectile speed from constants', () => {
      system.spawnProjectile('p1', [0, 5, 0], [1, 0, 0], 'laser', 12);

      const states = system.getProjectileStates();
      const laserSpeed = COMBAT.WEAPONS.laser.projectileSpeed;

      expect(states[0].velocity[0]).toBeCloseTo(laserSpeed);
    });

    it('should use weapon projectile type from constants', () => {
      system.spawnProjectile('p1', [0, 5, 0], [1, 0, 0], 'autocannon', 8);
      system.spawnProjectile('p1', [0, 5, 0], [1, 0, 0], 'laser', 12);

      const states = system.getProjectileStates();
      const autocannon = states.find(s => s.damage === 8);
      const laser = states.find(s => s.damage === 12);

      expect(autocannon?.type).toBe('ballistic');
      expect(laser?.type).toBe('energy');
    });

    it('should fall back to defaults for unknown weapon types', () => {
      system.spawnProjectile('p1', [0, 5, 0], [1, 0, 0], 'unknown_weapon', 10);

      const states = system.getProjectileStates();
      expect(states).toHaveLength(1);
      expect(states[0].type).toBe('ballistic'); // Default type
    });

    it('should store the correct owner and damage', () => {
      system.spawnProjectile('player42', [10, 5, 20], [0, 0, 1], 'autocannon', 25);

      const states = system.getProjectileStates();
      expect(states[0].ownerId).toBe('player42');
      expect(states[0].damage).toBe(25);
    });

    it('should store the spawn position', () => {
      system.spawnProjectile('p1', [10, 15, 20], [1, 0, 0], 'autocannon', 8);

      const states = system.getProjectileStates();
      expect(states[0].position).toEqual([10, 15, 20]);
    });
  });

  describe('update', () => {
    it('should move projectiles by velocity * deltaTime', () => {
      system.spawnProjectile('p1', [0, 10, 0], [1, 0, 0], 'autocannon', 8);

      const speed = COMBAT.WEAPONS.autocannon.projectileSpeed;
      const dt = 0.05; // 50ms tick
      system.update(dt);

      const states = system.getProjectileStates();
      expect(states[0].position[0]).toBeCloseTo(speed * dt);
      expect(states[0].position[2]).toBeCloseTo(0);
    });

    it('should apply gravity to ballistic projectiles', () => {
      system.spawnProjectile('p1', [0, 50, 0], [1, 0, 0], 'autocannon', 8);

      const dt = 0.05;
      system.update(dt);

      const states = system.getProjectileStates();
      // Gravity should have affected Y velocity
      expect(states[0].velocity[1]).toBeCloseTo(PHYSICS.GRAVITY * dt);
    });

    it('should NOT apply gravity to energy projectiles', () => {
      system.spawnProjectile('p1', [0, 50, 0], [1, 0, 0], 'laser', 12);

      const dt = 0.05;
      system.update(dt);

      const states = system.getProjectileStates();
      // Energy projectile should have 0 Y velocity still
      expect(states[0].velocity[1]).toBeCloseTo(0);
    });

    it('should NOT apply gravity to missile projectiles', () => {
      system.spawnProjectile('p1', [0, 50, 0], [1, 0, 0], 'missile_launcher', 20);

      const dt = 0.05;
      system.update(dt);

      const states = system.getProjectileStates();
      expect(states[0].velocity[1]).toBeCloseTo(0);
    });

    it('should remove projectiles that hit the ground (y < 0)', () => {
      // Spawn low with downward velocity
      system.spawnProjectile('p1', [0, 0.1, 0], [1, -1, 0], 'autocannon', 8);

      system.update(0.1);

      // Should be removed (position went below 0)
      expect(system.getProjectileCount()).toBe(0);
    });

    it('should remove projectiles that exceed lifetime', () => {
      // We need to mock Date.now for this
      const originalNow = Date.now;
      let currentTime = 1000000;
      Date.now = () => currentTime;

      system.spawnProjectile('p1', [0, 50, 0], [1, 0, 0], 'autocannon', 8);
      expect(system.getProjectileCount()).toBe(1);

      // Advance time past lifetime
      currentTime += COMBAT.PROJECTILE_LIFETIME + 1;
      system.update(0.05);

      expect(system.getProjectileCount()).toBe(0);

      Date.now = originalNow;
    });

    it('should keep projectiles alive within lifetime', () => {
      const originalNow = Date.now;
      let currentTime = 1000000;
      Date.now = () => currentTime;

      system.spawnProjectile('p1', [0, 50, 0], [1, 0, 0], 'autocannon', 8);

      // Advance time but stay within lifetime
      currentTime += COMBAT.PROJECTILE_LIFETIME - 100;
      system.update(0.05);

      expect(system.getProjectileCount()).toBe(1);

      Date.now = originalNow;
    });

    it('should update multiple projectiles independently', () => {
      system.spawnProjectile('p1', [0, 50, 0], [1, 0, 0], 'autocannon', 8);
      system.spawnProjectile('p2', [0, 50, 0], [0, 0, 1], 'laser', 12);

      system.update(0.05);

      const states = system.getProjectileStates();
      expect(states).toHaveLength(2);

      // First projectile moved along X
      const proj1 = states.find(s => s.damage === 8)!;
      expect(proj1.position[0]).toBeGreaterThan(0);
      expect(proj1.position[2]).toBeCloseTo(0);

      // Second projectile moved along Z
      const proj2 = states.find(s => s.damage === 12)!;
      expect(proj2.position[0]).toBeCloseTo(0);
      expect(proj2.position[2]).toBeGreaterThan(0);
    });
  });

  describe('checkCollisions', () => {
    it('should detect hit on enemy mech', () => {
      const target = new MechEntity('p2', 'Target', createLoadout(), [10, 0, 0]);

      // Spawn projectile right at the target
      system.spawnProjectile('p1', [10, 2.5, 0], [1, 0, 0], 'autocannon', 8);

      const hits = system.checkCollisions([target]);

      expect(hits).toHaveLength(1);
      expect(hits[0].hitMechId).toBe('p2');
      expect(hits[0].damage).toBe(8);
    });

    it('should NOT hit the projectile owner', () => {
      const owner = new MechEntity('p1', 'Owner', createLoadout(), [0, 0, 0]);

      // Spawn projectile at owner's position
      system.spawnProjectile('p1', [0, 2.5, 0], [1, 0, 0], 'autocannon', 8);

      const hits = system.checkCollisions([owner]);

      expect(hits).toHaveLength(0);
    });

    it('should remove projectile after hitting a mech', () => {
      const target = new MechEntity('p2', 'Target', createLoadout(), [10, 0, 0]);

      system.spawnProjectile('p1', [10, 2.5, 0], [1, 0, 0], 'autocannon', 8);
      expect(system.getProjectileCount()).toBe(1);

      system.checkCollisions([target]);

      expect(system.getProjectileCount()).toBe(0);
    });

    it('should not hit mechs that are far away', () => {
      const farMech = new MechEntity('p2', 'Far', createLoadout(), [1000, 0, 1000]);

      system.spawnProjectile('p1', [0, 2.5, 0], [1, 0, 0], 'autocannon', 8);

      const hits = system.checkCollisions([farMech]);

      expect(hits).toHaveLength(0);
      expect(system.getProjectileCount()).toBe(1); // Projectile survives
    });

    it('should return correct hit position', () => {
      const target = new MechEntity('p2', 'Target', createLoadout(), [10, 0, 0]);

      system.spawnProjectile('p1', [10, 2.5, 0], [1, 0, 0], 'autocannon', 8);

      const hits = system.checkCollisions([target]);

      expect(hits[0].position[0]).toBeCloseTo(10);
      expect(hits[0].position[1]).toBeCloseTo(2.5);
      expect(hits[0].position[2]).toBeCloseTo(0);
    });

    it('should handle multiple projectiles hitting different mechs', () => {
      const mech1 = new MechEntity('p1', 'Mech1', createLoadout(), [0, 0, 0]);
      const mech2 = new MechEntity('p2', 'Mech2', createLoadout(), [20, 0, 0]);

      // p2 shoots at p1
      system.spawnProjectile('p2', [0, 2.5, 0], [1, 0, 0], 'autocannon', 8);
      // p1 shoots at p2
      system.spawnProjectile('p1', [20, 2.5, 0], [1, 0, 0], 'laser', 12);

      const hits = system.checkCollisions([mech1, mech2]);

      expect(hits).toHaveLength(2);
      expect(hits.find(h => h.hitMechId === 'p1')).toBeDefined();
      expect(hits.find(h => h.hitMechId === 'p2')).toBeDefined();
    });

    it('should stop projectile on first hit (not pierce through)', () => {
      // Two mechs stacked at same position
      const mech1 = new MechEntity('p2', 'Front', createLoadout(), [10, 0, 0]);
      const mech2 = new MechEntity('p3', 'Back', createLoadout(), [10, 0, 0]);

      system.spawnProjectile('p1', [10, 2.5, 0], [1, 0, 0], 'autocannon', 8);

      const hits = system.checkCollisions([mech1, mech2]);

      // Should only hit one (breaks after first hit)
      expect(hits).toHaveLength(1);
    });

    it('should return empty array when no projectiles exist', () => {
      const mech = new MechEntity('p1', 'Mech', createLoadout(), [0, 0, 0]);

      const hits = system.checkCollisions([mech]);

      expect(hits).toEqual([]);
    });

    it('should return empty array when no mechs are provided', () => {
      system.spawnProjectile('p1', [0, 5, 0], [1, 0, 0], 'autocannon', 8);

      const hits = system.checkCollisions([]);

      expect(hits).toEqual([]);
    });
  });

  describe('getProjectileStates', () => {
    it('should return empty array when no projectiles exist', () => {
      expect(system.getProjectileStates()).toEqual([]);
    });

    it('should return all projectile states for networking', () => {
      system.spawnProjectile('p1', [0, 5, 0], [1, 0, 0], 'autocannon', 8);
      system.spawnProjectile('p2', [10, 5, 10], [0, 0, 1], 'laser', 12);

      const states = system.getProjectileStates();

      expect(states).toHaveLength(2);
      for (const state of states) {
        expect(state).toHaveProperty('id');
        expect(state).toHaveProperty('position');
        expect(state).toHaveProperty('velocity');
        expect(state).toHaveProperty('ownerId');
        expect(state).toHaveProperty('type');
        expect(state).toHaveProperty('damage');
      }
    });

    it('should return copies of position and velocity (not references)', () => {
      system.spawnProjectile('p1', [5, 10, 15], [1, 0, 0], 'autocannon', 8);

      const states1 = system.getProjectileStates();
      states1[0].position[0] = 999; // Mutate the returned state

      const states2 = system.getProjectileStates();
      expect(states2[0].position[0]).toBeCloseTo(5); // Original unmodified
    });
  });

  describe('removeProjectile', () => {
    it('should remove a specific projectile by ID', () => {
      const id1 = system.spawnProjectile('p1', [0, 5, 0], [1, 0, 0], 'autocannon', 8);
      const id2 = system.spawnProjectile('p1', [10, 5, 0], [0, 0, 1], 'laser', 12);

      system.removeProjectile(id1);

      expect(system.getProjectileCount()).toBe(1);
      const states = system.getProjectileStates();
      expect(states[0].id).toBe(id2);
    });

    it('should handle removing non-existent projectile gracefully', () => {
      system.spawnProjectile('p1', [0, 5, 0], [1, 0, 0], 'autocannon', 8);

      system.removeProjectile('non_existent_id');

      expect(system.getProjectileCount()).toBe(1);
    });
  });

  describe('clear', () => {
    it('should remove all projectiles', () => {
      system.spawnProjectile('p1', [0, 5, 0], [1, 0, 0], 'autocannon', 8);
      system.spawnProjectile('p2', [10, 5, 0], [0, 0, 1], 'laser', 12);
      system.spawnProjectile('p3', [20, 5, 0], [-1, 0, 0], 'railgun', 35);

      system.clear();

      expect(system.getProjectileCount()).toBe(0);
      expect(system.getProjectileStates()).toEqual([]);
    });
  });

  describe('Integration: fire → travel → hit → damage', () => {
    it('should complete a full projectile lifecycle', () => {
      const attacker = new MechEntity('p1', 'Attacker', createLoadout(), [0, 0, 0]);
      const target = new MechEntity('p2', 'Target', createLoadout(), [5, 0, 0]);

      // Fire weapon
      expect(attacker.canFireWeapon('left')).toBe(true);
      attacker.fireWeapon('left');

      const muzzle = attacker.getMuzzlePosition('left');
      const direction: [number, number, number] = [1, 0, 0]; // Toward target
      const weaponConfig = attacker.loadout.leftWeapon;

      system.spawnProjectile(
        attacker.playerId,
        muzzle,
        direction,
        weaponConfig.type,
        weaponConfig.damage
      );

      expect(system.getProjectileCount()).toBe(1);

      // Simulate travel (multiple ticks to reach target ~5 units away at 100 u/s)
      for (let i = 0; i < 10; i++) {
        system.update(0.05);
        const hits = system.checkCollisions([attacker, target]);
        if (hits.length > 0) {
          // Apply damage
          for (const hit of hits) {
            if (hit.hitMechId === target.playerId) {
              target.takeDamage(hit.damage);
            }
          }
          break;
        }
      }

      // Target should have taken damage
      expect(target.state.health).toBeLessThan(100);
      // Projectile should be removed after hit
      expect(system.getProjectileCount()).toBe(0);
      // Attacker should be on cooldown
      expect(attacker.canFireWeapon('left')).toBe(false);
    });

    it('should not allow firing again until cooldown expires', () => {
      const mech = new MechEntity('p1', 'Player', createLoadout(), [0, 0, 0]);

      mech.fireWeapon('left');
      expect(mech.canFireWeapon('left')).toBe(false);

      // Partially tick cooldown
      mech.updateCooldowns(0.1);
      expect(mech.canFireWeapon('left')).toBe(false);

      // Fully expire cooldown (autocannon = 0.2s)
      mech.updateCooldowns(0.1);
      expect(mech.canFireWeapon('left')).toBe(true);
    });
  });
});
