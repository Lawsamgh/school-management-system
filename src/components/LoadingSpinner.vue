<template>
  <div v-if="visible" class="loading-overlay">
    <div class="loading-content">
      <div class="spinner-container">
        <div class="spinner"></div>
      </div>
      <p class="loading-text">{{ message || 'Loading...' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  message?: string;
}>();
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: inherit;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  max-width: 90%;
  text-align: center;
}

.spinner-container {
  margin-bottom: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(66, 184, 131, 0.2);
  border-radius: 50%;
  border-top-color: #42b883;
  animation: loading-animation 1s linear infinite;
}

.loading-text {
  margin: 0;
  color: #42b883;
  font-weight: 500;
  font-size: 1rem;
}

@keyframes loading-animation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style> 