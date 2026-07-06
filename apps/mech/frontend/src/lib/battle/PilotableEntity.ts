import type * as THREE from 'three'

/**
 * The narrow contract the camera rig and the physics systems need from anything
 * the player can pilot — the sixty-ton Frame (`MechEntity`) or the fragile human
 * that steps out of it (`OnFootEntity`, design §4.3).
 *
 * This is intentionally the *smallest* surface that `CameraController` actually
 * touches, derived from its real usage:
 *   - reads  `target.position`  (rig anchor — CameraController lines ~102/175)
 *   - reads  `target.velocity`  (speed → positional lag + speed FOV — line ~114)
 *   - writes `target.rotation.y` (the piloted body faces the camera — line ~153)
 * plus `mesh` (the scene node the host adds/removes on mount/dismount) and
 * `update(dt)` (per-frame animation tick the render loop calls).
 *
 * `MechEntity` already satisfies this structurally (verified: it declares
 * `mesh: THREE.Group`, `position`/`velocity: THREE.Vector3`, `rotation:
 * THREE.Euler`, and `update(deltaTime: number)`). Nothing about MechEntity is
 * refactored — this interface is additive, and MechEntity is assignable to it
 * by structural typing. Do NOT widen this interface with mech-only combat state;
 * the whole point is that the camera stays entity-agnostic so the dismount is a
 * pointer swap, not a special case.
 */
export interface PilotableEntity {
  /** World-space position. The camera anchors its rig here. */
  position: THREE.Vector3
  /** Body orientation. The camera writes `.y` (yaw) so the body faces the view. */
  rotation: THREE.Euler
  /** World-space velocity. The camera reads horizontal speed for lag + FOV juice. */
  velocity: THREE.Vector3
  /** Scene node for this body; the host adds/removes it on mount/dismount. */
  mesh: THREE.Group
  /** Per-frame animation/state tick, called by the render loop. */
  update(deltaTime: number): void
}
