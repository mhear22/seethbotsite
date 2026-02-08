<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/useAuthStore'

// Router
const router = useRouter()

// Store
const authStore = useAuthStore()

// Form state
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const displayName = ref('')

// Validation state
const errors = ref<Record<string, string>>({})

// Processing state
const isSubmitting = ref(false)

// Success message
const showSuccess = ref(false)

/**
 * Validate form
 */
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!email.value) {
    newErrors.email = 'Email is required'
  } else if (!email.value.includes('@')) {
    newErrors.email = 'Please enter a valid email address'
  }

  if (!password.value) {
    newErrors.password = 'Password is required'
  } else if (password.value.length < 8) {
    newErrors.password = 'Password must be at least 8 characters'
  }

  if (!confirmPassword.value) {
    newErrors.confirmPassword = 'Please confirm your password'
  } else if (confirmPassword.value !== password.value) {
    newErrors.confirmPassword = 'Passwords do not match'
  }

  if (displayName.value && displayName.value.length > 50) {
    newErrors.displayName = 'Display name must be less than 50 characters'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

/**
 * Handle registration
 */
const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  errors.value = {}

  const result = await authStore.register(
    email.value,
    password.value,
    displayName.value || undefined
  )

  if (result.success && result.user) {
    showSuccess.value = true
    setTimeout(() => {
      // Navigate to home
      router.push('/')
    }, 500)
  } else {
    errors.value.general = result.error || 'Registration failed. Please try again.'
    isSubmitting.value = false
  }
}

/**
 * Clear error on input
 */
const clearError = (field: string) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
  if (errors.value.general) {
    delete errors.value.general
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1 class="auth-title">Create Account</h1>
      <p class="auth-subtitle">Join us today</p>

      <!-- General error message -->
      <div v-if="errors.general" class="auth-error">
        {{ errors.general }}
      </div>

      <!-- Success message -->
      <div v-if="showSuccess" class="auth-success">
        Account created successfully! Redirecting...
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <!-- Email field -->
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="your@email.com"
            :class="{ 'form-input-error': errors.email }"
            @input="clearError('email')"
            :disabled="isSubmitting || showSuccess"
            required
          />
          <div v-if="errors.email" class="form-error">
            {{ errors.email }}
          </div>
        </div>

        <!-- Display name field (optional) -->
        <div class="form-group">
          <label for="displayName" class="form-label">Display Name (optional)</label>
          <input
            id="displayName"
            v-model="displayName"
            type="text"
            class="form-input"
            placeholder="Your name"
            :class="{ 'form-input-error': errors.displayName }"
            @input="clearError('displayName')"
            :disabled="isSubmitting || showSuccess"
            maxlength="50"
          />
          <div v-if="errors.displayName" class="form-error">
            {{ errors.displayName }}
          </div>
        </div>

        <!-- Password field -->
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="••••••••"
            :class="{ 'form-input-error': errors.password }"
            @input="clearError('password')"
            :disabled="isSubmitting || showSuccess"
            required
          />
          <div v-if="errors.password" class="form-error">
            {{ errors.password }}
          </div>
        </div>

        <!-- Confirm password field -->
        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            class="form-input"
            placeholder="••••••••"
            :class="{ 'form-input-error': errors.confirmPassword }"
            @input="clearError('confirmPassword')"
            :disabled="isSubmitting || showSuccess"
            required
          />
          <div v-if="errors.confirmPassword" class="form-error">
            {{ errors.confirmPassword }}
          </div>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          class="auth-button"
          :disabled="isSubmitting || showSuccess"
        >
          <span v-if="isSubmitting">Creating account...</span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <!-- Login link -->
      <div class="auth-footer">
        Already have an account?
        <router-link to="/login" class="auth-link">
          Sign in
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
}

.auth-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--text-primary);
  text-align: center;
}

.auth-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 24px 0;
  text-align: center;
}

.auth-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  color: var(--error);
  font-size: 14px;
}

.auth-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  color: var(--success);
  font-size: 14px;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input-error {
  border-color: var(--error);
}

.form-input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-error {
  font-size: 12px;
  color: var(--error);
  margin-top: 4px;
}

.auth-button {
  padding: 12px 24px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-button:hover:not(:disabled) {
  background: var(--primary-color-dark);
  transform: translateY(-1px);
}

.auth-button:active:not(:disabled) {
  transform: translateY(0);
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.auth-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
}

.auth-link:hover {
  text-decoration: underline;
}

/* Dark mode support */
:global(.dark) .auth-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

:global(.dark) .auth-card {
  background: rgba(30, 30, 40, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:global(.dark) .form-input {
  background: rgba(20, 20, 30, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

:global(.dark) .form-input:focus {
  border-color: var(--primary-color);
}

/* Darker mode */
:global(.darker) .auth-container {
  background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%);
}

:global(.darker) .auth-card {
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

:global(.darker) .form-input {
  background: rgba(5, 5, 5, 0.5);
  border-color: rgba(255, 255, 255, 0.05);
}

/* Chaos mode */
:global(.chaos) .auth-card {
  animation: chaos-wiggle 0.5s ease-in-out infinite alternate;
}

@keyframes chaos-wiggle {
  0% {
    transform: rotate(-0.5deg);
  }
  100% {
    transform: rotate(0.5deg);
  }
}
</style>
