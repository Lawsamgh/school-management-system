<template>
  <div class="modal-overlay">
    <div class="modal-container" style="max-width: 800px; width: 90%;">
      <div class="modal-content">
        <div class="modal-header">
          <i class="fas fa-calendar-alt text-primary"></i>
          <h3>Manage Academic Terms</h3>
          <button class="modal-close-btn" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info mb-4">
            <i class="fas fa-info-circle me-2"></i>
            Manage academic terms and set the current active term for your school.
          </div>

          <!-- Add New Academic Term Form -->
          <div class="card mb-4">
            <div class="card-header bg-light">
              <h5 class="mb-0">Add New Academic Term</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="saveTerm">
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="termName" class="form-label">Term Name <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        id="termName"
                        v-model="newTerm.name"
                        class="form-control"
                        placeholder="E.g. First Term 2023/2024"
                        required
                      >
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="academicYear" class="form-label">Academic Year <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        id="academicYear"
                        v-model="newTerm.academic_year"
                        class="form-control"
                        placeholder="E.g. 2023/2024"
                        required
                      >
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label for="termNumber" class="form-label">Term Number <span class="text-danger">*</span></label>
                      <select
                        id="termNumber"
                        v-model="newTerm.term_number"
                        class="form-select"
                        required
                      >
                        <option value="" disabled>Select Term Number</option>
                        <option value="1">First Term</option>
                        <option value="2">Second Term</option>
                        <option value="3">Third Term</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label for="startDate" class="form-label">Start Date <span class="text-danger">*</span></label>
                      <input
                        type="date"
                        id="startDate"
                        v-model="newTerm.start_date"
                        class="form-control"
                        required
                      >
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label for="endDate" class="form-label">End Date <span class="text-danger">*</span></label>
                      <input
                        type="date"
                        id="endDate"
                        v-model="newTerm.end_date"
                        class="form-control"
                        required
                      >
                    </div>
                  </div>
                  <div class="col-12 text-end">
                    <button
                      type="submit"
                      class="btn btn-primary"
                      :disabled="savingTerm"
                    >
                      <i class="fas fa-save me-2"></i>
                      {{ savingTerm ? 'Saving...' : 'Save Term' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- Existing Academic Terms Table -->
          <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Existing Academic Terms</h5>
              <div v-if="loadingTerms" class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div class="table-responsive" :style="{ 
              maxHeight: terms.length > 3 ? '300px' : 'none',
              overflowY: terms.length > 3 ? 'auto' : 'visible'
            }">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Term Name</th>
                    <!-- <th>Academic Year</th>
                    <th>Term Number</th> -->
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loadingTerms && terms.length === 0">
                    <td colspan="7" class="text-center py-4">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="terms.length === 0">
                    <td colspan="7" class="text-center py-4">
                      No academic terms found. Add your first term above.
                    </td>
                  </tr>
                  <tr v-for="term in terms" :key="term.id">
                    <td>{{ term.name }}</td>
                   <!--  <td>{{ term.academic_year }}</td>
                    <td>Term {{ term.term_number }}</td> -->
                    <td>{{ formatDate(term.start_date) }}</td>
                    <td>{{ formatDate(term.end_date) }}</td>
                    <td>
                      <span 
                        class="badge"
                        :class="term.is_current ? 'bg-success' : 'bg-secondary'"
                      >
                        {{ term.is_current ? 'Current' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="text-end">
                      <button
                        v-if="!term.is_current"
                        class="btn btn-sm btn-outline-success me-2"
                        @click="setCurrentTerm(term)"
                        :disabled="updatingTermId === term.id"
                      >
                        <i v-if="updatingTermId === term.id" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-check"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-primary me-2"
                        @click="editTerm(term)"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        @click="confirmDeleteTerm(term)"
                        :disabled="deletingTermId === term.id"
                      >
                        <i v-if="deletingTermId === term.id" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('close')">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Term Modal -->
  <div v-if="isEditTermModalOpen" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-header">
          <i class="fas fa-edit text-primary"></i>
          <h3>Edit Academic Term</h3>
          <button class="modal-close-btn" @click="closeEditTermModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateTerm" v-if="editingTerm">
            <div class="row g-3">
              <div class="col-md-12">
                <div class="form-group">
                  <label for="editTermName" class="form-label">Term Name <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    id="editTermName"
                    v-model="editingTerm.name"
                    class="form-control"
                    required
                  >
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label for="editAcademicYear" class="form-label">Academic Year <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    id="editAcademicYear"
                    v-model="editingTerm.academic_year"
                    class="form-control"
                    required
                  >
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label for="editTermNumber" class="form-label">Term Number <span class="text-danger">*</span></label>
                  <select
                    id="editTermNumber"
                    v-model="editingTerm.term_number"
                    class="form-select"
                    required
                  >
                    <option value="" disabled>Select Term Number</option>
                    <option value="1">First Term</option>
                    <option value="2">Second Term</option>
                    <option value="3">Third Term</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label for="editStartDate" class="form-label">Start Date <span class="text-danger">*</span></label>
                  <input
                    type="date"
                    id="editStartDate"
                    v-model="editingTerm.start_date"
                    class="form-control"
                    required
                  >
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label for="editEndDate" class="form-label">End Date <span class="text-danger">*</span></label>
                  <input
                    type="date"
                    id="editEndDate"
                    v-model="editingTerm.end_date"
                    class="form-control"
                    required
                  >
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button
            class="btn btn-outline-secondary"
            @click="closeEditTermModal"
            type="button"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary"
            @click="updateTerm"
            :disabled="updatingTerm"
            type="button"
          >
            <i class="fas fa-save me-2"></i>
            {{ updatingTerm ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="isDeleteTermModalOpen" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-header">
          <i class="fas fa-exclamation-triangle text-danger"></i>
          <h3>Delete Academic Term</h3>
          <button class="modal-close-btn" @click="closeDeleteTermModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete the academic term "<span class="fw-bold">{{ selectedTerm?.name }}</span>"?</p>
          <p class="text-muted">This action cannot be undone. Deleting a term may affect student records and other data.</p>
        </div>
        <div class="modal-footer">
          <button 
            class="btn btn-outline-secondary" 
            @click="closeDeleteTermModal"
            type="button"
          >
            Cancel
          </button>
          <button 
            class="btn btn-danger ms-2" 
            @click="deleteTerm"
            :disabled="deletingTermId !== null"
            type="button"
          >
            <span v-if="deletingTermId !== null">
              <i class="fas fa-spinner fa-spin me-2"></i>Deleting...
            </span>
            <span v-else>
              <i class="fas fa-trash me-2"></i>Delete Term
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import { useToast } from 'vue-toastification'
import { logActivity } from '@/lib/auditLogger'

const authStore = useAuthStore()
const toast = useToast()

interface Term {
  id: string
  school_id: string
  name: string
  academic_year: string
  term_number: number
  start_date: string
  end_date: string
  is_current: boolean
}

const terms = ref<Term[]>([])
const loadingTerms = ref(false)
const savingTerm = ref(false)
const deletingTermId = ref<string | null>(null)
const isEditTermModalOpen = ref(false)
const editingTerm = ref<Term | null>(null)
const isDeleteTermModalOpen = ref(false)
const selectedTerm = ref<Term | null>(null)
const updatingTerm = ref(false)
const updatingTermId = ref<string | null>(null)

const newTerm = ref({
  name: '',
  academic_year: '',
  term_number: '',
  start_date: '',
  end_date: ''
})

const emit = defineEmits(['close', 'term-added', 'term-updated', 'term-deleted'])

const schoolId = authStore.userRole?.school_id || authStore.getSelectedSchoolId

const fetchTerms = async () => {
  loadingTerms.value = true
  try {
    if (!schoolId) {
      console.error('School ID is missing, cannot fetch terms.')
      terms.value = []
      return
    }

    const { data, error } = await supabase
      .from('academic_terms')
      .select('*')
      .eq('school_id', schoolId)
      .order('academic_year', { ascending: false })
      .order('term_number', { ascending: true })

    if (error) throw error

    terms.value = data || []
  } catch (error: any) {
    console.error('Error fetching terms:', error)
    toast.error('Failed to load terms: ' + (error.message || 'Unknown error'))
  } finally {
    loadingTerms.value = false
  }
}

const saveTerm = async () => {
  savingTerm.value = true
  try {
    if (!schoolId) {
      throw new Error('School ID is missing. Cannot save term.')
    }
    if (!newTerm.value.name || !newTerm.value.academic_year || !newTerm.value.term_number || 
        !newTerm.value.start_date || !newTerm.value.end_date) {
      throw new Error('Please fill in all required fields')
    }

    const insertData = {
      name: newTerm.value.name,
      academic_year: newTerm.value.academic_year,
      term_number: parseInt(newTerm.value.term_number as string),
      start_date: newTerm.value.start_date,
      end_date: newTerm.value.end_date,
      school_id: schoolId,
      is_current: false // New terms are not current by default
    }

    const { data, error } = await supabase
      .from('academic_terms')
      .insert([insertData])
      .select()
      .single()

    if (error) throw error

    await logActivity('create', 'academic_terms', data.id, null, data)

    toast.success('Academic term added successfully')
    newTerm.value = { name: '', academic_year: '', term_number: '', start_date: '', end_date: '' }
    await fetchTerms()
    emit('term-added')

  } catch (error: any) {
    console.error('Error saving term:', error)
    toast.error('Failed to save term: ' + (error.message || 'Unknown error'))
  } finally {
    savingTerm.value = false
  }
}

const editTerm = (term: Term) => {
  editingTerm.value = { ...term }
  isEditTermModalOpen.value = true
}

const closeEditTermModal = () => {
  isEditTermModalOpen.value = false
  editingTerm.value = null
}

const updateTerm = async () => {
  if (!editingTerm.value || !editingTerm.value.id) return

  updatingTerm.value = true
  try {
    if (!editingTerm.value.name || !editingTerm.value.academic_year || !editingTerm.value.term_number ||
        !editingTerm.value.start_date || !editingTerm.value.end_date) {
      throw new Error('Please fill in all required fields')
    }

    const { data: originalTerm } = await supabase
      .from('academic_terms')
      .select('*')
      .eq('id', editingTerm.value.id)
      .single()

    const { data, error } = await supabase
      .from('academic_terms')
      .update({
        name: editingTerm.value.name,
        academic_year: editingTerm.value.academic_year,
        term_number: editingTerm.value.term_number,
        start_date: editingTerm.value.start_date,
        end_date: editingTerm.value.end_date
      })
      .eq('id', editingTerm.value.id)
      .select()
      .single()

    if (error) throw error

    await logActivity(
      'update',
      'academic_terms',
      data.id,
      originalTerm || null,
      data
    )

    toast.success('Academic term updated successfully')
    await fetchTerms()
    closeEditTermModal()
    emit('term-updated')

  } catch (error: any) {
    console.error('Error updating term:', error)
    toast.error('Failed to update term: ' + (error.message || 'Unknown error'))
  } finally {
    updatingTerm.value = false
  }
}

const setCurrentTerm = async (term: Term) => {
  updatingTermId.value = term.id
  try {
    // First, remove current status from all terms
    const { error: resetError } = await supabase
      .from('academic_terms')
      .update({ is_current: false })
      .eq('school_id', schoolId)

    if (resetError) throw resetError

    // Then set the selected term as current
    const { error: updateError } = await supabase
      .from('academic_terms')
      .update({ is_current: true })
      .eq('id', term.id)

    if (updateError) throw updateError

    await logActivity(
      'update',
      'academic_terms',
      term.id,
      { ...term, is_current: false },
      { ...term, is_current: true }
    )

    toast.success(`${term.name} set as current term`)
    await fetchTerms()

  } catch (error: any) {
    console.error('Error setting current term:', error)
    toast.error('Failed to set current term: ' + (error.message || 'Unknown error'))
  } finally {
    updatingTermId.value = null
  }
}

const confirmDeleteTerm = (term: Term) => {
  selectedTerm.value = term
  isDeleteTermModalOpen.value = true
}

const closeDeleteTermModal = () => {
  isDeleteTermModalOpen.value = false
  selectedTerm.value = null
}

const deleteTerm = async () => {
  if (!selectedTerm.value || !selectedTerm.value.id) return

  deletingTermId.value = selectedTerm.value.id
  try {
    const termToDelete = { ...selectedTerm.value }

    const { error } = await supabase
      .from('academic_terms')
      .delete()
      .eq('id', selectedTerm.value.id)

    if (error) throw error

    await logActivity('delete', 'academic_terms', termToDelete.id, termToDelete, null)

    terms.value = terms.value.filter(t => t.id !== selectedTerm.value!.id)
    toast.success('Academic term deleted successfully')
    closeDeleteTermModal()
    emit('term-deleted')

  } catch (error: any) {
    console.error('Error deleting term:', error)
    toast.error('Failed to delete term: ' + (error.message || 'Unknown error'))
  } finally {
    deletingTermId.value = null
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchTerms()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 1000px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-content {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.modal-header i {
  font-size: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  flex-grow: 1;
}

.modal-header .modal-close-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-header .modal-close-btn:hover {
  background: #f1f5f9;
  color: #ef4444;
}

.modal-header .modal-close-btn i {
  font-size: 1rem;
}

.modal-body {
  padding: 1.5rem;
  max-height: calc(90vh - 150px);
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  flex-shrink: 0;
}

.btn-sm i {
  font-size: 0.75rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
}

.btn-sm.me-2 {
  margin-right: 0.3rem !important;
}

/* Table styles */
.table th {
  position: sticky;
  top: 0;
  background: #f8f9fa;
  z-index: 1;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
}

/* Remove hover effects from cards and tables inside the modal */
.modal-overlay .card,
.modal-overlay .table-hover tr:hover {
  transition: none !important;
  transform: none !important;
  box-shadow: none !important;
  background-color: inherit !important;
  border-color: inherit !important;
}

.modal-overlay .card {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05) !important;
}

.modal-overlay .table-hover tr {
  background-color: white !important;
}
</style> 