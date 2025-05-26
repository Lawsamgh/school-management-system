<template>
  <Teleport to="#app">
    <Transition name="modal">
      <div v-if="show" class="modal-backdrop">
        <div 
          class="modal-container" 
          :class="themeClass"
          @click.stop 
          ref="modalContainer"
        >
          <div class="modal-content">
            <div class="modal-icon">
              <i class="fas fa-sign-out-alt"></i>
            </div>
            <h3 class="modal-title">Confirm Logout</h3>
            <p class="modal-text">Are you sure you want to log out? You'll need to sign in again to access your account.</p>
            <div class="modal-actions">
              <button 
                class="btn btn-outline-secondary" 
                @click="$emit('cancel')"
              >
                Cancel
              </button>
              <button 
                class="btn btn-primary" 
                @click="$emit('confirm')"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Logging out...' : 'Logout' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, computed } from 'vue'
import { useAuthStore } from '@/store/auth'

const props = defineProps<{
  show: boolean
  loading: boolean
}>()

const authStore = useAuthStore()
const modalContainer = ref<HTMLElement | null>(null)

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

// Computed property to get the current theme class
const themeClass = computed(() => {
  const schoolId = authStore.userRole?.school_id || authStore.getSelectedSchoolId
  return schoolId ? `school-${schoolId}` : ''
})

// Function to apply theme classes to the modal
const applyThemeClasses = () => {
  if (props.show && modalContainer.value) {
    const schoolId = authStore.userRole?.school_id || authStore.getSelectedSchoolId
    if (schoolId) {
      modalContainer.value.classList.add(`school-${schoolId}`)
      console.log(`Applied school theme: school-${schoolId} to logout modal`)
    }
  }
}

// Watch for changes to the show property
watch(() => props.show, (newVal) => {
  if (newVal) {
    // When modal is shown, apply theme
    setTimeout(applyThemeClasses, 10)
  }
})

onMounted(() => {
  if (props.show) {
    applyThemeClasses()
  }
})
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-container {
  background: var(--background, white);
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(0);
  transition: transform 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(var(--primary-rgb, 66, 184, 131), 0.1);
}

.modal-content {
  text-align: center;
}

.modal-icon {
  width: 64px;
  height: 64px;
  background: var(--primary, #42b883);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 0 15px rgba(var(--primary-rgb, 66, 184, 131), 0.3);
  
  i {
    font-size: 28px;
    color: white;
  }
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text, #2c3e50);
  margin-bottom: 1rem;
}

.modal-text {
  color: var(--text, #6b7280);
  opacity: 0.8;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;

  .btn {
    min-width: 120px;
    padding: 0.625rem 1.25rem;
    font-weight: 500;
    transition: all 0.3s ease;
    border-radius: 8px;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
    }
    
    &.btn-outline-secondary {
      border: 1px solid var(--border, #e2e8f0);
      color: var(--text, #6b7280);
      background-color: transparent;
      
      &:hover:not(:disabled) {
        background-color: rgba(var(--secondary-rgb, 53, 73, 94), 0.05);
        color: var(--text, #2c3e50);
        border-color: var(--secondary, #35495e);
      }
    }
    
    &.btn-primary {
      background-color: var(--primary, #42b883);
      border-color: var(--primary, #42b883);
      color: white;
      box-shadow: 0 4px 6px rgba(var(--primary-rgb, 66, 184, 131), 0.2);
      
      &:hover:not(:disabled) {
        background-color: var(--primary, #42b883);
        filter: brightness(90%);
        box-shadow: 0 6px 12px rgba(var(--primary-rgb, 66, 184, 131), 0.3);
      }
      
      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
      
      .spinner-border {
        border-color: white;
        border-right-color: transparent;
      }
    }
  }
}

// Modal Transition
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
  
  .modal-container {
    transition: transform 0.3s ease;
  }
}

.modal-enter-from {
  opacity: 0;
  
  .modal-container {
    transform: translateY(20px);
  }
}

.modal-leave-to {
  opacity: 0;
  
  .modal-container {
    transform: translateY(20px);
  }
}
</style> 