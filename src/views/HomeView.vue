<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero-section position-relative">
      <div class="hero-background"></div>
      <div class="container py-5 position-relative">
        <div class="row align-items-center min-vh-75">
          <div class="col-lg-12" v-motion-slide-visible-once-left>
            <div class="text-content">
              <h1 class="display-4 text-white mb-4">Welcome to LS System</h1>
              <p class="lead mb-4 text-white">We are thrilled to have you join our community of forward-thinking schools. Our platform is designed to streamline your onboarding process, enhance communication, and foster a collaborative learning environment. Together, let's empower the next generation of learners!</p>
              <router-link to="/contact" class="btn btn-primary btn-lg">
               Contact Us
                <i class="bi bi-arrow-right ms-2"></i>
              </router-link>
            </div>
          </div>
          
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section py-5 bg-light">
      <div class="container">
        <h2 class="text-center mb-5 section-title">Why Choose Us?</h2>
        <div class="row g-4">
          <div class="col-md-4" v-motion-pop-visible-once>
            <div class="feature-card card h-100 border-0">
              <div class="card-body text-center p-4">
                <div class="icon-wrapper mb-4">
                  <i class="bi bi-ui-checks-grid"></i>
                </div>
                <h3 class="h4 mb-3 card-title">User-Friendly Interface</h3>
                <p class="card-text text-muted">Our intuitive design makes it easy for educators and administrators to navigate the platform, ensuring a seamless onboarding experience.</p>
              </div>
            </div>
          </div>
          <div class="col-md-4" v-motion-pop-visible-once>
            <div class="feature-card card h-100 border-0">
              <div class="card-body text-center p-4">
                <div class="icon-wrapper mb-4">
                  <i class="bi bi-headset"></i>
                </div>
                <h3 class="h4 mb-3 card-title">Comprehensive Support</h3>
                <p class="card-text text-muted">We provide dedicated support and resources, including training sessions and tutorials, to help your school maximize the benefits of our system.</p>
              </div>
            </div>
          </div>
          <div class="col-md-4" v-motion-pop-visible-once>
            <div class="feature-card card h-100 border-0">
              <div class="card-body text-center p-4">
                <div class="icon-wrapper mb-4">
                  <i class="bi bi-sliders"></i>
                </div>
                <h3 class="h4 mb-3 card-title">Customizable Solutions</h3>
                <p class="card-text text-muted">Tailor our features to meet the unique needs of your school, allowing you to create a personalized environment that enhances learning and engagement.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useMotion } from '@vueuse/motion'

// No need to fetch school info, using static name
</script>

<style scoped lang="scss">
.hero-section {
  position: relative;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.5);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/images/Bbackground.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  z-index: -1;
}

.text-content {
  padding: 2rem;
  border-radius: 1rem;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.min-vh-75 {
  min-height: 75vh;
}

.section-title {
  font-weight: 700;
  color: #2c3e50;
  position: relative;
  display: inline-block;
  padding-bottom: 10px;
  
  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    height: 3px;
    width: 50px;
    background-color: #42b883;
    border-radius: 2px;
  }
}

.feature-card {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 20px;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.05),
              -5px -5px 15px rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(var(--primary-rgb), 0.03));
    opacity: 0;
    transition: all 0.3s ease;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 8px 8px 20px rgba(0, 0, 0, 0.08),
                -8px -8px 20px rgba(255, 255, 255, 0.8);
    
    &::before {
      opacity: 1;
    }

    .icon-wrapper {
      transform: scale(1.1);
      background-color: var(--primary);
      
      i {
        color: white;
      }
    }
  }

  .card-title {
    color: var(--text);
    font-weight: 600;
  }

  .icon-wrapper {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: rgba(var(--primary-rgb), 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    transition: all 0.3s ease;
    
    i {
      font-size: 2.5rem;
      color: var(--primary);
      transition: all 0.3s ease;
    }
  }
}

.btn-primary {
  background-color: var(--primary);
  border-color: var(--primary);
  box-shadow: 0 4px 6px rgba(var(--primary-rgb), 0.2);

  &:hover {
    background-color: var(--primary);
    border-color: var(--primary);
    filter: brightness(90%);
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(var(--primary-rgb), 0.3);
  }
}
</style> 