<template>
  <div class="battery-settings">
    <!-- Settings Card -->
    <div class="card">
      <h3>Settings</h3>
      <div class="settings-grid">
        <div class="setting-field">
          <label>Peak Sun Hours</label>
          <input
            type="number"
            :value="settings.peakSunHours"
            @input="$emit('update:peakSunHours', Number(($event.target as HTMLInputElement).value))"
            min="1"
            max="12"
            step="0.5"
          />
        </div>
        <div class="setting-field">
          <label>Daily Usage (kWh)</label>
          <input
            type="number"
            :value="settings.dailyUsageKWh"
            @input="$emit('update:dailyUsageKWh', Number(($event.target as HTMLInputElement).value))"
            min="1"
            max="200"
            step="1"
          />
        </div>
        <div class="setting-field">
          <label>Days of Autonomy</label>
          <input
            type="number"
            :value="settings.daysOfAutonomy"
            @input="$emit('update:daysOfAutonomy', Number(($event.target as HTMLInputElement).value))"
            min="1"
            max="7"
            step="1"
          />
        </div>
        <div class="setting-field">
          <label>Daylight Hours</label>
          <input
            type="number"
            :value="settings.daylightHours"
            @input="$emit('update:daylightHours', Number(($event.target as HTMLInputElement).value))"
            min="6"
            max="18"
            step="0.5"
          />
        </div>
      </div>
    </div>

    <!-- Battery Options Card -->
    <div class="card">
      <h3>Battery Options</h3>
      <div class="presets-grid">
        <div
          v-for="preset in presets"
          :key="preset.id"
          class="preset-card"
        >
          <div class="preset-name">{{ preset.name }}</div>
          <div class="preset-specs">
            <span>{{ preset.capacityKWh }} kWh</span>
            <span>{{ preset.powerKW }} kW</span>
            <span>{{ preset.efficiency }}% eff</span>
            <span>{{ preset.warrantyYears }} yr warranty</span>
          </div>
          <button class="add-btn" @click="$emit('add-preset', preset)">+ Add</button>
        </div>
        <!-- Custom battery card -->
        <div class="preset-card custom-preset" @click="$emit('open-custom-modal')">
          <div class="preset-name">Custom Battery</div>
          <div class="preset-specs">
            <span>Define your own specs</span>
          </div>
          <span class="add-btn">+ Configure</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BatteryPreset {
  id: string
  name: string
  capacityKWh: number
  powerKW: number
  efficiency: number
  warrantyYears: number
}

interface BatterySettings {
  peakSunHours: number
  dailyUsageKWh: number
  daysOfAutonomy: number
  daylightHours: number
}

defineProps<{
  settings: BatterySettings
  presets: BatteryPreset[]
}>()

defineEmits<{
  'update:peakSunHours': [value: number]
  'update:dailyUsageKWh': [value: number]
  'update:daysOfAutonomy': [value: number]
  'update:daylightHours': [value: number]
  'add-preset': [preset: BatteryPreset]
  'open-custom-modal': []
}>()
</script>

<style scoped>
.battery-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.card h3 {
  margin: 0 0 20px 0;
  font-size: 1.3rem;
  color: #333;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.setting-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-field label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
}

.setting-field input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.setting-field input:focus {
  outline: none;
  border-color: #ff91a4;
  box-shadow: 0 0 0 3px rgba(255, 145, 164, 0.1);
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.preset-card {
  background: #f8f8f8;
  border: 2px solid #eee;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preset-card:hover {
  border-color: #ff91a4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preset-name {
  font-weight: 700;
  font-size: 1.1rem;
  color: #333;
}

.preset-specs {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  color: #666;
}

.add-btn {
  align-self: flex-start;
  padding: 8px 16px;
  background: linear-gradient(45deg, #ff91a4, #ffb347);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 145, 164, 0.3);
}

.custom-preset {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #764ba2;
}

.custom-preset .preset-name,
.custom-preset .preset-specs,
.custom-preset .add-btn {
  color: white;
  background: rgba(255, 255, 255, 0.2);
}

.custom-preset:hover {
  border-color: #667eea;
  transform: translateY(-3px);
}

/* Dark mode */
.dark .card {
  background: #1e1e2e;
  border-color: #333;
}

.dark .card h3 {
  color: #e0e0e0;
}

.dark .setting-field label {
  color: #b0b0b0;
}

.dark .setting-field input {
  background: #2a2a40;
  border-color: #444;
  color: #e0e0e0;
}

.dark .setting-field input:focus {
  border-color: #ff91a4;
}

.dark .preset-card {
  background: #2a2a40;
  border-color: #444;
}

.dark .preset-name {
  color: #e0e0e0;
}

.dark .preset-specs {
  color: #b0b0b0;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .presets-grid {
    grid-template-columns: 1fr;
  }
}
</style>
