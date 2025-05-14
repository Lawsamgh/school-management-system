<template>
  <div class="school-selector mb-4">
    <div class="form-group">
      <label class="form-label">Select School</label>
      <div class="custom-select-container">
        <input 
          type="text" 
          class="form-control" 
          v-model="searchQuery"
          @focus="handleFocus"
          @input="handleSearch"
          :placeholder="selectedSchoolName || 'Search for a school...'"
          :disabled="loading"
        >
        <div v-if="showDropdown" class="custom-select-dropdown">
          <div class="custom-select-options">
            <div 
              v-for="school in filteredSchools" 
              :key="school.id"
              class="custom-select-option"
              @click="selectSchool(school)"
              :class="{ 'selected': school.id === selectedSchool }"
            >
              {{ school.name }}
            </div>
            <div v-if="filteredSchools.length === 0" class="no-results">
              No schools found
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { useToast } from 'vue-toastification'

const emit = defineEmits(['school-selected'])
const toast = useToast()
const authStore = useAuthStore()
const loading = ref(false)
const schools = ref<{ id: string; name: string }[]>([])
const selectedSchool = ref(authStore.getSelectedSchoolId || '')
const searchQuery = ref('')
const showDropdown = ref(false)

const selectedSchoolName = computed(() => {
  const school = schools.value.find(s => s.id === selectedSchool.value)
  return school?.name || ''
})

const filteredSchools = computed(() => {
  if (!searchQuery.value) return schools.value
  const query = searchQuery.value.toLowerCase()
  return schools.value.filter(school => 
    school.name.toLowerCase().includes(query)
  )
})

const fetchSchools = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('id, name')
      .order('name')

    if (error) throw error
    schools.value = data || []
  } catch (error: any) {
    console.error('Error fetching schools:', error)
    toast.error('Failed to load schools')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  showDropdown.value = true
}

const handleFocus = () => {
  searchQuery.value = ''
  showDropdown.value = true
}

const selectSchool = async (school: { id: string; name: string }) => {
  selectedSchool.value = school.id
  searchQuery.value = school.name
  showDropdown.value = false
  
  try {
    await authStore.setSelectedSchoolId(school.id)
    emit('school-selected', school.id)
  } catch (error) {
    console.error('Error setting selected school:', error)
    toast.error('Failed to select school')
  }
}

// Add event listener for school refresh
onMounted(() => {
  fetchSchools()
  // Listen for refresh event
  window.addEventListener('refresh-schools', fetchSchools)
  
  // Add click outside listener to close dropdown
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const container = document.querySelector('.custom-select-container')
    if (container && !container.contains(target)) {
      showDropdown.value = false
    }
  })
})

// Clean up event listeners
onUnmounted(() => {
  window.removeEventListener('refresh-schools', fetchSchools)
  document.removeEventListener('click', () => {})
})

// Watch for external changes to selected school
watch(() => authStore.getSelectedSchoolId, (newId) => {
  selectedSchool.value = newId || ''
  if (!newId) {
    searchQuery.value = ''
  } else {
    const school = schools.value.find(s => s.id === newId)
    if (school) {
      searchQuery.value = school.name
    }
  }
})
</script>

<style scoped lang="scss">
.school-selector {
  .form-label {
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .custom-select-container {
    position: relative;

    .form-control {
      height: 3.5rem;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 0.5rem;
      background-color: #fff;
      transition: all 0.2s ease;
      font-size: 0.95rem;
      width: 100%;

      &:disabled {
        background-color: #f8fafc;
        cursor: not-allowed;
        opacity: 0.8;
      }

      &::placeholder {
        color: #94a3b8;
      }

      &:focus {
        border-color: #42b883;
        box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
      }
    }
  }

  .custom-select-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    margin-top: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    z-index: 50;
    max-height: 250px;
    overflow-y: auto;
  }

  .custom-select-options {
    padding: 0.5rem 0;
  }

  .custom-select-option {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f8f9fa;
      color: #42b883;
    }
    
    &.selected {
      background: #42b883;
      color: white;
      
      &:hover {
        background: #3aa876;
      }
    }
  }

  .no-results {
    padding: 0.75rem 1rem;
    color: #64748b;
    text-align: center;
    font-style: italic;
  }

  /* Custom scrollbar for the dropdown */
  .custom-select-dropdown {
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
      
      &:hover {
        background: #a8a8a8;
      }
    }
  }
}
</style> 