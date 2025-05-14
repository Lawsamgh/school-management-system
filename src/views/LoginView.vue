<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <!-- <img src="@/assets/logo.png" alt="School Logo" class="login-logo"> -->
        <h2>Welcome Back</h2>
        <p>Sign in to access your account</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="email">
            <i class="fas fa-envelope"></i>
            Email
          </label>
          <input
            type="email"
            id="email"
            v-model="email"
            class="form-control"
            required
            placeholder="Enter your email"
            :disabled="loading"
          >
        </div>
        
        <div class="form-group">
          <label for="password">
            <i class="fas fa-lock"></i>
            Password
          </label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              class="form-control"
              required
              placeholder="Enter your password"
              :disabled="loading"
            >
            <button 
              type="button" 
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <!-- <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe">
            <span>Remember me</span>
          </label>
          <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">Forgot password?</a>
        </div> -->

        <button type="submit" class="login-button" :disabled="loading">
          <span v-if="!loading">Sign In</span>
          <span v-else class="spinner"></span>
        </button>
      </form>

      <div class="login-footer">
        <p class="text-muted">
          <small>Please contact the administrator if you need an account.</small>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true

  try {
    const result = await login(email.value, password.value)

    if (result.success) {
      router.push('/dashboard')
    } else {
      toast.error(result.error || 'Invalid credentials')
    }
  } catch (e: any) {
    toast.error('Login failed. Please try again.')
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  toast.info('Please contact the administrator to reset your password.')
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: calc(100vh - 76px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(66, 184, 131, 0.1) 0%, rgba(66, 184, 131, 0.05) 100%);
}

.login-card {
  width: 100%;
  max-width: 550px;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: slideUp 0.5s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;

  .login-logo {
    width: 80px;
    height: auto;
    margin-bottom: 1rem;
  }

  h2 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  p {
    color: #666;
    font-size: 0.95rem;
  }
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #2c3e50;
    font-weight: 500;
    font-size: 0.95rem;

    i {
      margin-right: 0.5rem;
      color: #42b883;
    }
  }
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  font-size: 1rem;

  &:focus {
    border-color: #42b883;
    box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.2);
    outline: none;
  }

  &:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
}

.password-input {
  position: relative;

  .toggle-password {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 0;
    transition: color 0.3s ease;

    &:hover {
      color: #42b883;
    }
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;

  .remember-me {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;

    input[type="checkbox"] {
      accent-color: #42b883;
    }
  }

  .forgot-password {
    color: #42b883;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: darken(#42b883, 10%);
      text-decoration: underline;
    }
  }
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover:not(:disabled) {
    background: darken(#42b883, 5%);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #a8d5c2;
    cursor: not-allowed;
  }
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

.login-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 2rem;
  }

  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style> 