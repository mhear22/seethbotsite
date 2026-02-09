<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

interface Props {
  user: any
  size?: 'small' | 'medium' | 'large'
  showStatus?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  showStatus: true,
  clickable: true
})

const router = useRouter()
const auth = reactive(useAuth())

const isOwnProfile = computed(() => {
  return props.user.id === auth.user?.id
})

const displayName = computed(() => {
  return props.user.display_name || props.user.email?.split('@')[0] || 'Anonymous'
})

const avatarUrl = computed(() => {
  return props.user.avatar_url || ''
})

const status = computed(() => {
  return props.user.status || ''
})

const initials = computed(() => {
  if (!displayName.value) return '?'
  return displayName.value
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'small':
      return 'profile-card-small'
    case 'large':
      return 'profile-card-large'
    default:
      return 'profile-card-medium'
  }
})

const handleClick = () => {
  if (!props.clickable) return

  if (isOwnProfile.value) {
    router.push('/profile')
  } else {
    router.push(`/profile/${props.user.id}`)
  }
}
</script>

<template>
  <div
    :class="['profile-card', sizeClasses, { 'is-clickable': clickable }]"
    @click="handleClick"
  >
    <!-- Avatar -->
    <div class="profile-avatar">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        :alt="displayName"
        class="avatar-image"
      />
      <div v-else class="avatar-fallback">
        {{ initials }}
      </div>
    </div>

    <!-- Info -->
    <div class="profile-info">
      <div class="profile-name">{{ displayName }}</div>
      <div v-if="showStatus && status" class="profile-status">
        {{ status }}
      </div>
    </div>

    <!-- Online indicator -->
    <div v-if="user.is_online" class="online-indicator" title="Online"></div>
  </div>
</template>

<style scoped>
.profile-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-card, #ffffff);
  border-radius: 12px;
  border: 1px solid var(--border-color, #e2e8f0);
  transition: all 0.2s;
  position: relative;
}

.profile-card.is-clickable {
  cursor: pointer;
}

.profile-card.is-clickable:hover {
  background: var(--bg-hover, #f7fafc);
  border-color: var(--accent, #8b5cf6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Small size */
.profile-card-small {
  padding: 8px 12px;
  gap: 8px;
}

.profile-card-small .profile-avatar {
  width: 32px;
  height: 32px;
}

.profile-card-small .profile-name {
  font-size: 14px;
}

.profile-card-small .profile-status {
  font-size: 12px;
}

/* Medium size (default) */
.profile-card-medium .profile-avatar {
  width: 48px;
  height: 48px;
}

.profile-card-medium .profile-name {
  font-size: 16px;
}

.profile-card-medium .profile-status {
  font-size: 14px;
}

/* Large size */
.profile-card-large {
  padding: 16px 20px;
  gap: 16px;
}

.profile-card-large .profile-avatar {
  width: 64px;
  height: 64px;
}

.profile-card-large .profile-name {
  font-size: 18px;
}

.profile-card-large .profile-status {
  font-size: 15px;
}

/* Avatar */
.profile-avatar {
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--accent, #8b5cf6), var(--accent-hover, #7c3aed));
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.profile-card-small .avatar-fallback {
  font-size: 14px;
}

.profile-card-large .avatar-fallback {
  font-size: 28px;
}

/* Info */
.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-weight: 600;
  color: var(--text-primary, #2d3748);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-status {
  margin-top: 2px;
  color: var(--text-secondary, #718096);
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Online indicator */
.online-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid var(--bg-card, #ffffff);
  border-radius: 50%;
}

/* Dark mode */
.dark .profile-card {
  background: var(--bg-card, #2d3748);
  border-color: var(--border-color, #4a5568);
}

.dark .profile-card.is-clickable:hover {
  background: var(--bg-hover, #4a5568);
  border-color: var(--accent, #8b5cf6);
}

.dark .profile-name {
  color: var(--text-primary, #e2e8f0);
}

.dark .profile-status {
  color: var(--text-secondary, #a0aec0);
}

.dark .online-indicator {
  border-color: var(--bg-card, #2d3748);
}
</style>
