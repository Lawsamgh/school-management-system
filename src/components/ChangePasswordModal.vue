<template>
  <div v-if="modelValue" class="modal-backdrop">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Change Password</h3>
        <button class="close-button" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <div class="password-input">
              <input 
                :type="showCurrentPassword ? 'text' : 'password'"
                id="currentPassword"
                v-model="form.currentPassword"
                class="form-control"
                :class="{ 'is-invalid': errors.currentPassword }"
                placeholder="Enter current password"
              >
              <button 
                type="button" 
                class="toggle-password"
                @click="showCurrentPassword = !showCurrentPassword"
              >
                <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback" v-if="errors.currentPassword">
              {{ errors.currentPassword }}
            </div>
          </div>

          <div class="form-group">
            <label for="newPassword">New Password</label>
            <div class="password-input">
              <input 
                :type="showNewPassword ? 'text' : 'password'"
                id="newPassword"
                v-model="form.newPassword"
                class="form-control"
                :class="{ 'is-invalid': errors.newPassword }"
                placeholder="Enter new password"
              >
              <button 
                type="button" 
                class="toggle-password"
                @click="showNewPassword = !showNewPassword"
              >
                <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback" v-if="errors.newPassword">
              {{ errors.newPassword }}
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <div class="password-input">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                v-model="form.confirmPassword"
                class="form-control"
                :class="{ 'is-invalid': errors.confirmPassword }"
                placeholder="Confirm new password"
              >
              <button 
                type="button" 
                class="toggle-password"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="invalid-feedback" v-if="errors.confirmPassword">
              {{ errors.confirmPassword }}
            </div>
          </div>

          <div class="password-requirements">
            <p>Password must contain:</p>
            <ul>
              <li :class="{ valid: hasMinLength }">At least 8 characters</li>
              <li :class="{ valid: hasUpperCase }">One uppercase letter</li>
              <li :class="{ valid: hasLowerCase }">One lowercase letter</li>
              <li :class="{ valid: hasNumber }">One number</li>
              <li :class="{ valid: hasSpecialChar }">One special character</li>
            </ul>
          </div>

          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="closeModal"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Changing Password...' : 'Change Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { supabase } from '@/lib/supabase'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/store/auth'

const props = defineProps<{
  modelValue: boolean
}>()

// Debug watcher
watch(() => props.modelValue, (newVal) => {
  console.log('ChangePasswordModal modelValue:', newVal)
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const toast = useToast()
const authStore = useAuthStore()

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)

// Password validation
const hasMinLength = computed(() => form.value.newPassword.length >= 8)
const hasUpperCase = computed(() => /[A-Z]/.test(form.value.newPassword))
const hasLowerCase = computed(() => /[a-z]/.test(form.value.newPassword))
const hasNumber = computed(() => /[0-9]/.test(form.value.newPassword))
const hasSpecialChar = computed(() => /[!@#$%^&*(),.?":{}|<>]/.test(form.value.newPassword))

const validateForm = () => {
  let isValid = true
  errors.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }

  if (!form.value.currentPassword) {
    errors.value.currentPassword = 'Current password is required'
    toast.error('Current password is required')
    isValid = false
  }

  if (!form.value.newPassword) {
    errors.value.newPassword = 'New password is required'
    toast.error('New password is required')
    isValid = false
  } else if (!hasMinLength.value || !hasUpperCase.value || !hasLowerCase.value || 
             !hasNumber.value || !hasSpecialChar.value) {
    errors.value.newPassword = 'Password does not meet requirements'
    toast.error('New password does not meet the requirements')
    isValid = false
  }

  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm your new password'
    toast.error('Please confirm your new password')
    isValid = false
  } else if (form.value.newPassword !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
    toast.error('New passwords do not match')
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    // Get current user's email
    const userEmail = authStore.user?.email
    if (!userEmail) {
      toast.error('User session not found. Please log in again.')
      throw new Error('User email not found')
    }

    // First verify the current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: form.value.currentPassword
    })

    if (signInError) {
      errors.value.currentPassword = 'Current password is incorrect'
      toast.error('Current password is incorrect')
      isSubmitting.value = false
      return
    }

    // If current password is correct, update to new password
    const { error: updateError } = await supabase.auth.updateUser({ 
      password: form.value.newPassword 
    })

    if (updateError) {
      toast.error(updateError.message || 'Failed to update password')
      throw updateError
    }

    // Log current user info for debugging
    console.log('Current user:', authStore.user)
    console.log('User role:', authStore.userRole)

    // First verify the user exists and get their exact email case
    const { data: userRole, error: fetchError } = await supabase
      .from('user_roles')
      .select('id, email, role, password_status')
      .ilike('email', userEmail)
      .single()

    if (fetchError) {
      console.error('Error fetching user role:', fetchError)
      toast.warning('Password changed but status update failed: Could not verify user role')
    } else {
      console.log('Found user role:', userRole)

      // Update using the exact email from the database
      const { data: updateResult, error: updateRoleError } = await supabase
        .from('user_roles')
        .update({ password_status: 'changed' })
        .eq('id', userRole.id) // Use primary key instead of email
        .select('id, email, role, password_status')

      if (updateRoleError) {
        console.error('Error updating password status:', updateRoleError)
        toast.warning('Password changed but status update failed. Please try again later.')
      } else {
        console.log('Update result:', updateResult)
        if (!updateResult || updateResult.length === 0) {
          console.warn('No user role updated for ID:', userRole.id)
          toast.warning('Password changed but status update failed: Could not update status')
        } else {
          console.log('Successfully updated password status for user:', updateResult[0])
        }
      }
    }

    // Store password change status
    localStorage.setItem('passwordChanged', 'true')
    
    toast.success('Password changed successfully')
    closeModal()
  } catch (error: any) {
    console.error('Error in handleSubmit:', error)
    toast.error(error.message || 'Failed to change password')
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  form.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  errors.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 15px;
  width: 95%;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 10000;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    color: #2c3e50;
    font-weight: 600;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #666;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.3s ease;

    &:hover {
      background: #f8f9fa;
      color: #2c3e50;
    }
  }
}

.modal-body {
  padding: 2rem;

  .form-group {
    margin-bottom: 1.8rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #2c3e50;
      font-weight: 500;
    }
  }

  .password-input {
    position: relative;

    .toggle-password {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 0.5rem;

      &:hover {
        color: #2c3e50;
      }
    }
  }
}

.password-requirements {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;

  p {
    margin: 0 0 0.5rem;
    color: #2c3e50;
    font-weight: 500;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      color: #666;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      
      &::before {
        content: '•';
        color: #dc3545;
        margin-right: 0.5rem;
      }

      &.valid {
        color: #42b883;
        
        &::before {
          content: '✓';
          color: #42b883;
        }
      }
    }
  }
}

.modal-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;

    &-secondary {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      color: #2c3e50;

      &:hover {
        background: #e9ecef;
      }
    }

    &-primary {
      background: #42b883;
      border: none;
      color: white;

      &:hover {
        background: #3aa876;
      }

      &:disabled {
        background: #a8d5c2;
        cursor: not-allowed;
      }
    }
  }
}

.invalid-feedback {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-control {
  width: 100%;
  padding: 0.875rem 2.5rem 0.875rem 1rem;
  font-size: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #42b883;
    box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
  }

  &.is-invalid {
    border-color: #dc3545;

    &:focus {
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }
  }
}
</style> 