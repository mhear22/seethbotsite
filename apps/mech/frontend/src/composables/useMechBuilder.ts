import { ref, computed } from 'vue'
import type {
  MechStats,
  MechLoadout,
  SavedBuild,
  SynergyEffect,
  MechPart,
  ArmPart,
  CorePart,
  LegsPart,
  HeadPart,
  RackPart
} from '../shared/types/MechTypes'
import {
  ARM_PARTS,
  CORE_PARTS,
  LEGS_PARTS,
  HEAD_PARTS,
  RACK_PARTS,
  SYNERGIES,
  findPartById
} from '../shared/data/MechParts'

// Re-export types for backward compatibility
export type {
  MechStats,
  MechLoadout,
  SavedBuild,
  SynergyEffect,
  MechPart,
  ArmPart,
  CorePart,
  LegsPart,
  HeadPart,
  RackPart
}

// Re-export presets for backward compatibility
export const ARM_PRESETS = ARM_PARTS
export const CORE_PRESETS = CORE_PARTS
export const LEGS_PRESETS = LEGS_PARTS
export const HEAD_PRESETS = HEAD_PARTS
export const RACK_PRESETS = RACK_PARTS
export const SYNERGY_PRESETS = SYNERGIES

export function useMechBuilder() {
  // State
  const loadout = ref<MechLoadout>({
    leftArm: null,
    rightArm: null,
    core: null,
    legs: null,
    head: null,
    rack: null
  })

  const savedBuilds = ref<SavedBuild[]>([])

  // Computed: Total stats including synergy bonuses
  const totalStats = computed(() => {
    const base: MechStats = {
      health: 0,
      armor: 0,
      speed: 0,
      energy: 0,
      firepower: 0,
      accuracy: 0
    }

    // Sum stats from all equipped parts
    Object.values(loadout.value).forEach(part => {
      if (part) {
        base.health += part.stats.health
        base.armor += part.stats.armor
        base.speed += part.stats.speed
        base.energy += part.stats.energy
        base.firepower += part.stats.firepower
        base.accuracy += part.stats.accuracy
      }
    })

    // Add synergy bonuses
    activeSynergies.value.forEach(synergy => {
      if (synergy.statBonus.health) base.health += synergy.statBonus.health
      if (synergy.statBonus.armor) base.armor += synergy.statBonus.armor
      if (synergy.statBonus.speed) base.speed += synergy.statBonus.speed
      if (synergy.statBonus.energy) base.energy += synergy.statBonus.energy
      if (synergy.statBonus.firepower) base.firepower += synergy.statBonus.firepower
      if (synergy.statBonus.accuracy) base.accuracy += synergy.statBonus.accuracy
    })

    return base
  })

  // Computed: Active synergies
  const activeSynergies = computed(() => {
    const active: SynergyEffect[] = []
    const equippedIds = Object.values(loadout.value)
      .filter(part => part !== null)
      .map(part => part!.id)

    SYNERGIES.forEach(synergy => {
      // Check if all required parts are equipped
      const hasAll = synergy.requiredParts.every(id => equippedIds.includes(id))
      if (hasAll) {
        active.push(synergy)
      }
    })

    return active
  })

  // Computed: Threat level (0-100 scale)
  const threatLevel = computed(() => {
    const stats = totalStats.value
    // Weighted scoring
    const score = (
      stats.health * 0.5 +
      stats.armor * 1.0 +
      stats.speed * 0.8 +
      stats.energy * 0.3 +
      stats.firepower * 1.2 +
      stats.accuracy * 0.9
    ) / 10 // Normalize

    return Math.min(100, Math.max(0, Math.round(score)))
  })

  // Computed: Warnings
  const warnings = computed(() => {
    const warns: string[] = []

    if (!loadout.value.core) warns.push('No core equipped - mech inoperable')
    if (!loadout.value.legs) warns.push('No legs equipped - mech immobile')
    if (!loadout.value.head) warns.push('No head equipped - no sensors or targeting')
    if (!loadout.value.leftArm && !loadout.value.rightArm) {
      warns.push('No weapons equipped - defenseless')
    }
    if (totalStats.value.energy < 0) {
      warns.push(`Energy deficit: ${totalStats.value.energy} - weapons may be underpowered`)
    }

    return warns
  })

  // Computed: Build score
  const buildScore = computed(() => {
    const stats = totalStats.value
    const synergyBonus = activeSynergies.value.length * 10
    const completionBonus = warnings.value.length === 0 ? 20 : 0

    const base = (
      stats.health * 0.3 +
      stats.armor * 0.4 +
      stats.speed * 0.3 +
      (stats.energy > 0 ? stats.energy * 0.2 : 0) +
      stats.firepower * 0.5 +
      stats.accuracy * 0.4
    )

    return Math.round(base + synergyBonus + completionBonus)
  })

  // Computed: Is loadout complete
  const isComplete = computed(() => {
    return loadout.value.core !== null &&
           loadout.value.legs !== null &&
           loadout.value.head !== null
  })

  // Actions
  function selectPart(part: MechPart, slot: keyof MechLoadout) {
    loadout.value[slot] = part as any
    saveToBrowser()
  }

  function removePart(slot: keyof MechLoadout) {
    loadout.value[slot] = null
    saveToBrowser()
  }

  function resetBuild() {
    loadout.value = {
      leftArm: null,
      rightArm: null,
      core: null,
      legs: null,
      head: null,
      rack: null
    }
    saveToBrowser()
  }

  function randomizeBuild() {
    const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

    loadout.value = {
      leftArm: randomItem(ARM_PARTS),
      rightArm: randomItem(ARM_PARTS),
      core: randomItem(CORE_PARTS),
      legs: randomItem(LEGS_PARTS),
      head: randomItem(HEAD_PARTS),
      rack: randomItem(RACK_PARTS)
    }
    saveToBrowser()
  }

  function saveBuild(name: string) {
    const build: SavedBuild = {
      name,
      timestamp: Date.now(),
      loadout: { ...loadout.value }
    }
    savedBuilds.value.push(build)
    saveBuildsToStorage()
  }

  function loadBuild(index: number) {
    if (index >= 0 && index < savedBuilds.value.length) {
      loadout.value = { ...savedBuilds.value[index].loadout }
      saveToBrowser()
    }
  }

  function deleteBuild(index: number) {
    if (index >= 0 && index < savedBuilds.value.length) {
      savedBuilds.value.splice(index, 1)
      saveBuildsToStorage()
    }
  }

  function exportBuild(): string {
    const exportData = {
      leftArm: loadout.value.leftArm?.id || null,
      rightArm: loadout.value.rightArm?.id || null,
      core: loadout.value.core?.id || null,
      legs: loadout.value.legs?.id || null,
      head: loadout.value.head?.id || null,
      rack: loadout.value.rack?.id || null
    }
    return btoa(JSON.stringify(exportData))
  }

  function importBuild(code: string): boolean {
    try {
      const data = JSON.parse(atob(code))
      loadout.value.leftArm = data.leftArm ? findPartById(data.leftArm) as ArmPart : null
      loadout.value.rightArm = data.rightArm ? findPartById(data.rightArm) as ArmPart : null
      loadout.value.core = data.core ? findPartById(data.core) as CorePart : null
      loadout.value.legs = data.legs ? findPartById(data.legs) as LegsPart : null
      loadout.value.head = data.head ? findPartById(data.head) as HeadPart : null
      loadout.value.rack = data.rack ? findPartById(data.rack) as RackPart : null
      saveToBrowser()
      return true
    } catch {
      return false
    }
  }

  // Persistence
  function saveToBrowser() {
    try {
      localStorage.setItem('mechBuilder_loadout', JSON.stringify({
        leftArm: loadout.value.leftArm?.id || null,
        rightArm: loadout.value.rightArm?.id || null,
        core: loadout.value.core?.id || null,
        legs: loadout.value.legs?.id || null,
        head: loadout.value.head?.id || null,
        rack: loadout.value.rack?.id || null
      }))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }
  }

  function loadFromBrowser() {
    try {
      const saved = localStorage.getItem('mechBuilder_loadout')
      if (saved) {
        const data = JSON.parse(saved)
        loadout.value.leftArm = data.leftArm ? findPartById(data.leftArm) as ArmPart : null
        loadout.value.rightArm = data.rightArm ? findPartById(data.rightArm) as ArmPart : null
        loadout.value.core = data.core ? findPartById(data.core) as CorePart : null
        loadout.value.legs = data.legs ? findPartById(data.legs) as LegsPart : null
        loadout.value.head = data.head ? findPartById(data.head) as HeadPart : null
        loadout.value.rack = data.rack ? findPartById(data.rack) as RackPart : null
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e)
    }
  }

  function saveBuildsToStorage() {
    try {
      localStorage.setItem('mechBuilder_savedBuilds', JSON.stringify(savedBuilds.value.map(build => ({
        name: build.name,
        timestamp: build.timestamp,
        loadout: {
          leftArm: build.loadout.leftArm?.id || null,
          rightArm: build.loadout.rightArm?.id || null,
          core: build.loadout.core?.id || null,
          legs: build.loadout.legs?.id || null,
          head: build.loadout.head?.id || null,
          rack: build.loadout.rack?.id || null
        }
      }))))
    } catch (e) {
      console.error('Failed to save builds to localStorage:', e)
    }
  }

  function loadBuildsFromStorage() {
    try {
      const saved = localStorage.getItem('mechBuilder_savedBuilds')
      if (saved) {
        const data = JSON.parse(saved)
        savedBuilds.value = data.map((build: any) => ({
          name: build.name,
          timestamp: build.timestamp,
          loadout: {
            leftArm: build.loadout.leftArm ? findPartById(build.loadout.leftArm) as ArmPart : null,
            rightArm: build.loadout.rightArm ? findPartById(build.loadout.rightArm) as ArmPart : null,
            core: build.loadout.core ? findPartById(build.loadout.core) as CorePart : null,
            legs: build.loadout.legs ? findPartById(build.loadout.legs) as LegsPart : null,
            head: build.loadout.head ? findPartById(build.loadout.head) as HeadPart : null,
            rack: build.loadout.rack ? findPartById(build.loadout.rack) as RackPart : null
          }
        }))
      }
    } catch (e) {
      console.error('Failed to load builds from localStorage:', e)
    }
  }

  return {
    // State
    loadout,
    savedBuilds,
    // Computed
    totalStats,
    activeSynergies,
    threatLevel,
    warnings,
    buildScore,
    isComplete,
    // Actions
    selectPart,
    removePart,
    resetBuild,
    randomizeBuild,
    saveBuild,
    loadBuild,
    deleteBuild,
    exportBuild,
    importBuild,
    saveToBrowser,
    loadFromBrowser,
    saveBuildsToStorage,
    loadBuildsFromStorage,
    // Presets
    ARM_PRESETS,
    CORE_PRESETS,
    LEGS_PRESETS,
    HEAD_PRESETS,
    RACK_PRESETS
  }
}
