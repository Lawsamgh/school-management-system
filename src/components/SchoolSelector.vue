<template>
  <div class="school-selector mb-4">
    <div class="form-group">
      <label class="form-label">Select School</label>
      <select 
        class="form-select" 
        v-model="selectedSchool"
        @change="handleSchoolChange"
        :disabled="loading"
      >
        <option value="">Select a school</option>
        <option 
          v-for="school in schools" 
          :key="school.id" 
          :value="school.id"
        >
          {{ school.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { useToast } from 'vue-toastification'

const toast = useToast()
const authStore = useAuthStore()
const loading = ref(false)
const schools = ref<{ id: string; name: string }[]>([])
const selectedSchool = ref(authStore.getSelectedSchoolId || '')

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

// Add event listener for school refresh
onMounted(() => {
  fetchSchools()
  // Listen for refresh event
  window.addEventListener('refresh-schools', fetchSchools)
})

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('refresh-schools', fetchSchools)
})

const handleSchoolChange = () => {
  if (selectedSchool.value) {
    localStorage.setItem('selectedSchoolId', selectedSchool.value)
    authStore.setSelectedSchoolId(selectedSchool.value)
  } else {
    localStorage.removeItem('selectedSchoolId')
    authStore.setSelectedSchoolId(null)
  }
}

// Watch for external changes to selected school
watch(() => authStore.getSelectedSchoolId, (newId) => {
  selectedSchool.value = newId || ''
})
</script>

<style scoped lang="scss">
.school-selector {
  .form-select {
    border: 2px solid #e2e8f0;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    color: #1e293b;
    transition: all 0.3s ease;

    &:focus {
      border-color: #42b883;
      box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
    }

    &:disabled {
      background-color: #f8fafc;
      cursor: not-allowed;
    }
  }

  .form-label {
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }
}
</style> 