<template>
  <div class="contact">
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="text-center mb-4" v-motion-fade-visible>
            <h1 class="display-4 fw-bold text-primary mb-2">Get in Touch</h1>
            <p class="lead text-muted">We're here to help and answer any questions you might have</p>
          </div>
          
          <div class="row g-4">
            <!-- Contact Information -->
            <div class="col-md-5" v-motion-slide-visible-once-left>
              <div class="contact-info p-4 rounded-4">
                <h3 class="h4 mb-4 text-white">Contact Information</h3>
                <div class="d-flex flex-column gap-4">
                  <div class="contact-item">
                    <div class="icon-wrapper">
                      <i class="bi bi-geo-alt"></i>
                    </div>
                    <div class="contact-details">
                      <h4 class="h6">Location</h4>
                      <p class="mb-0">OB/05 Weija Junction, Accra, Ghana</p>
                    </div>
                  </div>
                  <div class="contact-item">
                    <div class="icon-wrapper">
                      <i class="bi bi-telephone"></i>
                    </div>
                    <div class="contact-details">
                      <h4 class="h6">Phone</h4>
                      <p class="mb-0">
                        <a href="tel:+233594042786" class="text-decoration-none">+233 59 404 2786</a>
                      </p>
                    </div>
                  </div>
                  <div class="contact-item">
                    <div class="icon-wrapper">
                      <i class="bi bi-envelope"></i>
                    </div>
                    <div class="contact-details">
                      <h4 class="h6">Email</h4>
                      <p class="mb-0">
                        <a href="mailto:ampenelawrence@gmail.com" class="text-decoration-none">ampenelawrence@gmail.com</a>
                      </p>
                    </div>
                  </div>
                </div>

                <div class="social-links mt-5">
                  <h4 class="h6 mb-3">Follow Us</h4>
                  <div class="d-flex gap-3">
                    <a href="#" class="social-link">
                      <i class="bi bi-facebook"></i>
                    </a>
                    <a href="#" class="social-link">
                      <i class="bi bi-twitter"></i>
                    </a>
                    <a href="#" class="social-link">
                      <i class="bi bi-linkedin"></i>
                    </a>
                    <a href="#" class="social-link">
                      <i class="bi bi-instagram"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Contact Form -->
            <div class="col-md-7" v-motion-slide-visible-once-right>
              <form @submit.prevent="handleSubmit" class="contact-form p-4 rounded-4">
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input
                        type="text"
                        class="form-control"
                        id="name"
                        v-model="formData.name"
                        placeholder="Your Name"
                        required
                      >
                      <label for="name">Full Name</label>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input
                        type="email"
                        class="form-control"
                        id="email"
                        v-model="formData.email"
                        placeholder="your@email.com"
                        required
                      >
                      <label for="email">Email Address</label>
                    </div>
                  </div>

                  <div class="col-md-6">
                    <div class="form-floating">
                      <input
                        type="tel"
                        class="form-control"
                        id="phone"
                        v-model="formData.phone"
                        placeholder="Phone Number"
                      >
                      <label for="phone">Phone Number</label>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <div class="form-floating">
                      <select class="form-select" id="subject" v-model="formData.subject" required>
                        <option value="">Select a subject</option>
                        <option value="enrollment">School Enrollment</option>
                        <option value="program">Product Information</option>
                        <option value="general">General Question</option>
                      </select>
                      <label for="subject">Subject</label>
                    </div>
                  </div>
                  
                  <div class="col-12">
                    <div class="form-floating">
                      <textarea
                        class="form-control"
                        id="message"
                        rows="5"
                        v-model="formData.message"
                        required
                        placeholder="Your Message"
                        style="height: 150px"
                      ></textarea>
                      <label for="message">Message</label>
                    </div>
                  </div>
                  
                  <div class="col-12">
                    <button type="submit" class="btn btn-primary w-100 py-3 position-relative" :disabled="isSubmitting">
                      <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                      {{ isSubmitting ? 'Sending...' : 'Send Message' }}
                      <i class="bi bi-send ms-2"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMotion } from '@vueuse/motion'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase'

interface FormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

const formData = ref<FormData>({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const isSubmitting = ref(false)
const formError = ref<string | null>(null)

const handleSubmit = async () => {
  formError.value = null
  isSubmitting.value = true
  
  try {
    // Create messages table entry
    const { error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name: formData.value.name,
          email: formData.value.email,
          phone: formData.value.phone,
          subject: formData.value.subject,
          message: formData.value.message,
          status: 'new',
          user_id: isAuthenticated.value ? authStore.user?.id : null
        }
      ])

    if (error) throw error
    
    // Reset form
    formData.value = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    }
    
    // Show success message
    alert('Thank you for your message! We will get back to you soon.')
  } catch (error) {
    console.error('Error submitting form:', error)
    formError.value = 'There was an error sending your message. Please try again.'
    alert(formError.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.contact {
  background-color: #f8f9fa;
  padding: 4rem 0 2rem;
}

.contact-info {
  height: 100%;
  background: linear-gradient(135deg, #42b883 0%, #347474 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(66, 184, 131, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .contact-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;

    .icon-wrapper {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      i {
        font-size: 1.2rem;
      }
    }

    .contact-details {
      h4 {
        margin-bottom: 0.25rem;
        opacity: 0.9;
      }

      p, a {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.95rem;
      }

      a:hover {
        color: white;
      }
    }
  }
}

.social-links {
  .social-link {
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-decoration: none;
    transition: all 0.3s ease;
    
    &:hover {
      background: white;
      color: #42b883;
      transform: translateY(-3px);
    }
    
    i {
      font-size: 1.1rem;
    }
  }
}

.contact-form {
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  .form-floating {
    > label {
      color: #6c757d;
    }

    > .form-control,
    > .form-select {
      border-color: #e9ecef;
      
      &:focus {
        border-color: #42b883;
        box-shadow: 0 0 0 0.25rem rgba(66, 184, 131, 0.25);
      }
    }
  }

  .btn-primary {
    background-color: #42b883;
    border-color: #42b883;
    font-weight: 500;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    
    &:hover:not(:disabled) {
      background-color: #3aa876;
      border-color: #3aa876;
      transform: translateY(-2px);
    }
    
    &:disabled {
      background-color: #42b883;
      border-color: #42b883;
      opacity: 0.65;
    }

    i {
      transition: transform 0.3s ease;
    }

    &:hover i {
      transform: translateX(3px);
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .contact {
    padding: 3rem 0 1.5rem;
  }

  .contact-info {
    margin-bottom: 2rem;
  }
}
</style> 