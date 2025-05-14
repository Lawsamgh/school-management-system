<template>
  <Transition name="modal">
    <div v-if="show" class="modal-backdrop">
      <div class="modal-container" @click.stop>
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
              class="btn btn-danger" 
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
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  loading: boolean
}>()

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
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
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(0);
  transition: transform 0.3s ease-out;
}

.modal-content {
  text-align: center;
}

.modal-icon {
  width: 64px;
  height: 64px;
  background: #dc3545;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  
  i {
    font-size: 28px;
    color: white;
  }
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.modal-text {
  color: #6b7280;
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
    
    &.btn-danger {
      background-color: #dc3545;
      border-color: #dc3545;
      
      &:hover:not(:disabled) {
        background-color: darken(#dc3545, 5%);
        border-color: darken(#dc3545, 5%);
      }
      
      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
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