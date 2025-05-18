<template>
  <div class="modal fade" :id="modalId" tabindex="-1" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered" :class="modalSize">
      <div class="modal-content">
        <div class="modal-header border-0">
          <h5 class="modal-title d-flex align-items-center">
            <i :class="'fas ' + icon + ' text-primary me-2'"></i>
            {{ title }}
          </h5>
          <button 
            v-if="showCloseButton"
            type="button" 
            class="btn-close" 
            @click="handleCancel"
          ></button>
        </div>
        <div class="modal-body p-0">
          <div class="prompt-card">
            <!-- Message content -->
            <div class="message-content">
              <p v-if="message" class="mb-3">{{ message }}</p>
              <slot></slot>
            </div>
            
            <!-- Input field (if input type prompt) -->
            <div v-if="type === 'input'" class="input-section">
              <label v-if="inputLabel" class="form-label">{{ inputLabel }}</label>
              <input 
                v-model="inputValue"
                :type="inputType"
                class="form-control"
                :placeholder="inputPlaceholder"
                @keyup.enter="handleConfirm"
              />
              <small v-if="inputHelp" class="form-text text-muted">{{ inputHelp }}</small>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0">
          <button 
            v-if="showCancelButton"
            type="button" 
            class="btn btn-outline-secondary" 
            @click="handleCancel"
          >
            {{ cancelButtonText }}
          </button>
          <button 
            type="button" 
            class="btn btn-primary"
            @click="handleConfirm"
            :disabled="confirmDisabled"
          >
            <i v-if="confirmIcon" :class="'fas ' + confirmIcon + ' me-2'"></i>
            {{ confirmButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import * as bootstrap from 'bootstrap'

const props = defineProps({
  modalId: {
    type: String,
    default: 'promptModal'
  },
  title: {
    type: String,
    default: 'Prompt'
  },
  message: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'fa-question-circle'
  },
  type: {
    type: String,
    default: 'confirm', // 'confirm', 'input', 'alert'
    validator: (value: string) => ['confirm', 'input', 'alert'].includes(value)
  },
  confirmButtonText: {
    type: String,
    default: 'Confirm'
  },
  cancelButtonText: {
    type: String,
    default: 'Cancel'
  },
  confirmIcon: {
    type: String,
    default: ''
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  modalSize: {
    type: String,
    default: '' // '', 'modal-sm', 'modal-lg', 'modal-xl'
  },
  inputType: {
    type: String,
    default: 'text'
  },
  inputLabel: {
    type: String,
    default: ''
  },
  inputPlaceholder: {
    type: String,
    default: 'Enter your input'
  },
  inputHelp: {
    type: String,
    default: ''
  },
  defaultInputValue: {
    type: String,
    default: ''
  },
  inputRequired: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel', 'update:modelValue'])

let modalInstance: bootstrap.Modal | null = null
const inputValue = ref(props.defaultInputValue)

// Computed properties
const confirmDisabled = computed(() => {
  if (props.type === 'input' && props.inputRequired) {
    return !inputValue.value.trim()
  }
  return false
})

// Reset input when modal opens
watch(() => props.defaultInputValue, (newValue) => {
  inputValue.value = newValue
})

// Initialize modal
onMounted(() => {
  const modalEl = document.getElementById(props.modalId)
  if (modalEl) {
    modalInstance = new bootstrap.Modal(modalEl, {
      backdrop: 'static',
      keyboard: false
    })
  }
})

// Methods to show/hide modal
const show = () => {
  if (modalInstance) {
    modalInstance.show()
  }
}

const hide = () => {
  if (modalInstance) {
    modalInstance.hide()
  }
}

// Event handlers
const handleConfirm = () => {
  if (props.type === 'input') {
    emit('confirm', inputValue.value)
    emit('update:modelValue', inputValue.value)
  } else {
    emit('confirm')
  }
  hide()
}

const handleCancel = () => {
  emit('cancel')
  hide()
}

// Expose methods to parent components
defineExpose({
  show,
  hide
})
</script>

<style lang="scss" scoped>
// Modal Styling
.prompt-card {
  padding: 1.5rem;
  
  .message-content {
    margin-bottom: 1.5rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #1f2937;
    
    p:last-child {
      margin-bottom: 0;
    }
  }
  
  .input-section {
    margin-top: 1rem;
    
    .form-label {
      font-weight: 500;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
    
    .form-control {
      border-radius: 8px;
      padding: 0.75rem 1rem;
      border: 1px solid #e5e7eb;
      transition: all 0.2s ease;
      
      &:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }
    }
    
    .form-text {
      margin-top: 0.5rem;
      font-size: 0.8rem;
    }
  }
}

// Button styling consistent with your design system
.btn {
  font-weight: 500;
  border-radius: 8px;
  padding: 0.5rem 1.25rem;
  transition: all 0.2s ease;

  &.btn-primary {
    background-color: #10b981;
    border-color: #10b981;
    
    &:hover, &:focus {
      background-color: #059669;
      border-color: #059669;
    }
    
    &:disabled {
      background-color: #10b981;
      border-color: #10b981;
      opacity: 0.6;
    }
  }
  
  &.btn-outline-secondary {
    border-color: #e5e7eb;
    color: #6b7280;
    
    &:hover, &:focus {
      background-color: #f9fafb;
      color: #374151;
    }
  }
}

// Modal animation
.modal-content {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 12px;
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 