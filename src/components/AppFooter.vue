<template>
  <footer class="modern-footer">
    <div class="container">
      <div class="footer-content">
        <!-- Company Info Section -->
        <div class="footer-main-content">
          <div class="brand-section">
            <h4 class="brand-name">LS System</h4>
            <p class="brand-description">
              Welcome to our innovative school community! Our platform simplifies onboarding, boosts communication, and fosters collaboration. Let's empower the next generation together!
            </p>
          </div>
          
          <div class="contact-section">
            <h4 class="section-title">Contact Info</h4>
            <div class="contact-list">
              <div class="contact-item">
                <i class="bi bi-geo-alt"></i>
                <span>OB/05 Weija Junction, Accra, Ghana</span>
              </div>
              <div class="contact-item">
                <i class="bi bi-telephone"></i>
                <span>+233 59 404 2786</span>
              </div>
              <div class="contact-item">
                <i class="bi bi-envelope"></i>
                <span>ampenelawrence@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <p class="copyright">
            &copy; {{ new Date().getFullYear() }} LS System. All rights reserved.
          </p>
          <p class="credits">
            Developed by <span class="highlight">Lawsam GH</span>
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Static school name, no need to fetch from database
</script>

<style scoped lang="scss">
.modern-footer {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 5rem 0 2rem;
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(0, 0, 0, 0.05);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(66, 184, 131, 0.2), transparent);
  }
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.footer-main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 4rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.brand-section {
  .brand-name {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -0.5rem;
      left: 0;
      width: 2.5rem;
      height: 2px;
      background: #42b883;
      border-radius: 2px;
    }
  }

  .brand-description {
    color: #6c757d;
    line-height: 1.8;
    margin-bottom: 2rem;
    font-size: 1rem;
  }
}

.contact-section {
  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -0.5rem;
      left: 0;
      width: 2.5rem;
      height: 2px;
      background: #42b883;
      border-radius: 2px;
    }
  }
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  color: #6c757d;
  
  i {
    color: #42b883;
    font-size: 1.1rem;
    margin-top: 0.2rem;
  }
  
  span {
    line-height: 1.6;
  }
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

.copyright {
  color: #6c757d;
  font-size: 0.95rem;
  margin: 0;
}

.credits {
  color: #6c757d;
  font-size: 0.95rem;
  margin: 0;
  
  .highlight {
    color: #42b883;
    font-weight: 500;
    transition: color 0.3s ease;
    
    &:hover {
      color: darken(#42b883, 10%);
    }
  }
}

@media (max-width: 768px) {
  .modern-footer {
    padding: 3rem 0 1.5rem;
  }
  
  .brand-section {
    text-align: center;
    
    .brand-name::after {
      left: 50%;
      transform: translateX(-50%);
    }
  }
  
  .contact-section {
    text-align: center;
    
    .section-title::after {
      left: 50%;
      transform: translateX(-50%);
    }
  }
  
  .contact-item {
    justify-content: center;
  }
}
</style> 