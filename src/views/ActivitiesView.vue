<template>
  <div class="programs">
    <div class="container py-5">
      <div class="text-center title-wrapper">
        <h1 class="page-title">Extracurricular Activities</h1>
      </div>
      
      <!-- School context indicator for superadmin -->
      <div v-if="userRole === 'superadmin'" class="text-center mb-4">
        <span class="school-context-badge">
          <i class="bi bi-building me-2"></i>
          {{ currentSchoolId ? 'Activities for selected school' : 'All activities (No school selected)' }}
        </span>
      </div>
      
      <!-- Loading State with Skeleton -->
      <div v-if="isLoading" class="row g-4">
        <div class="col-md-6 col-lg-4" v-for="n in 3" :key="n">
          <div class="card h-100 border-0 shadow-sm program-card skeleton-card">
            <div class="skeleton-image"></div>
            <div class="card-body">
              <div class="skeleton-title"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-button"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger text-center" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ error }}
      </div>

      <!-- Empty State -->
      <div v-else-if="programs.length === 0" class="text-center py-5">
        <i class="bi bi-inbox display-1 text-muted"></i>
        <p class="mt-3 text-muted">No Activities available at the moment.</p>
      </div>

      <!-- Programs Grid -->
      <div v-else class="row g-4">
        <div class="col-md-6 col-lg-4" v-for="program in programs" :key="program.id" v-motion-pop-visible-once>
          <div class="card h-100 border-0 shadow-sm program-card">
            <img :src="program.program_image" :alt="program.program_name" class="card-img-top">
            <div class="card-body">
              <h3 class="h4 card-title">{{ program.program_name }}</h3>
              <p class="card-text">{{ program.program_description }}</p>
              <button class="btn btn-outline-primary w-100" @click="showDetails(program)">
                More Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Program Details Modal -->
    <div class="modal fade" id="programModal" tabindex="-1" ref="modal" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0">
          <div class="modal-header border-0 program-header" v-if="selectedProgram">
            <img :src="selectedProgram.program_image" :alt="selectedProgram.program_name" class="program-header-img">
            <div class="header-overlay">
              <h3 class="modal-title">{{ selectedProgram.program_name }}</h3>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
          </div>
          <div class="modal-body p-4" v-if="selectedProgram">
            <div class="program-overview mb-4">
              <h4 class="section-title">Activity Overview</h4>
              <p class="lead">{{ selectedProgram.program_description }}</p>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
            <!-- <button type="button" class="btn btn-primary" @click="enrollNow">
              <i class="bi bi-person-plus me-2"></i>Enroll Now
            </button> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useMotion } from '@vueuse/motion'
import { Modal } from 'bootstrap'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/store/auth'
import earlyLearningImg from '@/assets/images/early-learning.jpg'
import preschoolImg from '@/assets/images/preschool.jpg'
import kindergartenImg from '@/assets/images/kindergarten.jpg'
import afterSchoolImg from '@/assets/images/after-school.jpg'

interface Program {
  id: number
  program_name: string
  program_description: string
  program_image: string
  school_id?: string
}

const modal = ref<HTMLElement | null>(null)
const selectedProgram = ref<Program | null>(null)
let bootstrapModal: Modal | null = null
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const programs = ref<Program[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Computed property to get the current user's role
const userRole = computed(() => authStore.userRole?.role?.toLowerCase() || '')

// Computed property to get the appropriate school_id based on role
const currentSchoolId = computed(() => {
  if (userRole.value === 'superadmin') {
    return authStore.getSelectedSchoolId
  } else {
    return authStore.userRole?.school_id
  }
})

const fetchPrograms = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    console.log('Starting to fetch programs...')
    console.log('Current school ID:', currentSchoolId.value)
    
    // Base query
    let query = supabase
      .from('programs')
      .select('*')
    
    // Add school_id filter if available (for non-superadmin or when superadmin has selected a school)
    if (currentSchoolId.value) {
      query = query.eq('school_id', currentSchoolId.value)
    }
    
    // Add order
    query = query.order('created_at', { ascending: false })
    
    // Execute query
    const { data, error: supabaseError } = await query

    console.log('Supabase response:', { data, error: supabaseError })

    if (supabaseError) throw supabaseError

    programs.value = data || []
    console.log('Programs loaded:', programs.value)
  } catch (err: any) {
    console.error('Error fetching programs:', err)
    error.value = 'Failed to load programs'
    toast.error(err.message || 'Failed to load programs')
  } finally {
    isLoading.value = false
  }
}

// Add watcher for selected school changes for superadmin
watch(
  () => authStore.getSelectedSchoolId,
  async (newSchoolId) => {
    if (userRole.value === 'superadmin' && newSchoolId) {
      console.log('Selected school changed, refetching activities...')
      await fetchPrograms()
    }
  }
)

onMounted(async () => {
  modal.value = document.getElementById('programModal')
  if (modal.value) {
    bootstrapModal = new Modal(modal.value)
  }
  await fetchPrograms()
})

const showDetails = (program: Program) => {
  selectedProgram.value = program
  if (bootstrapModal) {
    bootstrapModal.show()
  }
}

const enrollNow = () => {
  if (bootstrapModal) {
    bootstrapModal.hide()
  }
  router.push('/login')
}
</script>

<style scoped lang="scss">
.program-card {
  transition: all 0.3s ease;
  background: white;
  overflow: hidden;
  height: 450px;
  display: flex;
  flex-direction: column;
  border-radius: 0.75rem;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
    
    img {
      transform: scale(1.05);
    }
  }
  
  img {
    height: 240px;
    width: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    flex-shrink: 0;
  }

  .card-body {
    padding: 1.25rem;
    flex: 1;
    display: flex;
    flex-direction: column;

  .card-title {
    color: #2c3e50;
      margin-bottom: 0.75rem;
    font-weight: 600;
      font-size: 1.2rem;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      position: relative;
      padding-bottom: 0.75rem;
      width: fit-content;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 3px;
        background: linear-gradient(to right, #42b883, #64b792);
        transition: all 0.3s ease;
        border-radius: 3px;
      }
    }

    &:hover .card-title::after {
      width: 100%;
  }

  .card-text {
    color: #666;
      font-size: 0.95rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 1.25rem;
      flex-grow: 1;
  }

  .btn-outline-primary {
      padding: 0.75rem 1.25rem;
    font-weight: 500;
    transition: all 0.3s ease;
      margin-top: auto;
    
    &:hover {
      transform: translateY(-2px);
      }
    }
  }
}

.modal-content {
  border-radius: 1rem;
  overflow: hidden;
}

.program-header {
  padding: 0;
  position: relative;
  height: 200px;
  overflow: hidden;

  .program-header-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .header-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    display: flex;
    justify-content: space-between;
    align-items: center;

    .modal-title {
      color: white;
      margin: 0;
      font-size: 1.75rem;
      font-weight: 600;
    }
  }
}

.section-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 1.25rem;
  position: relative;
  padding-bottom: 0.5rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background-color: #42b883;
  }
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 0.5rem;
    transition: transform 0.2s ease;
    
    &:hover {
      transform: translateX(5px);
    }
    
    i {
      color: #42b883;
      margin-right: 1rem;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    span {
      color: #2c3e50;
    }
  }
}

.info-card {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-3px);
  }

  .info-icon {
    background: #42b883;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    flex-shrink: 0;

    i {
      font-size: 1.2rem;
    }
  }

  .info-content {
    flex-grow: 1;

    strong {
      display: block;
      color: #2c3e50;
      margin-bottom: 0.25rem;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }
  }
}

.modal-footer {
  padding: 1.5rem;
  background: #f8f9fa;

  .btn {
    padding: 0.5rem 1.5rem;
    font-weight: 500;
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .program-header {
    height: 150px;

    .header-overlay {
      padding: 1rem;

      .modal-title {
        font-size: 1.25rem;
      }
    }
  }

  .modal-body {
    padding: 1rem !important;
  }

  .info-card {
    padding: 0.75rem;

    .info-icon {
      width: 32px;
      height: 32px;

      i {
        font-size: 1rem;
      }
    }
  }
}

// Skeleton Loading Animation
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-card {
  background: white;
  overflow: hidden;

  .skeleton-image {
    height: 200px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite linear;
  }

  .skeleton-title {
    height: 24px;
    width: 80%;
    margin-bottom: 1rem;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite linear;
    border-radius: 4px;
  }

  .skeleton-text {
    height: 16px;
    width: 100%;
    margin-bottom: 0.75rem;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite linear;
    border-radius: 4px;

    &:last-of-type {
      width: 60%;
    }
  }

  .skeleton-button {
    height: 40px;
    width: 100%;
    margin-top: 1rem;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite linear;
    border-radius: 4px;
  }
}

.school-context-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1.25rem;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 2rem;
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
  
  i {
    color: #42b883;
  }
}

// Add this style for the page title with professional underline

.page-title {
  position: relative;
  display: inline-block;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 3rem;
  padding: 0 1.5rem 0.5rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.05);
  
  &::before, &::after {
    content: '';
    position: absolute;
    bottom: 0;
    width: 40%;
    height: 4px;
    background-color: #42b883;
    border-radius: 2px;
  }
  
  &::before {
    left: 0;
    background: linear-gradient(to right, #42b883, rgba(66, 184, 131, 0.3));
  }
  
  &::after {
    right: 0;
    background: linear-gradient(to left, #42b883, rgba(66, 184, 131, 0.3));
  }
}

// Add this style for the title wrapper

.title-wrapper {
  margin-bottom: 3.5rem;
  position: relative;
  
  &::after {
    content: "✦";
    position: absolute;
    left: 50%;
    bottom: -28px;
    font-size: 14px;
    color: #42b883;
    transform: translateX(-50%);
  }
}
</style> 