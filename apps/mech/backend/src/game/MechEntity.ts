/**
 * Server-side mech entity for authoritative state management
 */

import { PlayerState, MechLoadout } from '../shared/types/NetworkMessages';
import { MECH } from '../shared/constants/GameConstants';

export class MechEntity {
  public playerId: string;
  public playerName: string;
  public loadout: MechLoadout;
  public state: PlayerState;

  // Weapon cooldowns
  public leftWeaponCooldown = 0;
  public rightWeaponCooldown = 0;
  public abilityCooldown = 0;

  constructor(
    playerId: string,
    playerName: string,
    loadout: MechLoadout,
    initialPosition: [number, number, number]
  ) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.loadout = loadout;

    this.state = {
      position: initialPosition,
      rotation: [0, 0, 0],
      velocity: [0, 0, 0],
      health: MECH.MAX_HEALTH,
      power: MECH.MAX_POWER,
      jumpFuel: MECH.MAX_JUMP_FUEL,
      isDashing: false,
      isJumping: false,
      abilityActive: false
    };
  }

  /**
   * Update cooldowns
   */
  public updateCooldowns(deltaTime: number): void {
    this.leftWeaponCooldown = Math.max(0, this.leftWeaponCooldown - deltaTime);
    this.rightWeaponCooldown = Math.max(0, this.rightWeaponCooldown - deltaTime);
    this.abilityCooldown = Math.max(0, this.abilityCooldown - deltaTime);
  }

  /**
   * Take damage
   * @returns true if mech is destroyed
   */
  public takeDamage(damage: number): boolean {
    this.state.health = Math.max(0, this.state.health - damage);
    return this.state.health <= 0;
  }

  /**
   * Check if weapon can fire
   */
  public canFireWeapon(weapon: 'left' | 'right'): boolean {
    const cooldown = weapon === 'left' ? this.leftWeaponCooldown : this.rightWeaponCooldown;
    const weaponConfig = weapon === 'left' ? this.loadout.leftWeapon : this.loadout.rightWeapon;

    if (!weaponConfig) return false;
    if (cooldown > 0) return false;
    if (this.state.power < weaponConfig.energyCost) return false;

    return true;
  }

  /**
   * Fire weapon and consume resources
   */
  public fireWeapon(weapon: 'left' | 'right'): void {
    const weaponConfig = weapon === 'left' ? this.loadout.leftWeapon : this.loadout.rightWeapon;
    if (!weaponConfig) return;

    // Consume power
    this.state.power = Math.max(0, this.state.power - weaponConfig.energyCost);

    // Set cooldown
    const cooldownSeconds = weaponConfig.cooldown / 1000;
    if (weapon === 'left') {
      this.leftWeaponCooldown = cooldownSeconds;
    } else {
      this.rightWeaponCooldown = cooldownSeconds;
    }
  }

  /**
   * Get weapon muzzle position (for projectile spawning)
   */
  public getMuzzlePosition(weapon: 'left' | 'right'): [number, number, number] {
    // Offset from center position based on weapon side
    const offset = weapon === 'left' ? -1.5 : 1.5;
    const yaw = this.state.rotation[1];

    return [
      this.state.position[0] + Math.sin(yaw) * offset,
      this.state.position[1] + 1.5, // Torso height
      this.state.position[2] + Math.cos(yaw) * offset
    ];
  }

  /**
   * Check if position is within hitbox
   * Uses a cylinder-shaped hitbox to better match the mech's tall, narrow shape
   * - Cylinder check for horizontal distance (XZ plane)
   * - Height check for vertical bounds (Y axis)
   */
  public isHit(position: [number, number, number], radius: number): boolean {
    const dx = position[0] - this.state.position[0];
    const dy = position[1] - this.state.position[1];
    const dz = position[2] - this.state.position[2];

    // Horizontal distance (XZ plane) - cylinder radius check
    const horizontalDist = Math.sqrt(dx * dx + dz * dz);
    const hitboxRadius = Math.max(MECH.DIMENSIONS.WIDTH, MECH.DIMENSIONS.DEPTH) / 2;

    // Vertical bounds check - mech is tall (from ground to ~5 units high)
    const mechHalfHeight = MECH.DIMENSIONS.HEIGHT / 2;
    const mechCenterY = this.state.position[1] + mechHalfHeight;
    const withinHeight = Math.abs(dy) <= (mechHalfHeight + radius);

    return horizontalDist <= (hitboxRadius + radius) && withinHeight;
  }
}
