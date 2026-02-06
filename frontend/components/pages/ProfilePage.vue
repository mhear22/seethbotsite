<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const route = useRoute()
const auth = useAuth()

// View mode: 'own' for viewing own profile, 'view' for viewing another user's profile
const viewMode = computed(() => {
  const userId = parseInt(route.params.id as string)
  if (!isNaN(userId) && userId !== auth.user.value?.id) {
    return 'view'
  }
  return 'own'
})

// Viewing another user's profile
const otherUserId = computed(() => parseInt(route.params.id as string))
const otherUserProfile = ref<any>(null)
const loadingOtherProfile = ref(false)
const otherProfileError = ref('')

// Profile editing
const isEditing = ref(false)
const profileForm = ref({
  displayName: '',
  avatarUrl: '',
  bio: ''
})

const successMessage = ref('')
const errorMessage = ref('')

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

// Start editing profile
const startEditing = () => {
  if (auth.user.value) {
    profileForm.value = {
      displayName: auth.user.value.display_name || '',
      avatarUrl: (auth.user.value as any).avatar_url || '',
      bio: (auth.user.value as any).bio || ''
    }
  }
  isEditing.value = true
  clearMessages()
}

// Cancel editing
const cancelEditing = () => {
  isEditing.value = false
  clearMessages()
}

// Save profile
const handleSaveProfile = async () => {
  clearMessages()

  try {
    let hasUpdates = false

    // Update display name if changed
    if (profileForm.value.displayName !== auth.user.value?.display_name) {
      const result = await auth.updateProfile(profileForm.value.displayName)
      if (!result.success) {
        errorMessage.value = result.error || 'Failed to update display name'
        return
      }
      hasUpdates = true
    }

    // Update avatar if changed
    const currentAvatarUrl = (auth.user.value as any)?.avatar_url || ''
    if (profileForm.value.avatarUrl !== currentAvatarUrl) {
      const result = await updateAvatar(profileForm.value.avatarUrl || null)
      if (!result.success) {
        errorMessage.value = result.error || 'Failed to update avatar'
        return
      }
      hasUpdates = true
    }

    // Update bio if changed
    const currentBio = (auth.user.value as any)?.bio || ''
    if (profileForm.value.bio !== currentBio) {
      const result = await updateBio(profileForm.value.bio || null)
      if (!result.success) {
        errorMessage.value = result.error || 'Failed to update bio'
        return
      }
      hasUpdates = true
    }

    if (hasUpdates) {
      successMessage.value = 'Profile updated successfully!'
      await auth.validateToken() // Refresh user data
      setTimeout(() => {
        isEditing.value = false
        successMessage.value = ''
      }, 1500)
    } else {
      isEditing.value = false
    }
  } catch (error) {
    console.error('Error saving profile:', error)
    errorMessage.value = 'Failed to save profile'
  }
}

// Update avatar
const updateAvatar = async (avatarUrl: string | null) => {
  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch('/api/auth/avatar', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ avatarUrl })
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true }
    } else {
      return { success: false, error: data.error || 'Failed to update avatar' }
    }
  } catch (error) {
    console.error('Error updating avatar:', error)
    return { success: false, error: 'Failed to update avatar' }
  }
}

// Update bio
const updateBio = async (bio: string | null) => {
  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch('/api/auth/bio', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bio })
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true }
    } else {
      return { success: false, error: data.error || 'Failed to update bio' }
    }
  } catch (error) {
    console.error('Error updating bio:', error)
    return { success: false, error: 'Failed to update bio' }
  }
}

// Clear messages
const clearMessages = () => {
  successMessage.value = ''
  errorMessage.value = ''
}

// Display name (with fallback)
const displayDisplayName = (user: any) => {
  return user?.display_name || user?.email?.split('@')[0] || 'Anonymous'
}

// Avatar URL (with fallback)
const displayAvatarUrl = (user: any) => {
  return user?.avatar_url || ''
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

// Format date
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Unknown'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadOtherProfile()
})
</script>

<template>
  <div class="profile-page">
    <!-- Viewing own profile -->
    <div v-if="viewMode === 'own'" class="profile-container">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="avatar-section">
          <div v-if="displayAvatarUrl(auth.user)" class="avatar-image">
            <img :src="displayAvatarUrl(auth.user)" alt="Avatar" />
          </div>
          <div v-else class="avatar-fallback">
            {{ getInitials(displayDisplayName(auth.user)) }}
          </div>
        </div>
        <div class="profile-info">
          <h1 class="profile-name">{{ displayDisplayName(auth.user) }}</h1>
          <p class="profile-email">{{ auth.user?.email }}</p>
          <p class="profile-member-since">Member since {{ formatDate(auth.user?.created_at || '') }}</p>
        </div>
        <button
          v-if="!isEditing && auth.isAuthenticated"
          class="edit-profile-btn"
          @click="startEditing"
        >
          ✏️ Edit Profile
        </button>
      </div>

      <!-- Bio Section -->
      <div class="profile-section">
        <h2 class="section-title">About</h2>
        <div class="bio-content">
          <p v-if="(auth.user as any)?.bio" class="bio-text">
            {{ (auth.user as any).bio }}
          </p>
          <p v-else class="bio-empty">
            No bio yet. Click "Edit Profile" to add one!
          </p>
        </div>
      </div>

      <!-- Edit Form -->
      <div v-if="isEditing" class="profile-edit-form">
        <h2 class="section-title">Edit Profile</h2>

        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-group">
          <label>Display Name</label>
          <input
            v-model="profileForm.displayName"
            type="text"
            placeholder="Your display name"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Avatar URL</label>
          <input
            v-model="profileForm.avatarUrl"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            class="form-input"
          />
          <p class="form-help">
            Enter a URL to your profile image. Leave empty to use initials.
          </p>
        </div>

        <div class="form-group">
          <label>Bio</label>
          <textarea
            v-model="profileForm.bio"
            placeholder="Tell us about yourself..."
            class="form-textarea"
            maxlength="500"
            rows="4"
          ></textarea>
          <p class="form-help">
            {{ profileForm.bio.length }}/500 characters
          </p>
        </div>

        <div class="form-actions">
          <button
            class="btn btn-secondary"
            @click="cancelEditing"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary"
            @click="handleSaveProfile"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- Viewing another user's profile -->
    <div v-else class="profile-container">
      <div v-if="loadingOtherProfile" class="loading">
        Loading profile...
      </div>

      <div v-else-if="otherProfileError" class="error-message">
        {{ otherProfileError }}
      </div>

      <div v-else-if="otherUserProfile" class="profile-header">
        <div class="avatar-section">
          <div v-if="displayAvatarUrl(otherUserProfile)" class="avatar-image">
            <img :src="displayAvatarUrl(otherUserProfile)" alt="Avatar" />
          </div>
          <div v-else class="avatar-fallback">
            {{ getInitials(displayDisplayName(otherUserProfile)) }}
          </div>
        </div>
        <div class="profile-info">
          <h1 class="profile-name">{{ displayDisplayName(otherUserProfile) }}</h1>
          <p class="profile-member-since">Member since {{ formatDate(otherUserProfile.created_at || '') }}</p>
        </div>
      </div>

      <div v-if="otherUserProfile && otherUserProfile.bio" class="profile-section">
        <h2 class="section-title">About</h2>
        <div class="bio-content">
          <p class="bio-text">{{ otherUserProfile.bio }}</p>
        </div>
      </div>
    </div>
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
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 30px;
  gap: 24px;
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--accent);
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
}

.profile-name {
  font-size: 28px;
  margin: 0 0 8px 0;
  color: var(--text-primary);
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
}

.edit-profile-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.profile-section {
  padding: 24px 30px;
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  font-size: 20px;
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

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

.profile-edit-form {
  padding: 24px 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-weight: 500;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 15px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-help {
  font-size: 13px;
  color: var(--text-tertiary);
  margin-top: 6px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

.success-message {
  background: #10b981;
  color: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.error-message {
  background: #ef4444;
  color: white;
  padding: 12px;
  border-radius: 8px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 640px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .avatar-section {
    margin: 0 auto;
  }

  .profile-info {
    text-align: center;
  }

  .edit-profile-btn {
    width: 100%;
  }
}
</style>
