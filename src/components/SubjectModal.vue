<template>
  <div class="modal-overlay">
    <div class="modal-container" style="max-width: 800px; width: 90%;">
      <div class="modal-content">
        <div class="modal-header">
          <i class="fas fa-book text-primary"></i>
          <h3>Manage Subjects</h3>
          <button class="modal-close-btn" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info mb-4">
            <i class="fas fa-info-circle me-2"></i>
            Manage academic subjects for the selected school.
          </div>

          <!-- Add New Subject Form -->
          <div class="card mb-4">
            <div class="card-header bg-light">
              <h5 class="mb-0">Add New Subject</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="saveSubject">
                <div class="row g-3">
                  <div class="col-md-8">
                    <div class="form-group">
                      <label for="subjectName" class="form-label">Subject Name <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        id="subjectName"
                        v-model="newSubject.name"
                        class="form-control"
                        placeholder="E.g. Mathematics, Science, etc."
                        required
                      >
                    </div>
                  </div>
                   <div class="col-md-4">
                    <div class="form-group">
                      <label for="classId" class="form-label">Class <span class="text-danger">*</span></label>
                       <select
                          id="classId"
                          v-model="newSubject.class_id"
                          class="form-select"
                          required
                        >
                          <option value="" disabled>Select Class</option>
                          <option v-for="cls in classes" :key="cls.class_id" :value="cls.class_id">
                            {{ cls.class_name }}
                          </option>
                        </select>
                    </div>
                  </div>
                  <div class="col-12 text-end">
                    <button
                      type="submit"
                      class="btn btn-primary"
                      :disabled="savingSubject"
                    >
                      <i class="fas fa-save me-2"></i>
                      {{ savingSubject ? 'Saving...' : 'Save Subject' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- Existing Subjects Table -->
          <div class="card">
            <div class="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Existing Subjects</h5>
              <div v-if="loadingSubjects" class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div class="table-responsive" :style="{ 
              maxHeight: subjects.length > 3 ? '300px' : 'none',
              overflowY: subjects.length > 3 ? 'auto' : 'visible'
            }">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    
                    <th>Subject Name</th>
                    <th>Class</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loadingSubjects && subjects.length === 0">
                    <td colspan="4" class="text-center py-4">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="subjects.length === 0">
                    <td colspan="4" class="text-center py-4">
                      No subjects found. Add your first subject above.
                    </td>
                  </tr>
                  <tr v-for="subject in subjects" :key="subject.id">
                    
                    <td>{{ subject.name }}</td>
                    <td>{{ getClassName(subject.class_id) }}</td>
                    <td class="text-end">
                      <button
                        class="btn btn-sm btn-outline-primary me-2"
                        @click="editSubject(subject)"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        @click="confirmDeleteSubject(subject)"
                        :disabled="deletingSubjectId === subject.id"
                      >
                        <i v-if="deletingSubjectId === subject.id" class="fas fa-spinner fa-spin"></i>
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

  <!-- Edit Subject Modal -->
  <div v-show="isEditSubjectModalOpen" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-header">
          <i class="fas fa-edit text-primary"></i>
          <h3>Edit Subject</h3>
          <button class="modal-close-btn" @click="closeEditSubjectModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body" v-if="editingSubject">
          <form @submit.prevent="updateSubject">
            <div class="row g-3">
              <div class="col-md-12">
                <div class="form-group">
                  <label for="editSubjectName" class="form-label">Subject Name <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    id="editSubjectName"
                    v-model="editingSubject.name"
                    class="form-control"
                    required
                  >
                </div>
              </div>
               <div class="col-md-12">
                <div class="form-group">
                  <label for="editClassId" class="form-label">Class <span class="text-danger">*</span></label>
                   <select
                      id="editClassId"
                      v-model="editingSubject.class_id"
                      class="form-select"
                      required
                    >
                      <option value="" disabled>Select Class</option>
                      <option v-for="cls in classes" :key="cls.class_id" :value="cls.class_id">
                        {{ cls.class_name }}
                      </option>
                    </select>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button
            class="btn btn-outline-secondary"
            @click="closeEditSubjectModal"
            type="button"
          >
            Cancel
          </button>
          <button
            class="btn btn-primary ms-2"
            @click="updateSubject"
            :disabled="updatingSubject"
            type="button"
          >
            <span v-if="updatingSubject">
              <i class="fas fa-spinner fa-spin me-2"></i>Saving...
            </span>
            <span v-else>
              <i class="fas fa-save me-2"></i>Save Changes
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Subject Confirmation Modal -->
  <div v-show="isDeleteSubjectModalOpen" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-header">
          <i class="fas fa-exclamation-triangle text-danger"></i>
          <h3>Delete Subject</h3>
          <button class="modal-close-btn" @click="closeDeleteSubjectModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete the subject "<span class="fw-bold">{{ selectedSubject?.name }}</span>"?</p>
          <p class="text-muted">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button
            class="btn btn-outline-secondary"
            @click="closeDeleteSubjectModal"
            type="button"
          >
            Cancel
          </button>
          <button
            class="btn btn-danger ms-2"
            @click="deleteSubject"
            :disabled="deletingSubjectId !== null"
            type="button"
          >
            <span v-if="deletingSubjectId !== null">
              <i class="fas fa-spinner fa-spin me-2"></i>Deleting...
            </span>
            <span v-else>
              <i class="fas fa-trash me-2"></i>Delete Subject
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

interface Subject {
  id: string
  school_id: string
  class_id: number
  name: string
}

interface ClassItem {
  class_id: number
  class_name: string
}

const subjects = ref<Subject[]>([])
const classes = ref<ClassItem[]>([])
const loadingSubjects = ref(false)
const savingSubject = ref(false)
const deletingSubjectId = ref<string | null>(null)
const isEditSubjectModalOpen = ref(false)
const editingSubject = ref<Subject | null>(null)
const isDeleteSubjectModalOpen = ref(false)
const selectedSubject = ref<Subject | null>(null)
const updatingSubject = ref(false)

const newSubject = ref({
  name: '',
  class_id: '', // Use string initially for select placeholder
})

const emit = defineEmits(['close', 'subject-added', 'subject-updated', 'subject-deleted'])

const schoolId = authStore.userRole?.school_id || authStore.getSelectedSchoolId

const fetchSubjects = async () => {
  loadingSubjects.value = true
  try {
    if (!schoolId) {
      console.error('School ID is missing, cannot fetch subjects.')
      subjects.value = []
      return
    }

    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('school_id', schoolId)
      .order('name', { ascending: true })

    if (error) throw error

    subjects.value = data || []
  } catch (error: any) {
    console.error('Error fetching subjects:', error)
    toast.error('Failed to load subjects: ' + (error.message || 'Unknown error'))
  } finally {
    loadingSubjects.value = false
  }
}

const fetchClasses = async () => {
   try {
    if (!schoolId) {
      console.error('School ID is missing, cannot fetch classes.')
      classes.value = []
      return
    }
    const { data, error } = await supabase
      .from('classes')
      .select('class_id, class_name')
       .eq('school_id', schoolId)
      .order('class_name', { ascending: true })

    if (error) throw error

    classes.value = data as ClassItem[] || []
  } catch (error: any) {
    console.error('Error fetching classes:', error)
     toast.error('Failed to load classes for subject assignment: ' + (error.message || 'Unknown error'))
  }
}

const getClassName = (classId: number) => {
  const cls = classes.value.find(c => c.class_id === classId)
  return cls ? cls.class_name : 'Unknown Class'
}

const saveSubject = async () => {
  savingSubject.value = true
  try {
    if (!schoolId) {
      throw new Error('School ID is missing. Cannot save subject.')
    }
    if (!newSubject.value.name || !newSubject.value.class_id) {
        throw new Error('Please fill in all required fields');
    }

    const insertData = {
      name: newSubject.value.name,
      class_id: parseInt(newSubject.value.class_id as string), // Ensure class_id is number
      school_id: schoolId
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert([insertData])
      .select()
      .single()

    if (error) throw error

    await logActivity('create', 'subjects', data.id, null, data)

    toast.success('Subject added successfully')
    newSubject.value = { name: '', class_id: '' }
    await fetchSubjects()
    emit('subject-added') // Notify parent to potentially update count

  } catch (error: any) {
    console.error('Error saving subject:', error)
    toast.error('Failed to save subject: ' + (error.message || 'Unknown error'))
  } finally {
    savingSubject.value = false
  }
}

const editSubject = (subject: Subject) => {
  editingSubject.value = { ...subject }
  isEditSubjectModalOpen.value = true
}

const closeEditSubjectModal = () => {
  isEditSubjectModalOpen.value = false
  editingSubject.value = null
}

const updateSubject = async () => {
  if (!editingSubject.value || !editingSubject.value.id) return

  updatingSubject.value = true
  try {
    if (!editingSubject.value.name || !editingSubject.value.class_id) {
        throw new Error('Please fill in all required fields');
    }
     // Ensure class_id is number
    const updatedClassId = typeof editingSubject.value.class_id === 'string' 
      ? parseInt(editingSubject.value.class_id) 
      : editingSubject.value.class_id;

    const updateData = {
      name: editingSubject.value.name,
      class_id: updatedClassId
    }

    const { data: originalSubject } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', editingSubject.value.id)
      .single()

    const { data, error } = await supabase
      .from('subjects')
      .update(updateData)
      .eq('id', editingSubject.value.id)
      .select()
      .single()

    if (error) throw error

     await logActivity(
      'update',
      'subjects',
      data.id,
      originalSubject || null,
      data
    )

    toast.success('Subject updated successfully')
    await fetchSubjects()
    closeEditSubjectModal()
    emit('subject-updated') // Notify parent

  } catch (error: any) {
    console.error('Error updating subject:', error)
    toast.error('Failed to update subject: ' + (error.message || 'Unknown error'))
  } finally {
    updatingSubject.value = false
  }
}

const confirmDeleteSubject = (subject: Subject) => {
  selectedSubject.value = subject
  isDeleteSubjectModalOpen.value = true
}

const closeDeleteSubjectModal = () => {
  isDeleteSubjectModalOpen.value = false
  selectedSubject.value = null
}

const deleteSubject = async () => {
  if (!selectedSubject.value || !selectedSubject.value.id) return

  deletingSubjectId.value = selectedSubject.value.id
  try {
    const subjectToDelete = { ...selectedSubject.value }

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', selectedSubject.value.id)

    if (error) throw error

    await logActivity('delete', 'subjects', subjectToDelete.id, subjectToDelete, null)

    subjects.value = subjects.value.filter(s => s.id !== selectedSubject.value!.id)
    toast.success('Subject deleted successfully')
    closeDeleteSubjectModal()
    emit('subject-deleted') // Notify parent

  } catch (error: any) {
    console.error('Error deleting subject:', error)
    toast.error('Failed to delete subject: ' + (error.message || 'Unknown error'))
  } finally {
    deletingSubjectId.value = null
  }
}

onMounted(() => {
  fetchSubjects()
  fetchClasses()
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
  max-width: 500px;
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

  .modal-header {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;

    i {
      font-size: 1.5rem;
    }

    h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      flex-grow: 1;
    }

    .modal-close-btn {
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

      &:hover {
        background: #f1f5f9;
        color: #ef4444;
      }

      i {
        font-size: 1rem;
      }
    }
  }

  .modal-body {
    padding: 1.5rem;
    max-height: calc(90vh - 150px); /* Adjust based on header/footer size */
    overflow-y: auto;
    flex: 1;

    .row {
      margin: 0;

      .col-md-8, .col-md-4, .col-md-12, .col-12 {
        padding: 0 0.75rem;
      }
    }
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
}

.card-header {
  font-weight: 500;

  h5 {
    font-weight: 600;
  }

}

.table-responsive {
  min-height: 100px; /* Adjust as needed */
  max-height: 300px; /* Adjust as needed */
  overflow-y: auto;
}

.table {
  margin-bottom: 0;

  th {
    position: sticky;
    top: 0;
    background: #f8f9fa;
    z-index: 1;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
  }
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}

.btn-sm i {
    font-size: 0.8rem;
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