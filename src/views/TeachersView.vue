<template>
  <div class="container py-4 mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-0 text-gray-800">My Classroom</h1>
        <p class="mb-0">Manage all Attendance, Assignments, and Students</p>
      </div>
    </div>

    <!-- Modern Tab Navigation -->
    <div class="tab-menu mb-4">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        <i :class="tab.icon" class="me-2"></i>{{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content-area">
      <div v-if="activeTab === 'attendance'">
        <div class="tab-card">
          <h4 class="mb-2"><i class="fas fa-user-check text-success me-2"></i>Attendance Tracking</h4>
          <p class="text-muted mb-3">Monitor and record student attendance efficiently for every class session.</p>
          <div class="row mb-3 align-items-end">
            <div class="col-md-4">
              <label for="attendanceDate" class="form-label fw-semibold">Session Date</label>
              <input type="date" id="attendanceDate" v-model="attendanceDate" class="form-control" />
            </div>
          </div>
          <div class="table-responsive mb-3">
            <table class="table align-middle attendance-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in students" :key="student.id">
                  <td>{{ student.name }}</td>
                  <td>{{ student.id }}</td>
                  <td>
                    <select v-model="attendanceRecords[student.id]" class="form-select attendance-select">
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="d-flex justify-content-end">
            <button class="btn btn-primary" @click="saveAttendance" :disabled="saveLoading">
              <span v-if="saveLoading" class="spinner-border spinner-border-sm me-2"></span>
              Save Attendance
            </button>
          </div>
        </div>
      </div>
      <div v-else-if="activeTab === 'assignments'">
        <div class="tab-card">
          <h4 class="mb-2"><i class="fas fa-tasks text-info me-2"></i>Assignment Management</h4>
          <p class="text-muted">Create, assign, and review assignments to keep students engaged and on track. (Feature coming soon!)</p>
        </div>
      </div>
      <div v-else-if="activeTab === 'students'">
        <div class="tab-card">
          <h4 class="mb-2"><i class="fas fa-users text-warning me-2"></i>Student Management</h4>
          <p class="text-muted">View and manage student profiles, progress, and classroom participation. (Feature coming soon!)</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

const tabs = [
  { key: 'attendance', label: 'Attendance', icon: 'fas fa-user-check' },
  { key: 'assignments', label: 'Assignments', icon: 'fas fa-tasks' },
  { key: 'students', label: 'Students', icon: 'fas fa-users' },
]
const activeTab = ref('attendance')

// Mock student data
const students = [
  { id: 'S001', name: 'Alice Johnson' },
  { id: 'S002', name: 'Brian Smith' },
  { id: 'S003', name: 'Carla Lee' },
  { id: 'S004', name: 'David Kim' },
]

const attendanceDate = ref(new Date().toISOString().slice(0, 10))
const attendanceRecords = ref<Record<string, string>>({})
students.forEach(s => attendanceRecords.value[s.id] = 'present')

const saveLoading = ref(false)
const toast = useToast()

const saveAttendance = async () => {
  saveLoading.value = true
  setTimeout(() => {
    saveLoading.value = false
    toast.success('Attendance saved!')
  }, 1000)
}
</script>

<style scoped lang="scss">
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.tab-menu {
  display: flex;
  gap: 1.5rem;
  border-bottom: 2px solid #e6e6e6;
  margin-bottom: 2rem;
}
.tab-btn {
  background: none;
  border: none;
  outline: none;
  font-size: 1.1rem;
  font-weight: 500;
  color: #35495e;
  padding: 0.75rem 1.5rem 0.5rem 1.5rem;
  border-bottom: 3px solid transparent;
  transition: color 0.2s, border-color 0.2s;
  cursor: pointer;
  border-radius: 0.5rem 0.5rem 0 0;
  display: flex;
  align-items: center;
  &:hover {
    color: #42b883;
    background: #f8f9fa;
  }
  &.active {
    color: #42b883;
    border-bottom: 3px solid #42b883;
    background: #f8f9fa;
  }
}

.tab-content-area {
  min-height: 220px;
}
.tab-card {
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(66, 184, 131, 0.07);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  border: 1px solid #e6e6e6;
  text-align: left;
}

.attendance-table th, .attendance-table td {
  vertical-align: middle;
}
.attendance-select {
  min-width: 120px;
  border-radius: 0.5rem;
  font-size: 1rem;
  padding: 0.5rem 1rem;
}
</style> 