<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import Modal from '../shared/ui/Modal.vue'
import AvatarUpload from './AvatarUpload.vue'
import { useAuth } from '../../composables/useAuth'

interface Props {
  isOpen: boolean
  userData?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [data: any]
}>()

const auth = reactive(useAuth())

const profileForm = reactive({
  displayName: '',
  avatarUrl: '',
  bannerUrl: '',
  bio: '',
  status: '',
  showEmail: true,
  showJoinedDate: true
})

const avatarFile = ref<File | null>(null)
const bannerFile = ref<File | null>(null)

const isSaving = ref(false)
const errorMessage = ref('')

const MAX_BIO_LENGTH = 500
const MAX_STATUS_LENGTH = 100

const bioCharCount = computed(() => profileForm.bio.length)
const statusCharCount = computed(() => profileForm.status.length)

const bioCharCountColor = computed(() => {
  const percentage = (bioCharCount.value / MAX_BIO_LENGTH) * 100
  if (percentage >= 100) return '#ef4444'
  if (percentage >= 80) return '#f59e0b'
  return '#718096'
})

const statusCharCountColor = computed(() => {
  const percentage = (statusCharCount.value / MAX_STATUS_LENGTH) * 100
  if (percentage >= 100) return '#ef4444'
  if (percentage >= 80) return '#f59e0b'
  return '#718096'
})

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.userData) {
    profileForm.displayName = props.userData.display_name || ''
    profileForm.avatarUrl = (props.userData as any).avatar_url || ''
    profileForm.bannerUrl = (props.userData as any).banner_url || ''
    profileForm.bio = (props.userData as any).bio || ''
    profileForm.status = (props.userData as any).status || ''
    profileForm.showEmail = (props.userData as any).show_email ?? true
    profileForm.showJoinedDate = (props.userData as any).show_joined_date ?? true
  } else if (newVal && auth.user) {
    profileForm.displayName = auth.user.display_name || ''
    profileForm.avatarUrl = (auth.user as any).avatar_url || ''
    profileForm.bannerUrl = (auth.user as any).banner_url || ''
    profileForm.bio = (auth.user as any).bio || ''
    profileForm.status = (auth.user as any).status || ''
    profileForm.showEmail = (auth.user as any).show_email ?? true
    profileForm.showJoinedDate = (auth.user as any).show_joined_date ?? true
  }
})

const handleAvatarChange = (url: string) => {
  profileForm.avatarUrl = url
}

const handleBannerChange = (url: string) => {
  profileForm.bannerUrl = url
}

const handleSave = async () => {
  errorMessage.value = ''
  isSaving.value = true

  try {
    const result = await auth.updateProfile(profileForm.displayName)

    if (!result.success) {
      errorMessage.value = result.error || 'Failed to update profile'
      isSaving.value = false
      return
    }

    // Update avatar if changed
    if (profileForm.avatarUrl !== ((auth.user as any)?.avatar_url || '')) {
      const avatarResult = await updateAvatar(profileForm.avatarUrl || null)
      if (!avatarResult.success) {
        errorMessage.value = avatarResult.error || 'Failed to update avatar'
        isSaving.value = false
        return
      }
    }

    // Update banner if changed
    const currentBannerUrl = (auth.user as any)?.banner_url || ''
    if (profileForm.bannerUrl !== currentBannerUrl) {
      const bannerResult = await updateBanner(profileForm.bannerUrl || null)
      if (!bannerResult.success) {
        errorMessage.value = bannerResult.error || 'Failed to update banner'
        isSaving.value = false
        return
      }
    }

    // Update bio if changed
    const currentBio = (auth.user as any)?.bio || ''
    if (profileForm.bio !== currentBio) {
      const bioResult = await updateBio(profileForm.bio || null)
      if (!bioResult.success) {
        errorMessage.value = bioResult.error || 'Failed to update bio'
        isSaving.value = false
        return
      }
    }

    // Update status if changed
    const currentStatus = (auth.user as any)?.status || ''
    if (profileForm.status !== currentStatus) {
      const statusResult = await updateStatus(profileForm.status || null)
      if (!statusResult.success) {
        errorMessage.value = statusResult.error || 'Failed to update status'
        isSaving.value = false
        return
      }
    }

    // Update privacy settings if changed
    const currentShowEmail = (auth.user as any)?.show_email ?? true
    const currentShowJoinedDate = (auth.user as any)?.show_joined_date ?? true
    if (profileForm.showEmail !== currentShowEmail || profileForm.showJoinedDate !== currentShowJoinedDate) {
      const privacyResult = await updatePrivacy({
        showEmail: profileForm.showEmail,
        showJoinedDate: profileForm.showJoinedDate
      })
      if (!privacyResult.success) {
        errorMessage.value = privacyResult.error || 'Failed to update privacy settings'
        isSaving.value = false
        return
      }
    }

    // Refresh user data
    await auth.validateToken()

    emit('save', { ...profileForm })
    emit('close')
  } catch (error) {
    console.error('Error saving profile:', error)
    errorMessage.value = 'Failed to save profile'
  } finally {
    isSaving.value = false
  }
}

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

const updateBanner = async (bannerUrl: string | null) => {
  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch('/api/auth/banner', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bannerUrl })
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true }
    } else {
      return { success: false, error: data.error || 'Failed to update banner' }
    }
  } catch (error) {
    console.error('Error updating banner:', error)
    return { success: false, error: 'Failed to update banner' }
  }
}

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

const updateStatus = async (status: string | null) => {
  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch('/api/auth/status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true }
    } else {
      return { success: false, error: data.error || 'Failed to update status' }
    }
  } catch (error) {
    console.error('Error updating status:', error)
    return { success: false, error: 'Failed to update status' }
  }
}

const updatePrivacy = async (settings: { showEmail: boolean; showJoinedDate: boolean }) => {
  try {
    const token = localStorage.getItem('auth_token')
    const response = await fetch('/api/auth/privacy', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true }
    } else {
      return { success: false, error: data.error || 'Failed to update privacy settings' }
    }
  } catch (error) {
    console.error('Error updating privacy:', error)
    return { success: false, error: 'Failed to update privacy settings' }
  }
}
</script>

<template>
  <Modal :is-open="isOpen" title="Edit Profile" @close="emit('close')">
    <div class="edit-profile-modal">
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="form-section">
        <h3>Avatar</h3>
        <AvatarUpload
          :initial-url="profileForm.avatarUrl"
          @change="handleAvatarChange"
        />
      </div>

      <div class="form-section">
        <h3>Banner</h3>
        <AvatarUpload
          :initial-url="profileForm.bannerUrl"
          :is-banner="true"
          @change="handleBannerChange"
        />
      </div>

      <div class="form-group">
        <label for="displayName">Display Name</label>
        <input
          id="displayName"
          v-model="profileForm.displayName"
          type="text"
          placeholder="Your display name"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="status">Status</label>
        <input
          id="status"
          v-model="profileForm.status"
          type="text"
          placeholder="What's on your mind?"
          class="form-input"
          maxlength="100"
        />
        <div class="char-count" :style="{ color: statusCharCountColor }">
          {{ statusCharCount }}/{{ MAX_STATUS_LENGTH }}
        </div>
      </div>

      <div class="form-group">
        <label for="bio">Bio</label>
        <textarea
          id="bio"
          v-model="profileForm.bio"
          placeholder="Tell us about yourself..."
          class="form-textarea"
          maxlength="500"
          rows="4"
        ></textarea>
        <div class="char-count" :style="{ color: bioCharCountColor }">
          {{ bioCharCount }}/{{ MAX_BIO_LENGTH }}
        </div>
      </div>

      <div class="form-section">
        <h3>Privacy Settings</h3>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="profileForm.showEmail"
              type="checkbox"
            />
            <span>Show email on profile</span>
          </label>
        </div>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input
              v-model="profileForm.showJoinedDate"
              type="checkbox"
            />
            <span>Show joined date on profile</span>
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button
          class="btn btn-secondary"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          class="btn btn-primary"
          :disabled="isSaving"
          @click="handleSave"
        >
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.edit-profile-modal {
  max-height: 70vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #2d3748);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary, #2d3748);
  font-weight: 500;
  font-size: 14px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #2d3748);
  font-size: 15px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent, #8b5cf6);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.char-count {
  font-size: 12px;
  margin-top: 6px;
  color: var(--text-tertiary, #718096);
  text-align: right;
}

.checkbox-group {
  margin-bottom: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-primary, #2d3748);
  font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent, #8b5cf6);
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
  flex: 1;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent, #8b5cf6);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover, #7c3aed);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-tertiary, #edf2f7);
  color: var(--text-primary, #2d3748);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-hover, #e2e8f0);
}

.error-message {
  background: #ef4444;
  color: white;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
}

/* Dark mode */
.dark .form-input,
.dark .form-textarea {
  background: var(--bg-secondary, #2d3748);
  border-color: var(--border-color, #4a5568);
  color: var(--text-primary, #e2e8f0);
}

.dark .form-input:focus,
.dark .form-textarea:focus {
  border-color: var(--accent, #8b5cf6);
}

.dark .form-group label,
.dark .form-section h3,
.dark .checkbox-label {
  color: var(--text-primary, #e2e8f0);
}

.dark .btn-secondary {
  background: var(--bg-secondary, #2d3748);
  color: var(--text-primary, #e2e8f0);
}

.dark .btn-secondary:hover:not(:disabled) {
  background: var(--bg-hover, #4a5568);
}

.dark .form-section {
  border-bottom-color: var(--border-color, #4a5568);
}
</style>
