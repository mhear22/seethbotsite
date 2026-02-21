<template>
  <svg v-if="icon === 'autocannon'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <path d="M16 24h8v16h-8z"/>
    <rect x="24" y="28" width="24" height="8" rx="2"/>
    <circle cx="50" cy="32" r="4"/>
    <path d="M48 28v8M52 28v8"/>
  </svg>

  <svg v-else-if="icon === 'railgun'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="12" y="28" width="40" height="8" rx="1"/>
    <path d="M10 32h4M50 32h8"/>
    <circle cx="56" cy="32" r="3"/>
    <path d="M20 24l4 4M20 40l4-4M28 24l4 4M28 40l4-4"/>
  </svg>

  <svg v-else-if="icon === 'pile-driver'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="20" y="12" width="24" height="8"/>
    <rect x="26" y="20" width="12" height="24"/>
    <path d="M22 44h20l-4 8h-12z"/>
    <rect x="28" y="8" width="8" height="4"/>
  </svg>

  <svg v-else-if="icon === 'missile-pod'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="16" y="20" width="6" height="24" rx="3"/>
    <rect x="24" y="20" width="6" height="24" rx="3"/>
    <rect x="32" y="20" width="6" height="24" rx="3"/>
    <rect x="40" y="20" width="6" height="24" rx="3"/>
    <path d="M19 18l3-6 3 6M27 18l3-6 3 6M35 18l3-6 3 6M43 18l3-6 3 6"/>
  </svg>

  <svg v-else-if="icon === 'flamethrower'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="12" y="26" width="24" height="12" rx="2"/>
    <path d="M36 28c4 0 8 2 10 4 3 3 6 8 6 12" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="42" cy="32" r="2"/>
    <circle cx="48" cy="36" r="2.5"/>
    <circle cx="52" cy="42" r="3"/>
  </svg>

  <svg v-else-if="icon === 'shield-gen'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <path d="M32 8c-8 0-16 4-16 8v16c0 12 8 20 16 24 8-4 16-12 16-24V16c0-4-8-8-16-8z" fill="none" stroke="currentColor" stroke-width="3"/>
    <path d="M32 16c-4 0-8 2-8 4v8c0 6 4 10 8 12 4-2 8-6 8-12v-8c0-2-4-4-8-4z"/>
  </svg>

  <svg v-else-if="icon === 'diesel-gen'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="16" y="20" width="32" height="24" rx="2"/>
    <rect x="20" y="16" width="8" height="4"/>
    <rect x="36" y="16" width="8" height="4"/>
    <circle cx="24" cy="32" r="6"/>
    <circle cx="40" cy="32" r="6"/>
    <path d="M24 26v12M40 26v12M20 32h8M36 32h8"/>
  </svg>

  <svg v-else-if="icon === 'fusion-reactor'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <circle cx="32" cy="32" r="16" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="32" cy="32" r="8"/>
    <path d="M32 12v8M32 44v8M12 32h8M44 32h8"/>
    <path d="M20 20l6 6M38 38l6 6M44 20l-6 6M26 38l-6 6"/>
    <circle cx="32" cy="32" r="4" fill="none" stroke="currentColor" stroke-width="1"/>
  </svg>

  <svg v-else-if="icon === 'gas-turbine'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <ellipse cx="32" cy="32" rx="20" ry="16"/>
    <path d="M12 32c0-8 9-16 20-16s20 8 20 16" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M20 32l4-8 4 8M36 32l4-8 4 8"/>
    <rect x="8" y="30" width="8" height="4"/>
    <rect x="48" y="30" width="8" height="4"/>
  </svg>

  <svg v-else-if="icon === 'capacitor-bank'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="14" y="20" width="12" height="24" rx="2"/>
    <rect x="28" y="20" width="12" height="24" rx="2"/>
    <rect x="42" y="20" width="12" height="24" rx="2"/>
    <path d="M20 16v-4M34 16v-4M48 16v-4"/>
    <path d="M20 48v4M34 48v4M48 48v4"/>
  </svg>

  <svg v-else-if="icon === 'bipedal'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="22" y="12" width="8" height="20"/>
    <rect x="34" y="12" width="8" height="20"/>
    <path d="M22 32l-4 16h-4l2-16"/>
    <path d="M42 32l4 16h4l-2-16"/>
    <rect x="18" y="10" width="28" height="4"/>
  </svg>

  <svg v-else-if="icon === 'tracked'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="12" y="24" width="40" height="16" rx="8"/>
    <circle cx="20" cy="32" r="4" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="32" cy="32" r="4" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="44" cy="32" r="4" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="16" y="16" width="32" height="8"/>
  </svg>

  <svg v-else-if="icon === 'hover'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <ellipse cx="32" cy="28" rx="20" ry="8"/>
    <path d="M16 36c-2 4 0 8 4 10s12 2 24 0 6-6 4-10"/>
    <circle cx="20" cy="40" r="3" opacity="0.5"/>
    <circle cx="32" cy="42" r="3" opacity="0.5"/>
    <circle cx="44" cy="40" r="3" opacity="0.5"/>
    <rect x="20" y="16" width="24" height="12" rx="2"/>
  </svg>

  <svg v-else-if="icon === 'quadrupedal'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="24" y="12" width="16" height="8"/>
    <rect x="18" y="20" width="6" height="16"/>
    <rect x="40" y="20" width="6" height="16"/>
    <path d="M18 36l-6 12h-4l4-12"/>
    <path d="M46 36l6 12h4l-4-12"/>
    <rect x="12" y="20" width="6" height="16"/>
    <rect x="46" y="20" width="6" height="16"/>
    <path d="M12 36l-4 12h-4l2-12"/>
    <path d="M52 36l4 12h4l-2-12"/>
  </svg>

  <svg v-else-if="icon === 'standard-optics'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="16" y="20" width="32" height="24" rx="4"/>
    <circle cx="28" cy="32" r="6" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="28" cy="32" r="3"/>
    <rect x="38" y="28" width="6" height="8"/>
  </svg>

  <svg v-else-if="icon === 'targeting-array'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <circle cx="32" cy="32" r="16" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="32" cy="32" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="32" cy="32" r="3"/>
    <path d="M32 12v8M32 44v8M12 32h8M44 32h8"/>
    <path d="M20 20l4 4M40 40l4 4M44 20l-4 4M24 40l-4 4"/>
  </svg>

  <svg v-else-if="icon === 'reinforced'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="12" y="16" width="40" height="32" rx="2"/>
    <rect x="16" y="20" width="32" height="24" rx="1" fill="none" stroke="currentColor" stroke-width="3"/>
    <circle cx="32" cy="32" r="6"/>
    <path d="M16 16h32M16 48h32"/>
  </svg>

  <svg v-else-if="icon === 'scout-suite'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="20" y="24" width="24" height="16" rx="2"/>
    <path d="M20 32c-8 0-12-4-12-8h12z"/>
    <path d="M44 32c8 0 12-4 12-8H44z"/>
    <circle cx="28" cy="32" r="4"/>
    <circle cx="36" cy="32" r="4"/>
    <path d="M32 16v8"/>
  </svg>

  <svg v-else-if="icon === 'smoke-launcher'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="24" y="32" width="16" height="12" rx="2"/>
    <circle cx="28" cy="24" r="6" opacity="0.3"/>
    <circle cx="36" cy="20" r="8" opacity="0.2"/>
    <circle cx="32" cy="16" r="7" opacity="0.25"/>
    <rect x="28" y="28" width="3" height="4"/>
    <rect x="33" y="28" width="3" height="4"/>
  </svg>

  <svg v-else-if="icon === 'ammo-feed'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="16" y="24" width="32" height="16" rx="2"/>
    <rect x="20" y="28" width="4" height="8"/>
    <rect x="26" y="28" width="4" height="8"/>
    <rect x="32" y="28" width="4" height="8"/>
    <rect x="38" y="28" width="4" height="8"/>
    <path d="M16 40h32v4H16z"/>
  </svg>

  <svg v-else-if="icon === 'jump-jets'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="20" y="20" width="8" height="16" rx="2"/>
    <rect x="36" y="20" width="8" height="16" rx="2"/>
    <path d="M24 36c-2 4-2 8 0 12M40 36c2 4 2 8 0 12" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="22" cy="44" r="2" opacity="0.5"/>
    <circle cx="26" cy="46" r="2" opacity="0.5"/>
    <circle cx="38" cy="44" r="2" opacity="0.5"/>
    <circle cx="42" cy="46" r="2" opacity="0.5"/>
  </svg>

  <svg v-else-if="icon === 'repair-drone'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <circle cx="32" cy="32" r="8"/>
    <path d="M24 24l-8-8M40 24l8-8M24 40l-8 8M40 40l8 8"/>
    <circle cx="16" cy="16" r="4"/>
    <circle cx="48" cy="16" r="4"/>
    <circle cx="16" cy="48" r="4"/>
    <circle cx="48" cy="48" r="4"/>
    <path d="M30 28h4v8h-4z"/>
    <path d="M28 30h8v4h-8z"/>
  </svg>

  <!-- Stat icons -->
  <svg v-else-if="icon === 'health'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <path d="M32 52c-12-8-20-16-20-24 0-8 6-12 12-12 4 0 8 2 8 6 0-4 4-6 8-6 6 0 12 4 12 12 0 8-8 16-20 24z"/>
  </svg>

  <svg v-else-if="icon === 'armor'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <path d="M32 8l-20 8v16c0 12 8 20 20 24 12-4 20-12 20-24V16z"/>
  </svg>

  <svg v-else-if="icon === 'speed'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <path d="M32 16l-4 16h8z"/>
    <path d="M16 28l12 8-4-12z"/>
    <path d="M20 44l8-8-12-4z"/>
    <circle cx="32" cy="32" r="6"/>
  </svg>

  <svg v-else-if="icon === 'energy'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <path d="M36 8L24 32h8L28 56l12-24h-8z"/>
  </svg>

  <svg v-else-if="icon === 'firepower'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <circle cx="32" cy="32" r="8"/>
    <path d="M32 8v12M32 44v12M8 32h12M44 32h12"/>
    <path d="M16 16l8 8M40 40l8 8M48 16l-8 8M24 40l-8 8"/>
  </svg>

  <svg v-else-if="icon === 'accuracy'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="32" cy="32" r="12" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="32" cy="32" r="4"/>
  </svg>

  <!-- Synergy icons -->
  <svg v-else-if="icon === 'synergy-shield'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <path d="M32 8l-20 8v16c0 12 8 20 20 24 12-4 20-12 20-24V16z" fill="none" stroke="currentColor" stroke-width="3"/>
    <path d="M24 32l6 6 12-12" stroke="currentColor" stroke-width="3" fill="none"/>
  </svg>

  <svg v-else-if="icon === 'synergy-target'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="32" cy="32" r="12" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="32" cy="32" r="6"/>
    <path d="M32 8v8M32 48v8M8 32h8M48 32h8"/>
  </svg>

  <svg v-else-if="icon === 'synergy-bolt'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <path d="M36 8L24 32h8L28 56l12-24h-8z"/>
    <circle cx="36" cy="16" r="4" opacity="0.6"/>
    <circle cx="28" cy="48" r="4" opacity="0.6"/>
  </svg>

  <svg v-else-if="icon === 'synergy-speed'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <path d="M8 32l16-8v4h24l8 8-8 8H24v4z"/>
  </svg>

  <svg v-else-if="icon === 'synergy-fist'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="20" y="24" width="12" height="16" rx="2"/>
    <rect x="32" y="20" width="8" height="20" rx="2"/>
    <rect x="16" y="32" width="8" height="12" rx="2"/>
    <path d="M20 40h12l8 8H20z"/>
  </svg>

  <svg v-else-if="icon === 'synergy-explosion'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <circle cx="32" cy="32" r="8"/>
    <path d="M32 12l2 12M32 52l-2-12M12 32l12 2M52 32l-12-2"/>
    <path d="M18 18l10 10M46 46l-10-10M46 18l-10 10M18 46l10-10"/>
  </svg>

  <svg v-else-if="icon === 'synergy-fortress'" viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <rect x="12" y="28" width="40" height="24"/>
    <rect x="8" y="20" width="8" height="8"/>
    <rect x="48" y="20" width="8" height="8"/>
    <rect x="28" y="16" width="8" height="12"/>
    <path d="M16 28v-8h8M48 28v-8h-8"/>
  </svg>

  <!-- Default/Unknown -->
  <svg v-else viewBox="0 0 64 64" :width="size" :height="size" fill="currentColor">
    <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" stroke-width="3"/>
    <text x="32" y="40" text-anchor="middle" font-size="32" font-weight="bold">?</text>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  size?: string | number
}>()
</script>
