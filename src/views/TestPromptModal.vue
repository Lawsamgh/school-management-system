<template>
  <div class="test-container">
    <h1>Test PromptModal Component</h1>
    <button class="btn btn-primary" @click="showModal">Show Modal</button>
    
    <PromptModal
      ref="promptModalRef"
      modalId="testPromptModal"
      title="Test Modal"
      message="This is a test modal to verify the PromptModal component works."
      icon="fa-question-circle"
      confirmButtonText="Confirm"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PromptModal from '@/components/PromptModal.vue'

const promptModalRef = ref<InstanceType<typeof PromptModal> | null>(null)

const showModal = () => {
  promptModalRef.value?.show()
}

const handleConfirm = () => {
  alert('Modal confirmed!')
}
</script>

<style scoped>
.test-container {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
</style> 