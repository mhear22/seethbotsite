/**
 * Server-side projectile system with lag compensation
 */

import { ProjectileState } from '../shared/types/NetworkMessages';
import { COMBAT, PHYSICS } from '../shared/constants/GameConstants';
import { MechEntity } from './MechEntity';

interface Projectile {
  id: string;
  ownerId: string;
  position: [number, number, number];
  velocity: [number, number, number];
  type: 'ballistic' | 'energy' | 'missile';
  damage: number;
  spawnTime: number;
  lifetime: number;
}

interface HitResult {
  projectileId: string;
  hitMechId: string;
  position: [number, number, number];
  damage: number;
}

export class ProjectileSystem {
  private projectiles: Map<string, Projectile> = new Map();
  private nextProjectileId = 0;

  /**
   * Spawn a new projectile
   */
  public spawnProjectile(
    ownerId: string,
    position: [number, number, number],
    direction: [number, number, number],
    weaponType: string,
    damage: number
  ): string {
    const projectileId = `proj_${Date.now()}_${this.nextProjectileId++}`;

    // Get weapon config
    const weaponConfig = COMBAT.WEAPONS[weaponType as keyof typeof COMBAT.WEAPONS];
    const speed = weaponConfig?.projectileSpeed || 100;
    const type = weaponConfig?.projectileType || 'ballistic';

    // Normalize direction
    const length = Math.sqrt(
      direction[0] * direction[0] +
      direction[1] * direction[1] +
      direction[2] * direction[2]
    );
    const normalizedDir: [number, number, number] = [
      direction[0] / length,
      direction[1] / length,
      direction[2] / length
    ];

    // Calculate velocity
    const velocity: [number, number, number] = [
      normalizedDir[0] * speed,
      normalizedDir[1] * speed,
      normalizedDir[2] * speed
    ];

    const projectile: Projectile = {
      id: projectileId,
      ownerId,
      position: [...position] as [number, number, number],
      velocity,
      type,
      damage,
      spawnTime: Date.now(),
      lifetime: COMBAT.PROJECTILE_LIFETIME
    };

    this.projectiles.set(projectileId, projectile);

    return projectileId;
  }

  /**
   * Update all projectiles
   */
  public update(deltaTime: number): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [id, projectile] of this.projectiles.entries()) {
      // Check lifetime
      const age = now - projectile.spawnTime;
      if (age >= projectile.lifetime) {
        toRemove.push(id);
        continue;
      }

      // Update position
      projectile.position[0] += projectile.velocity[0] * deltaTime;
      projectile.position[1] += projectile.velocity[1] * deltaTime;
      projectile.position[2] += projectile.velocity[2] * deltaTime;

      // Apply gravity for ballistic projectiles
      if (projectile.type === 'ballistic') {
        projectile.velocity[1] += PHYSICS.GRAVITY * deltaTime;
      }

      // Check if hit ground
      if (projectile.position[1] < 0) {
        toRemove.push(id);
      }
    }

    // Remove expired/ground-hit projectiles
    for (const id of toRemove) {
      this.projectiles.delete(id);
    }
  }

  /**
   * Check for collisions with mechs
   * Returns array of hits
   */
  public checkCollisions(mechs: MechEntity[]): HitResult[] {
    const hits: HitResult[] = [];
    const toRemove: string[] = [];

    for (const [id, projectile] of this.projectiles.entries()) {
      for (const mech of mechs) {
        // Don't hit owner
        if (mech.playerId === projectile.ownerId) continue;

        // Check if projectile is within mech hitbox
        if (mech.isHit(projectile.position, COMBAT.PROJECTILE_RADIUS)) {
          hits.push({
            projectileId: id,
            hitMechId: mech.playerId,
            position: [...projectile.position] as [number, number, number],
            damage: projectile.damage
          });

          toRemove.push(id);
          break;
        }
      }
    }

    // Remove projectiles that hit
    for (const id of toRemove) {
      this.projectiles.delete(id);
    }

    return hits;
  }

  /**
   * Get all projectile states for networking
   */
  public getProjectileStates(): ProjectileState[] {
    const states: ProjectileState[] = [];

    for (const projectile of this.projectiles.values()) {
      states.push({
        id: projectile.id,
        position: [...projectile.position] as [number, number, number],
        velocity: [...projectile.velocity] as [number, number, number],
        ownerId: projectile.ownerId,
        type: projectile.type,
        damage: projectile.damage
      });
    }

    return states;
  }

  /**
   * Remove a projectile by ID
   */
  public removeProjectile(id: string): void {
    this.projectiles.delete(id);
  }

  /**
   * Get projectile count (for debugging)
   */
  public getProjectileCount(): number {
    return this.projectiles.size;
  }

  /**
   * Clear all projectiles
   */
  public clear(): void {
    this.projectiles.clear();
  }
}
