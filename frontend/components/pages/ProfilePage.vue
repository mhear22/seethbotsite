<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { formatDate } from '../../utils/format'
import EditProfileModal from '../modals/EditProfileModal.vue'
import ProfileCard from '../shared/ui/ProfileCard.vue'

const route = useRoute()
const auth = reactive(useAuth())

// View mode: 'own' for viewing own profile, 'view' for viewing another user's profile
const viewMode = computed(() => {
  const userId = parseInt(route.params.id as string)
  if (!isNaN(userId) && userId !== auth.user?.id) {
    return 'view'
  }
  return 'own'
})

// Viewing another user's profile
const otherUserId = computed(() => parseInt(route.params.id as string))
const otherUserProfile = ref<any>(null)
const loadingOtherProfile = ref(false)
const otherProfileError = ref('')

// Profile editing modal
const isEditModalOpen = ref(false)

// User stats and achievements
const userStats = ref<any>(null)
const userAchievements = ref<any[]>([])
const loadingStats = ref(false)

// Load other user's profile
const loadOtherProfile = async () => {
  if (viewMode.value === 'own' || !otherUserId.value) return

  loadingOtherProfile.value = true
  otherProfileError.value = ''
  try {
    const response = await fetch(`/api/profile/${otherUserId.value}`)
    const data = await response.json()

    if (response.ok) {
      otherUserProfile.value = data.user
      await loadUserStats(otherUserId.value)
    } else {
      otherProfileError.value = data.error || 'Failed to load profile'
    }
  } catch (error) {
    console.error('Failed to load profile:', error)
    otherProfileError.value = 'Failed to load profile'
  } finally {
    loadingOtherProfile.value = false
  }
}

// Load user stats (coolness points, etc.)
const loadUserStats = async (userId?: number) => {
  const targetUserId = userId || auth.user?.id
  if (!targetUserId) return

  loadingStats.value = true
  try {
    const response = await fetch(`/api/points/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: targetUserId.toString() })
    })
    const data = await response.json()

    if (response.ok) {
      userStats.value = data
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  } finally {
    loadingStats.value = false
  }
}

// Load user achievements
const loadUserAchievements = async () => {
  const targetUserId = auth.user?.id
  if (!targetUserId) return

  try {
    const response = await fetch(`/api/achievements`, {
      headers: { 'X-User-Id': targetUserId.toString() }
    })
    const data = await response.json()

    if (response.ok) {
      userAchievements.value = data.achievements || []
    }
  } catch (error) {
    console.error('Failed to load achievements:', error)
  }
}

// Open edit modal
const openEditModal = () => {
  isEditModalOpen.value = true
}

// Close edit modal
const closeEditModal = () => {
  isEditModalOpen.value = false
}

// Handle profile save
const handleProfileSave = async () => {
  await loadUserStats()
  await loadUserAchievements()
}

// Display name (with fallback)
const displayDisplayName = (user: any) => {
  return user?.display_name || user?.email?.split('@')[0] || 'Anonymous'
}

// Avatar URL (with fallback)
const displayAvatarUrl = (user: any) => {
  return user?.avatar_url || ''
}

// Banner URL (with fallback)
const displayBannerUrl = (user: any) => {
  return user?.banner_url || ''
}

// Status message
const displayStatus = (user: any) => {
  return user?.status || ''
}

// Bio text
const displayBio = (user: any) => {
  return user?.bio || ''
}

// Get initials for avatar fallback
const getInitials = (name: string) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Current user for display
const displayUser = computed(() => {
  return viewMode.value === 'own' ? auth.user : otherUserProfile.value
})

onMounted(async () => {
  if (viewMode.value === 'own') {
    await loadUserStats()
    await loadUserAchievements()
  } else {
    await loadOtherProfile()
  }
})
</script>

<template>
  <div class="profile-page">
    <div v-if="loadingOtherProfile" class="loading">
      Loading profile...
    </div>

    <div v-else-if="otherProfileError" class="error-message">
      {{ otherProfileError }}
    </div>

    <div v-else-if="displayUser" class="profile-container">
      <!-- Banner -->
      <div v-if="displayBannerUrl(displayUser)" class="profile-banner">
        <img :src="displayBannerUrl(displayUser)" alt="Banner" />
      </div>
      <div v-else class="profile-banner-placeholder"></div>

      <!-- Profile Header -->
      <div class="profile-header">
        <div class="avatar-section">
          <div v-if="displayAvatarUrl(displayUser)" class="avatar-image">
            <img :src="displayAvatarUrl(displayUser)" alt="Avatar" />
          </div>
          <div v-else class="avatar-fallback">
            {{ getInitials(displayDisplayName(displayUser)) }}
          </div>
        </div>
        <div class="profile-info">
          <h1 class="profile-name">{{ displayDisplayName(displayUser) }}</h1>
          <p v-if="displayStatus(displayUser)" class="profile-status">
            {{ displayStatus(displayUser) }}
          </p>
          <p v-if="(displayUser as any)?.show_email !== false" class="profile-email">
            {{ displayUser.email }}
          </p>
          <p v-if="(displayUser as any)?.show_joined_date !== false" class="profile-member-since">
            Member since {{ formatDate(displayUser.created_at || '', false, 'long') }}
          </p>
        </div>
        <button
          v-if="viewMode === 'own' && auth.isAuthenticated"
          class="edit-profile-btn"
          @click="openEditModal"
        >
          ✏️ Edit Profile
        </button>
      </div>

      <!-- Stats Section (Coolness Points) -->
      <div v-if="userStats && viewMode === 'own'" class="profile-section">
        <h2 class="section-title">Stats</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.score || 0 }}</div>
              <div class="stat-label">Coolness Points</div>
            </div>
          </div>
          <div v-if="userStats.baseScore !== undefined" class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.baseScore || 0 }}</div>
              <div class="stat-label">Base Score</div>
            </div>
          </div>
          <div v-if="userStats.lastInteraction" class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-info">
              <div class="stat-value">
                {{ formatDate(userStats.lastInteraction, false, 'relative') }}
              </div>
              <div class="stat-label">Last Interaction</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievements Section -->
      <div v-if="userAchievements.length > 0 && viewMode === 'own'" class="profile-section">
        <h2 class="section-title">Achievements</h2>
        <div class="achievements-grid">
          <div
            v-for="achievement in userAchievements"
            :key="achievement.id"
            class="achievement-card"
            :title="achievement.description"
          >
            <div class="achievement-icon">{{ achievement.icon || '🏆' }}</div>
            <div class="achievement-info">
              <div class="achievement-name">{{ achievement.name }}</div>
              <div v-if="achievement.unlockedAt" class="achievement-date">
                {{ formatDate(achievement.unlockedAt, false, 'relative') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bio Section -->
      <div class="profile-section">
        <h2 class="section-title">About</h2>
        <div class="bio-content">
          <p v-if="displayBio(displayUser)" class="bio-text">
            {{ displayBio(displayUser) }}
          </p>
          <p v-else class="bio-empty">
            No bio yet.
            <span v-if="viewMode === 'own'">Click "Edit Profile" to add one!</span>
          </p>
        </div>
      </div>

      <!-- Profile Card Preview (for testing) -->
      <div v-if="viewMode === 'own'" class="profile-section">
        <h2 class="section-title">Profile Card Preview</h2>
        <ProfileCard :user="auth.user" />
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <EditProfileModal
      :is-open="isEditModalOpen"
      :user-data="auth.user"
      @close="closeEditModal"
      @save="handleProfileSave"
    />
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-container {
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Banner */
.profile-banner {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--accent);
}

.profile-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-banner-placeholder {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
}

/* Header */
.profile-header {
  display: flex;
  align-items: flex-start;
  padding: 30px;
  gap: 24px;
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.avatar-section {
  flex-shrink: 0;
  margin-top: -60px;
}

.avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--accent);
  border: 4px solid var(--bg-card);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.avatar-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-hover));
  border: 4px solid var(--bg-card);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  color: white;
}

.profile-info {
  flex: 1;
  min-width: 200px;
  margin-top: 30px;
}

.profile-name {
  font-size: 28px;
  margin: 0 0 8px 0;
  color: var(--text-primary);
}

.profile-status {
  color: var(--text-secondary);
  margin: 0 0 4px 0;
  font-style: italic;
}

.profile-email {
  color: var(--text-secondary);
  margin: 0 0 4px 0;
}

.profile-member-since {
  color: var(--text-tertiary);
  margin: 0;
  font-size: 14px;
}

.edit-profile-btn {
  background: var(--accent);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  margin-top: 20px;
}

.edit-profile-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

/* Sections */
.profile-section {
  padding: 24px 30px;
  border-bottom: 1px solid var(--border-color);
}

.profile-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 20px;
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

/* Bio */
.bio-content {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 16px;
}

.bio-text {
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

.bio-empty {
  color: var(--text-tertiary);
  margin: 0;
  font-style: italic;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 32px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-primary);
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* Achievements Grid */
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.achievement-card {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.2s;
}

.achievement-card:hover {
  transform: translateY(-2px);
}

.achievement-icon {
  font-size: 28px;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.achievement-date {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

/* Loading & Errors */
.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

.error-message {
  background: #ef4444;
  color: white;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

/* Responsive */
@media (max-width: 640px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .avatar-section {
    margin: -60px auto 0;
  }

  .profile-info {
    text-align: center;
    margin-top: 16px;
  }

  .edit-profile-btn {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .achievements-grid {
    grid-template-columns: 1fr;
  }
}
</style>
