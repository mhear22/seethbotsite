/**
 * Radio-transmission beat rendered by CommsToast.vue — Vaun/Kestrel comms and
 * the Phase-2 reinforcement callout. Owned by the STORY UI cluster; the
 * integrator constructs these and feeds them to CommsToast.
 */
export interface CommsBeat {
  /** Stable id — CommsToast dedupes/queues by this. */
  id: string
  /** Callsign shown on the transmission header (e.g. "MAJ VAUN", "KESTREL"). */
  callsign: string
  /** The transmitted line. */
  line: string
  /**
   * Visual register:
   *  - 'comms'         friendly/handler transmission (default, amber)
   *  - 'hostile'       Kestrel / enemy ace intercept (red)
   *  - 'reinforcement' the P2 half-health reinforcement callout (alarm)
   */
  variant?: 'comms' | 'hostile' | 'reinforcement'
  /** Auto-dismiss delay in ms. Defaults per variant if omitted. */
  durationMs?: number
}
