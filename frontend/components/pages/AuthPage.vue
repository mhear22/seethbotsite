<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { formatDate } from '../../utils/format'

// Router
const route = useRoute()

// Auth composable
const auth = useAuth()

// Form mode: 'login' | 'register' | 'profile'
const mode = ref<'login' | 'register' | 'profile'>('login')

// Set initial mode from query parameter
onMounted(() => {
  const queryMode = route.query.mode as string
  if (queryMode === 'register') {
    mode.value = 'register'
  } else if (queryMode === 'login') {
    mode.value = 'login'
  } else if (auth.isAuthenticated.value) {
    mode.value = 'profile'
  }
})
const showPassword = ref(false)

// Login form
const loginForm = ref({
  email: '',
  password: ''
})

// Register form
const registerForm = ref({
  email: '',
  password: '',
  confirmPassword: '',
  displayName: ''
})

// Profile form
const profileForm = ref({
  displayName: ''
})

// Change password form
const changePasswordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: ''
})

const successMessage = ref('')
const errorMessage = ref('')

const setMode = (newMode: 'login' | 'register' | 'profile') => {
  mode.value = newMode
  clearMessages()
  // Pre-fill profile form
  if (newMode === 'profile' && auth.user.value) {
    profileForm.value.displayName = auth.user.value.display_name || ''
  }
}

const clearMessages = () => {
  successMessage.value = ''
  errorMessage.value = ''
}

const handleLogin = async () => {
  clearMessages()

  if (!loginForm.value.email || !loginForm.value.password) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  const result = await auth.login(
    loginForm.value.email,
    loginForm.value.password
  )

  if (result.success && result.user) {
    successMessage.value = 'Login successful!'
    loginForm.value = { email: '', password: '' }
    setTimeout(() => setMode('profile'), 1000)
  } else if (result.error) {
    errorMessage.value = result.error
  }
}

const handleRegister = async () => {
  clearMessages()

  if (!registerForm.value.email || !registerForm.value.password || !registerForm.value.displayName) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  if (registerForm.value.password.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters'
    return
  }

  const result = await auth.register(
    registerForm.value.email,
    registerForm.value.password,
    registerForm.value.displayName
  )

  if (result.success && result.user) {
    successMessage.value = 'Registration successful!'
    registerForm.value = { email: '', password: '', confirmPassword: '', displayName: '' }
    setTimeout(() => setMode('login'), 1500)
  } else if (result.error) {
    errorMessage.value = result.error
  }
}

const handleUpdateProfile = async () => {
  clearMessages()

  if (!profileForm.value.displayName) {
    errorMessage.value = 'Display name is required'
    return
  }

  const result = await auth.updateProfile(profileForm.value.displayName)

  if (result.success && result.user) {
    successMessage.value = 'Profile updated successfully!'
  } else if (result.error) {
    errorMessage.value = result.error
  }
}

const handleChangePassword = async () => {
  clearMessages()

  if (!changePasswordForm.value.oldPassword || !changePasswordForm.value.newPassword) {
    errorMessage.value = 'Please fill in all fields'
    return
  }

  if (changePasswordForm.value.newPassword !== changePasswordForm.value.confirmNewPassword) {
    errorMessage.value = 'New passwords do not match'
    return
  }

  if (changePasswordForm.value.newPassword.length < 8) {
    errorMessage.value = 'New password must be at least 8 characters'
    return
  }

  const result = await auth.changePassword(
    changePasswordForm.value.oldPassword,
    changePasswordForm.value.newPassword
  )

  if (result.success) {
    successMessage.value = 'Password changed successfully!'
    changePasswordForm.value = { oldPassword: '', newPassword: '', confirmNewPassword: '' }
  } else if (result.error) {
    errorMessage.value = result.error
  }
}

const handleLogout = async () => {
  if (confirm('Are you sure you want to logout?')) {
    await auth.logout()
    successMessage.value = 'Logged out successfully'
    setMode('login')
  }
}

const handleDeleteAccount = async () => {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    const password = prompt('Please enter your password to confirm account deletion:')
    if (!password) return

    const result = await auth.deleteAccount(password)
    if (result.success) {
      successMessage.value = 'Account deleted successfully'
      setMode('login')
    } else if (result.error) {
      errorMessage.value = result.error
    }
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <h1>🔐 Account</h1>
        <p v-if="auth.isAuthenticated.value">Welcome, {{ auth.user.value?.display_name || auth.user.value?.email }}!</p>
      </div>

      <!-- Messages -->
      <div v-if="successMessage" class="auth-message auth-message-success" role="status" aria-live="polite">
        ✅ {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="auth-message auth-message-error" role="alert" aria-live="assertive">
        ❌ {{ errorMessage }}
      </div>

      <!-- Mode Tabs (only when authenticated) -->
      <div v-if="auth.isAuthenticated.value" class="auth-tabs">
        <button
          :class="{ active: mode === 'profile' }"
          @click="setMode('profile')"
        >
          👤 Profile
        </button>
        <button
          @click="handleLogout"
        >
          🚪 Logout
        </button>
      </div>

      <!-- Login Form -->
      <div v-if="mode === 'login'" class="auth-form">
        <h2>Sign In</h2>

        <div class="form-group">
          <label>Email</label>
          <input
            v-model="loginForm.email"
            type="email"
            placeholder="your@email.com"
            @keyup.enter="handleLogin"
            :disabled="auth.loading.value"
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input
            v-model="loginForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            @keyup.enter="handleLogin"
            :disabled="auth.loading.value"
          />
          <button class="toggle-password" @click="showPassword = !showPassword">
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
        </div>

        <button class="auth-btn auth-btn-primary" @click="handleLogin" :disabled="auth.loading.value">
          {{ auth.loading.value ? 'Signing in...' : 'Sign In' }}
        </button>

        <p class="auth-switch">
          Don't have an account?
          <a @click="setMode('register')">Create one</a>
        </p>
      </div>

      <!-- Register Form -->
      <div v-if="mode === 'register'" class="auth-form">
        <h2>Create Account</h2>

        <div class="form-group">
          <label>Email</label>
          <input
            v-model="registerForm.email"
            type="email"
            placeholder="your@email.com"
            @keyup.enter="handleRegister"
            :disabled="auth.loading.value"
          />
        </div>

        <div class="form-group">
          <label>Display Name</label>
          <input
            v-model="registerForm.displayName"
            type="text"
            placeholder="Your Name"
            @keyup.enter="handleRegister"
            :disabled="auth.loading.value"
          />
        </div>

        <div class="form-group">
          <label>Password (min 8 characters)</label>
          <input
            v-model="registerForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            :disabled="auth.loading.value"
          />
        </div>

        <div class="form-group">
          <label>Confirm Password</label>
          <input
            v-model="registerForm.confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            @keyup.enter="handleRegister"
            :disabled="auth.loading.value"
          />
          <button class="toggle-password" @click="showPassword = !showPassword">
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
        </div>

        <button class="auth-btn auth-btn-primary" @click="handleRegister" :disabled="auth.loading.value">
          {{ auth.loading.value ? 'Creating...' : 'Create Account' }}
        </button>

        <p class="auth-switch">
          Already have an account?
          <a @click="setMode('login')">Sign in</a>
        </p>
      </div>

      <!-- Profile Form -->
      <div v-if="mode === 'profile' && auth.isAuthenticated.value" class="auth-form">
        <h2>Profile Settings</h2>

        <div class="form-group">
          <label>Email</label>
          <input
            :value="auth.user.value?.email"
            type="email"
            disabled
            class="disabled-input"
          />
        </div>

        <div class="form-group">
          <label>Display Name</label>
          <input
            v-model="profileForm.displayName"
            type="text"
            @keyup.enter="handleUpdateProfile"
            :disabled="auth.loading.value"
          />
        </div>

        <button class="auth-btn auth-btn-primary" @click="handleUpdateProfile" :disabled="auth.loading.value">
          {{ auth.loading.value ? 'Updating...' : 'Update Profile' }}
        </button>

        <hr class="auth-divider" />

        <h3>Change Password</h3>

        <div class="form-group">
          <label>Current Password</label>
          <input
            v-model="changePasswordForm.oldPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            :disabled="auth.loading.value"
          />
        </div>

        <div class="form-group">
          <label>New Password</label>
          <input
            v-model="changePasswordForm.newPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            :disabled="auth.loading.value"
          />
        </div>

        <div class="form-group">
          <label>Confirm New Password</label>
          <input
            v-model="changePasswordForm.confirmNewPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            @keyup.enter="handleChangePassword"
            :disabled="auth.loading.value"
          />
          <button class="toggle-password" @click="showPassword = !showPassword">
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
        </div>

        <button class="auth-btn auth-btn-secondary" @click="handleChangePassword" :disabled="auth.loading.value">
          {{ auth.loading.value ? 'Changing...' : 'Change Password' }}
        </button>

        <hr class="auth-divider" />

        <button class="auth-btn auth-btn-danger" @click="handleDeleteAccount" :disabled="auth.loading.value">
          🗑️ Delete Account
        </button>

        <p class="auth-info">
          Account created: {{ formatDate(auth.user.value?.created_at || '') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  padding: 100px 20px 40px;
  display: flex;
  justify-content: center;
}

.auth-container {
  max-width: 450px;
  width: 100%;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  color: #2d3748;
}

.auth-header p {
  color: #718096;
  margin: 0;
}

.auth-message {
  padding: 14px 18px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
}

.auth-message-success {
  background: #c6f6d5;
  color: #2f855a;
  border: 1px solid #9ae6b4;
}

.auth-message-error {
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #fc8181;
}

.auth-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  justify-content: center;
}

.auth-tabs button {
  padding: 10px 20px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-tabs button:hover {
  border-color: #4299e1;
  color: #2b6cb0;
}

.auth-tabs button.active {
  background: #4299e1;
  border-color: #4299e1;
  color: white;
}

.auth-form {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.auth-form h2 {
  margin: 0 0 24px 0;
  color: #2d3748;
  font-size: 1.75rem;
}

.auth-form h3 {
  margin: 24px 0 16px 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.form-group {
  margin-bottom: 18px;
  position: relative;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.2s;
  background: white;
  color: #2d3748;
}

.form-group input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-group input:disabled,
.disabled-input {
  background: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.toggle-password:hover {
  background: #f7fafc;
}

.auth-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
}

.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.auth-btn-primary {
  background: #4299e1;
  color: white;
}

.auth-btn-primary:hover:not(:disabled) {
  background: #3182ce;
  transform: translateY(-1px);
}

.auth-btn-secondary {
  background: #718096;
  color: white;
}

.auth-btn-secondary:hover:not(:disabled) {
  background: #4a5568;
}

.auth-btn-danger {
  background: #f56565;
  color: white;
}

.auth-btn-danger:hover:not(:disabled) {
  background: #c53030;
}

.auth-divider {
  border: none;
  border-top: 2px solid #e2e8f0;
  margin: 24px 0;
}

.auth-switch {
  text-align: center;
  margin-top: 16px;
  color: #718096;
  font-size: 14px;
}

.auth-switch a {
  color: #4299e1;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
}

.auth-switch a:hover {
  text-decoration: underline;
}

.auth-info {
  text-align: center;
  margin-top: 20px;
  color: #718096;
  font-size: 13px;
}

/* Responsive */
@media (max-width: 640px) {
  .auth-page {
    padding: 80px 16px 20px;
  }

  .auth-header h1 {
    font-size: 2rem;
  }

  .auth-form {
    padding: 20px;
  }
}
</style>
