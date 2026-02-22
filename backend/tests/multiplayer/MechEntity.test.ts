/**
 * MechEntity Tests
 * Tests for server-side mech state: health, weapons, cooldowns, hitbox detection
 */

import { MechEntity } from '../../src/game/MechEntity';
import { MechLoadout } from '../../src/shared/types/NetworkMessages';
import { MECH, COMBAT } from '../../src/shared/constants/GameConstants';

const createLoadout = (overrides?: Partial<MechLoadout>): MechLoadout => ({
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
  ...overrides,
});

const spawnPosition: [number, number, number] = [50, 0, 50];

describe('MechEntity', () => {
  describe('Construction', () => {
    it('should initialize with correct player info', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);

      expect(mech.playerId).toBe('p1');
      expect(mech.playerName).toBe('TestPlayer');
    });

    it('should initialize at spawn position', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), [10, 5, 20]);

      expect(mech.state.position).toEqual([10, 5, 20]);
    });

    it('should initialize with full health, power, and jump fuel', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);

      expect(mech.state.health).toBe(MECH.MAX_HEALTH);
      expect(mech.state.power).toBe(MECH.MAX_POWER);
      expect(mech.state.jumpFuel).toBe(MECH.MAX_JUMP_FUEL);
    });

    it('should initialize with zero rotation and velocity', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);

      expect(mech.state.rotation).toEqual([0, 0, 0]);
      expect(mech.state.velocity).toEqual([0, 0, 0]);
    });

    it('should initialize with all actions inactive', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);

      expect(mech.state.isDashing).toBe(false);
      expect(mech.state.isJumping).toBe(false);
      expect(mech.state.abilityActive).toBe(false);
    });

    it('should initialize with zero cooldowns', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);

      expect(mech.leftWeaponCooldown).toBe(0);
      expect(mech.rightWeaponCooldown).toBe(0);
      expect(mech.abilityCooldown).toBe(0);
    });

    it('should store the loadout', () => {
      const loadout = createLoadout();
      const mech = new MechEntity('p1', 'TestPlayer', loadout, spawnPosition);

      expect(mech.loadout).toBe(loadout);
      expect(mech.loadout.leftWeapon.type).toBe('autocannon');
      expect(mech.loadout.rightWeapon.type).toBe('laser');
    });
  });

  describe('takeDamage', () => {
    it('should reduce health by damage amount', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);

      mech.takeDamage(25);

      expect(mech.state.health).toBe(75);
    });

    it('should return false when mech survives', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);

      expect(mech.takeDamage(50)).toBe(false);
      expect(mech.state.health).toBe(50);
    });

    it('should return true when mech is destroyed (health reaches 0)', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);

      expect(mech.takeDamage(MECH.MAX_HEALTH)).toBe(true);
      expect(mech.state.health).toBe(0);
    });

    it('should return true when damage exceeds remaining health', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);

      expect(mech.takeDamage(999)).toBe(true);
      expect(mech.state.health).toBe(0);
    });

    it('should not let health go below 0', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);

      mech.takeDamage(200);

      expect(mech.state.health).toBe(0);
    });

    it('should accumulate damage from multiple hits', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);

      mech.takeDamage(30);
      mech.takeDamage(30);
      mech.takeDamage(30);

      expect(mech.state.health).toBe(10);
    });

    it('should destroy mech on final cumulative hit', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);

      expect(mech.takeDamage(30)).toBe(false);
      expect(mech.takeDamage(30)).toBe(false);
      expect(mech.takeDamage(30)).toBe(false);
      expect(mech.takeDamage(30)).toBe(true);
    });
  });

  describe('updateCooldowns', () => {
    it('should reduce cooldowns by delta time', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);
      mech.leftWeaponCooldown = 1.0;
      mech.rightWeaponCooldown = 2.0;
      mech.abilityCooldown = 3.0;

      mech.updateCooldowns(0.5);

      expect(mech.leftWeaponCooldown).toBe(0.5);
      expect(mech.rightWeaponCooldown).toBe(1.5);
      expect(mech.abilityCooldown).toBe(2.5);
    });

    it('should not let cooldowns go below 0', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);
      mech.leftWeaponCooldown = 0.1;

      mech.updateCooldowns(1.0);

      expect(mech.leftWeaponCooldown).toBe(0);
    });

    it('should fully expire cooldowns after enough time', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);
      mech.leftWeaponCooldown = 0.2;
      mech.rightWeaponCooldown = 0.5;
      mech.abilityCooldown = 1.0;

      mech.updateCooldowns(1.0);

      expect(mech.leftWeaponCooldown).toBe(0);
      expect(mech.rightWeaponCooldown).toBe(0);
      expect(mech.abilityCooldown).toBe(0);
    });

    it('should handle zero delta time', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);
      mech.leftWeaponCooldown = 1.0;

      mech.updateCooldowns(0);

      expect(mech.leftWeaponCooldown).toBe(1.0);
    });
  });

  describe('canFireWeapon', () => {
    it('should allow firing when cooldown is 0, power is sufficient, and weapon exists', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);

      expect(mech.canFireWeapon('left')).toBe(true);
      expect(mech.canFireWeapon('right')).toBe(true);
    });

    it('should deny firing when on cooldown', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);
      mech.leftWeaponCooldown = 0.5;

      expect(mech.canFireWeapon('left')).toBe(false);
      expect(mech.canFireWeapon('right')).toBe(true);
    });

    it('should deny firing when power is insufficient', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);
      // Autocannon costs 5, laser costs 8
      mech.state.power = 6;

      expect(mech.canFireWeapon('left')).toBe(true); // 6 >= 5
      expect(mech.canFireWeapon('right')).toBe(false); // 6 < 8
    });

    it('should deny firing when power is exactly 0', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);
      mech.state.power = 0;

      expect(mech.canFireWeapon('left')).toBe(false);
      expect(mech.canFireWeapon('right')).toBe(false);
    });

    it('should allow firing when power exactly equals cost', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);
      mech.state.power = 5; // Exactly autocannon cost

      expect(mech.canFireWeapon('left')).toBe(true);
    });

    it('should deny firing with null weapon config', () => {
      const loadout = createLoadout();
      (loadout as any).leftWeapon = null;
      const mech = new MechEntity('p1', 'TestPlayer', loadout, spawnPosition);

      expect(mech.canFireWeapon('left')).toBe(false);
    });
  });

  describe('fireWeapon', () => {
    it('should consume power when firing', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);
      const initialPower = mech.state.power;

      mech.fireWeapon('left'); // autocannon costs 5

      expect(mech.state.power).toBe(initialPower - 5);
    });

    it('should set weapon cooldown when firing', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);

      mech.fireWeapon('left'); // autocannon cooldown is 200ms = 0.2s

      expect(mech.leftWeaponCooldown).toBe(0.2);
      expect(mech.rightWeaponCooldown).toBe(0); // Other weapon unaffected
    });

    it('should set right weapon cooldown independently', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);

      mech.fireWeapon('right'); // laser cooldown is 500ms = 0.5s

      expect(mech.rightWeaponCooldown).toBe(0.5);
      expect(mech.leftWeaponCooldown).toBe(0);
    });

    it('should not go below 0 power', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);
      mech.state.power = 3; // Less than autocannon cost of 5

      mech.fireWeapon('left');

      expect(mech.state.power).toBe(0);
    });

    it('should do nothing with null weapon config', () => {
      const loadout = createLoadout();
      (loadout as any).leftWeapon = null;
      const mech = new MechEntity('p1', 'TestPlayer', loadout, spawnPosition);
      const initialPower = mech.state.power;

      mech.fireWeapon('left');

      expect(mech.state.power).toBe(initialPower);
      expect(mech.leftWeaponCooldown).toBe(0);
    });

    it('should allow firing both weapons in sequence', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), spawnPosition);
      const initialPower = mech.state.power;

      mech.fireWeapon('left');
      mech.fireWeapon('right');

      expect(mech.state.power).toBe(initialPower - 5 - 8);
      expect(mech.leftWeaponCooldown).toBe(0.2);
      expect(mech.rightWeaponCooldown).toBe(0.5);
    });
  });

  describe('getMuzzlePosition', () => {
    it('should offset left weapon to the left at yaw 0', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), [0, 0, 0]);
      mech.state.rotation = [0, 0, 0]; // Facing +Z

      const pos = mech.getMuzzlePosition('left');

      // At yaw 0: sin(0)=0, cos(0)=1, offset=-1.5
      // x = 0 + sin(0)*(-1.5) = 0
      // z = 0 + cos(0)*(-1.5) = -1.5
      expect(pos[0]).toBeCloseTo(0);
      expect(pos[1]).toBe(1.5); // Torso height
      expect(pos[2]).toBeCloseTo(-1.5);
    });

    it('should offset right weapon to the right at yaw 0', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), [0, 0, 0]);
      mech.state.rotation = [0, 0, 0];

      const pos = mech.getMuzzlePosition('right');

      // offset=+1.5
      expect(pos[0]).toBeCloseTo(0);
      expect(pos[1]).toBe(1.5);
      expect(pos[2]).toBeCloseTo(1.5);
    });

    it('should account for mech position', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), [100, 10, 200]);

      const pos = mech.getMuzzlePosition('left');

      expect(pos[1]).toBe(11.5); // position.y + torso height
    });

    it('should rotate offset with yaw', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), [0, 0, 0]);
      mech.state.rotation = [0, Math.PI / 2, 0]; // 90 degrees

      const pos = mech.getMuzzlePosition('right');

      // At yaw PI/2: sin(PI/2)=1, cos(PI/2)=0, offset=+1.5
      // x = 0 + 1*1.5 = 1.5
      // z = 0 + 0*1.5 = 0
      expect(pos[0]).toBeCloseTo(1.5);
      expect(pos[2]).toBeCloseTo(0);
    });
  });

  describe('isHit', () => {
    const hitboxRadius = Math.max(MECH.DIMENSIONS.WIDTH, MECH.DIMENSIONS.DEPTH) / 2;
    const mechHalfHeight = MECH.DIMENSIONS.HEIGHT / 2;

    it('should detect a hit at the mech center', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), [0, 0, 0]);

      // Projectile at center of mech body
      expect(mech.isHit([0, mechHalfHeight, 0], 0.3)).toBe(true);
    });

    it('should detect a hit at ground level', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), [0, 0, 0]);

      expect(mech.isHit([0, 0, 0], 0.3)).toBe(true);
    });

    it('should detect a hit at the edge of the hitbox radius', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), [0, 0, 0]);

      // Just within horizontal range (hitboxRadius + projectileRadius)
      const projectileRadius = 0.3;
      const dist = hitboxRadius + projectileRadius - 0.01;
      expect(mech.isHit([dist, mechHalfHeight, 0], projectileRadius)).toBe(true);
    });

    it('should miss outside horizontal range', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), [0, 0, 0]);

      const projectileRadius = 0.3;
      const dist = hitboxRadius + projectileRadius + 1;
      expect(mech.isHit([dist, mechHalfHeight, 0], projectileRadius)).toBe(false);
    });

    it('should miss above the mech', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), [0, 0, 0]);

      const projectileRadius = 0.3;
      const aboveY = MECH.DIMENSIONS.HEIGHT + projectileRadius + 1;
      expect(mech.isHit([0, aboveY, 0], projectileRadius)).toBe(false);
    });

    it('should miss below the mech', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), [0, 5, 0]);

      expect(mech.isHit([0, 0, 0], 0.3)).toBe(false);
    });

    it('should account for mech position offset', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), [100, 0, 200]);

      // Hit at mech center
      expect(mech.isHit([100, mechHalfHeight, 200], 0.3)).toBe(true);
      // Miss at origin
      expect(mech.isHit([0, mechHalfHeight, 0], 0.3)).toBe(false);
    });

    it('should use cylinder check (diagonal distance in XZ plane)', () => {
      const mech = new MechEntity('p1', 'TestPlayer', createLoadout(), [0, 0, 0]);

      // A point that is outside along one axis but the combined XZ distance is within radius
      const projectileRadius = 0.3;
      const maxDist = hitboxRadius + projectileRadius;
      // Place at 45 degrees: each component is maxDist/sqrt(2)
      const component = (maxDist - 0.01) / Math.sqrt(2);
      expect(mech.isHit([component, mechHalfHeight, component], projectileRadius)).toBe(true);
    });
  });
});
