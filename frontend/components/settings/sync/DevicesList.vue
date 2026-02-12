<script setup lang="ts">
interface Device {
  id: string
  deviceName: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  last_sync: string | null
  isCurrentDevice: boolean
}

interface Props {
  devices: Device[]
}

defineProps<Props>()

/**
 * Format timestamp
 */
const formatTimestamp = (timestamp: string | null) => {
  if (!timestamp) return 'Never'
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return date.toLocaleDateString()
}
</script>

<template>
  <div v-if="devices.length === 0" class="no-devices">
    No connected devices yet
  </div>

  <div v-else class="devices-list">
    <div
      v-for="device in devices"
      :key="device.id"
      class="device-item"
      :class="{ current: device.isCurrentDevice }"
    >
      <div class="device-info">
        <span class="device-icon">
          {{ device.deviceType === 'mobile' ? '📱' : (device.deviceType === 'tablet' ? '📲' : '💻') }}
        </span>
        <div>
          <div class="device-name">
            {{ device.deviceName || 'Unknown Device' }}
            <span v-if="device.isCurrentDevice" class="current-badge">(This device)</span>
          </div>
          <div class="device-last-seen">
            Last seen: {{ formatTimestamp(device.last_sync) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-devices {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.dark .no-devices {
  color: #a0aec0;
}

.devices-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.device-item.current {
  border: 2px solid #48bb78;
}

.dark .device-item {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
}

.device-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.device-icon {
  font-size: 1.5rem;
}

.device-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.dark .device-name {
  color: #e2e8f0;
}

.current-badge {
  color: #48bb78;
  font-size: 0.85rem;
}

.device-last-seen {
  font-size: 0.85rem;
  color: #718096;
}

.dark .device-last-seen {
  color: #a0aec0;
}
</style>
