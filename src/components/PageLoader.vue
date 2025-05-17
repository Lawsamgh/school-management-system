<template>
  <transition name="fade">
    <div v-if="visible" class="page-loader">
      <div class="loader-content">
        <div class="loader-logo">
          <div class="spinner-ring"></div>
          <div class="spinner-core">
            <i class="fas fa-cog"></i>
          </div>
        </div>
        <h3 class="loader-title">{{ title }}</h3>
        <p class="loader-message">{{ message }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  title?: string;
  message?: string;
}>();
</script>

<style scoped>
.page-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.loader-content {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
}

.loader-logo {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid rgba(66, 184, 131, 0.2);
  border-top-color: #42b883;
  border-radius: 50%;
  animation: spin 1.5s ease-in-out infinite;
}

.spinner-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: #42b883;
  animation: pulse 2s ease-in-out infinite;
}

.loader-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.loader-message {
  font-size: 1rem;
  color: #6c757d;
  margin: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(0.95);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.05);
  }
}

/* Transition animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style> 