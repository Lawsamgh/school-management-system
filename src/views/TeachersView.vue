<template>
  <div class="teachers-container">
    <!-- Loading Spinner for Teacher Role -->
    <LoadingSpinner 
      :visible="loading && !isAdmin" 
      message="Loading your classroom..."
    />

    <!-- Class Selection Modal for Admins -->
    <div class="modal fade" id="classSelectionModal" data-bs-backdrop="static" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title">
              <i class="fas fa-chalkboard-teacher text-primary me-2"></i>
              {{ isSuperAdmin ? 'Select School & Class' : 'Select Class' }}
            </h5>
          </div>
          <div class="modal-body p-0">
            <div class="class-selection-card">
              <!-- Info Section -->
              <div class="info-section mb-4">
                <div class="icon">
                  <i class="fas fa-info-circle"></i>
                </div>
                <p>{{ isSuperAdmin ? 'Please select a school and then a class to proceed.' : 'Please select a class to proceed.' }}</p>
              </div>
              
              <!-- Selection Container -->
              <div class="selection-container">
                <!-- School Selection for Superadmin -->
                <div v-if="isSuperAdmin" class="selection-section mb-4">
                  <label class="form-label">School</label>
                  <SchoolSelector @school-selected="handleSchoolChange" />
                </div>

                <!-- Class Selection -->
                <div class="selection-section" v-if="!isSuperAdmin || (isSuperAdmin && authStore.getSelectedSchoolId)">
                  <label class="form-label">Class</label>
                  <div class="class-select-wrapper">
                    <select 
                      class="form-select"
                      v-model="selectedClassId"
                      :disabled="loadingClasses"
                    >
                      <option value="" disabled selected>Choose a class...</option>
                      <option 
                        v-for="cls in teacherClasses" 
                        :key="cls.class_id" 
                        :value="cls.class_id"
                      >
                        {{ cls.class_name }}
                      </option>
                    </select>
                    <div v-if="loadingClasses" class="spinner-wrapper">
                      <div class="spinner-border spinner-border-sm text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button 
              type="button" 
              class="btn btn-primary"
              :disabled="!selectedClassId || (isSuperAdmin && !authStore.getSelectedSchoolId)"
              @click="proceedToTeacherView"
            >
              <i class="fas fa-arrow-right me-2"></i>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isPageReady" class="teachers-view">
  <div class="container-lg py-4">
    <div class="row justify-content-center">
      <div class="col-12" style="max-width: 1400px;">
            <!-- Main content -->
            <div v-if="!isSuperAdmin || (isSuperAdmin && authStore.getSelectedSchoolId && selectedClassId)">
              <!-- Modern Header Card -->
              <div class="header-card mb-4">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 class="mb-1">{{ isAdmin ? 'Class Management' : 'Teacher Dashboard' }}</h2>
                    <p class="text-muted mb-0">
                      {{ isAdmin ? 'Monitor and manage all class activities' : `Managing ${selectedClassName}` }}
                    </p>
                    <div v-if="!isAdmin" class="class-info mt-2">
                      <span class="badge bg-primary">
                        <i class="fas fa-chalkboard me-1"></i>
                        {{ selectedClassName }}
                      </span>
                    </div>
                  </div>
                  <div class="d-flex align-items-center gap-3">
                    <!-- Class Change Button -->
                    <button 
                      v-if="isAdmin || isSuperAdmin"
                      class="btn btn-outline-primary btn-sm"
                      @click="openClassSelectionModal"
                    >
                      <i class="fas fa-exchange-alt me-2"></i>
                      Change {{ isSuperAdmin ? 'School/Class' : 'Class' }}
                    </button>
                    <button 
                      class="btn btn-outline-primary btn-sm"
                      @click="openClassScheduleModal"
                    >
                      <i class="fas fa-calendar-alt me-2"></i>
                      Class Schedule
                    </button>
                    <button 
                      v-if="todayAttendance.length === 0"
                      class="btn btn-primary" 
                      @click="openTakeAttendanceModal"
                    >
                      <i class="fas fa-clipboard-check me-2"></i>
                      Take Attendance
                    </button>
                  </div>
                </div>
              </div>

              <!-- Content Tabs -->
              <div class="content-tabs mb-4">
                <ul class="nav nav-pills" id="teacherTabs" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button 
                      class="nav-link"
                      :class="{ active: activeTab === 'attendance' }" 
                      id="attendance-tab" 
                      data-bs-toggle="tab" 
                      data-bs-target="#attendance" 
                      type="button" 
                      role="tab"
                      @click="setActiveTab('attendance')"
                    >
                      <i class="fas fa-clipboard-check me-2"></i>
                      Attendance
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button 
                      class="nav-link"
                      :class="{ active: activeTab === 'assignments' }" 
                      id="assignments-tab" 
                      data-bs-toggle="tab" 
                      data-bs-target="#assignments" 
                      type="button" 
                      role="tab"
                      @click="setActiveTab('assignments')"
                    >
                      <i class="fas fa-book me-2"></i>
                      Assignments
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button 
                      class="nav-link"
                      :class="{ active: activeTab === 'promote' }" 
                      id="promote-tab" 
                      data-bs-toggle="tab" 
                      data-bs-target="#promote" 
                      type="button" 
                      role="tab"
                      @click="setActiveTab('promote')"
                    >
                      <i class="fas fa-graduation-cap me-2"></i>
                      Promote Student
                    </button>
                  </li>
                </ul>
              </div>

              <!-- Tab Content -->
              <div class="tab-content" id="teacherTabsContent">
              <!-- Attendance Tab -->
              <div 
                class="tab-pane fade"
                :class="{ 'show active': activeTab === 'attendance' }" 
                id="attendance" 
                role="tabpanel"
              >
                <!-- Analytics Summary Cards -->
                <div class="row g-4 mb-4">
                  <div class="col-md-3">
                    <div class="analytics-card">
                      <div class="analytics-icon students">
                        <i class="fas fa-users"></i>
                      </div>
                      <div class="analytics-data">
                        <h4>{{ totalStudents }}</h4>
                        <p>Total Students</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="analytics-card">
                      <div class="analytics-icon present">
                        <i class="fas fa-check-circle"></i>
                      </div>
                      <div class="analytics-data">
                        <h4>{{ presentCount }}</h4>
                        <p>Present</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="analytics-card">
                      <div class="analytics-icon absent">
                        <i class="fas fa-times-circle"></i>
                      </div>
                      <div class="analytics-data">
                        <h4>{{ absentCount }}</h4>
                        <p>Absent</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="analytics-card">
                      <div class="analytics-icon late">
                        <i class="fas fa-clock"></i>
                      </div>
                      <div class="analytics-data">
                        <h4>{{ lateCount }}</h4>
                        <p>Late</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Attendance Table Card -->
                <div class="content-card attendance-table-card">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Recent Attendance</h5>
                    <div>
                      <div class="d-flex align-items-center gap-2">
                        <div class="modern-date-display">
                          <i class="far fa-calendar me-2"></i>
                          {{ formatDateModern(selectedDate) }}
                            </div>
                        <button class="btn btn-outline-light btn-date-change" @click="openDatePickerModal">
                          Change Date
                        </button>
                        <button 
                          v-if="selectedDate !== today" 
                          class="btn-today"
                          @click="resetToToday"
                        >
                          Today
                        </button>
                            </div>
                          </div>
                        </div>
                  <div class="card-body p-0">
                    <div v-if="todayAttendance.length > 0" class="table-responsive">
                      <table class="table custom-table">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>ID</th>
                            <th>Status</th>
                            <th>Remarks</th>
                            <th>Taken By</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="record in todayAttendance" :key="record.id">
                            <td>
                              <div class="d-flex align-items-center">
                                <div class="avatar-circle">
                                  {{ getInitials(record.student_name) }}
                                </div>
                                <div class="ms-3">
                                  <h6 class="mb-0">{{ record.student_name }}</h6>
                                  <small class="text-muted">{{ record.class_name || 'Class not assigned' }}</small>
                                </div>
                              </div>
                            </td>
                            <td>{{ record.identification }}</td>
                            <td>
                              <span :class="['status-badge', record.status]">
                                {{ record.status }}
                              </span>
                            </td>
                            <td>{{ record.remarks || '—' }}</td>
                            <td>
                              <div class="d-flex align-items-center">
                                <i class="fas fa-user-circle me-2 text-muted"></i>
                                {{ record.teacher_name }}
                              </div>
                            </td>
                            <td>
                              <div class="actions">
                                <button 
                                  v-if="String(record.teacher_id) === String(authStore.userRole?.id)"
                                  class="action-btn edit" 
                                  @click="editAttendance(record)"
                                  :title="'Edit attendance'"
                                >
                                  <i class="fas fa-edit"></i>
                                </button>
                                <button 
                                  v-if="isAdmin"
                                  class="action-btn delete" 
                                  @click="deleteAttendance(record.id)"
                                >
                                  <i class="fas fa-trash"></i>
                                </button>
                                <span 
                                  v-if="String(record.teacher_id) !== String(authStore.userRole?.id)"
                                  class="text-muted small"
                                  title="Taken by another teacher"
                                >
                                  <i class="fas fa-lock"></i>
                                </span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      </div>
                    <div v-else class="empty-state-container">
                      <div class="text-center empty-state">
                        <i class="fas fa-clipboard-list fa-3x mb-4 text-muted"></i>
                        <h5 class="mb-3">No attendance records found</h5>
                        <p class="text-muted mb-4">Click "Take Attendance" to record student attendance</p>
                    </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Assignments Tab -->
                <div 
                  class="tab-pane fade"
                  :class="{ 'show active': activeTab === 'assignments' }" 
                  id="assignments" 
                  role="tabpanel"
                >
                  <div class="content-card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                      <h5 class="mb-0">Recent Assignments</h5>
                      <div>
                        <button class="btn btn-primary btn-sm" @click="openCreateAssignmentModal">
                          <i class="fas fa-plus me-2"></i>
                          Create Assignment
                        </button>
                      </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                        <table class="table custom-table">
                            <thead>
                              <tr>
                              <th>Created Date</th>
                              <th>Title</th>
                              <th>Subject</th>
                              <th>Due Date</th>
                              <th>Status</th>
                              <th>Submissions</th>
                              <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="assignment in assignments" :key="assignment.id">
                                <td>{{ formatDate(assignment.created_at) }}</td>
                                <td>
                                <div>
                                  <h6 class="mb-0">{{ assignment.title }}</h6>
                                  <small class="text-muted">
                                    {{ selectedClassName }} | Created by {{ assignment.teacher?.username || 'Unknown Teacher' }}
                                  </small>
                                </div>
                                </td>
                              <td>{{ assignment.subject }}</td>
                              <td>{{ formatDate(assignment.due_date) }}</td>
                              <td><span class="status-badge" :class="assignment.status">{{ assignment.status }}</span></td>
                              <td>{{ assignment.submission_count || 0 }}/{{ totalStudents }}</td>
                                <td>
                                <div class="actions">
                                  <button 
                                    v-if="assignment.teacher_id === authStore.userRole?.id && (!assignment.submission_count || assignment.submission_count === 0)"
                                    class="action-btn edit" 
                                    @click="editAssignment(assignment)"
                                    :title="assignment.submission_count > 0 ? 'Cannot edit assignment with submissions' : 'Edit assignment'"
                                  >
                                    <i class="fas fa-edit"></i>
                                  </button>
                                  <button 
                                    v-if="(!assignment.submission_count || assignment.submission_count === 0) && assignment.teacher_id === authStore.userRole?.id"
                                    class="action-btn delete" 
                                    @click="deleteAssignment(assignment.id)"
                                    :title="assignment.teacher_id === authStore.userRole?.id ? 'Delete assignment' : 'Only the creator can delete this assignment'"
                                  >
                                    <i class="fas fa-trash"></i>
                                  </button>
                                  <span 
                                    v-if="assignment.teacher_id !== authStore.userRole?.id" 
                                    class="text-muted small"
                                    title="Created by another teacher"
                                  >
                                    <i class="fas fa-lock"></i>
                                  </span>
                                </div>
                                </td>
                              </tr>
                              <tr v-if="assignments.length === 0">
                                <td colspan="6">
                                  <div class="text-center py-4">
                                    <i class="fas fa-book fa-2x text-muted mb-3"></i>
                                    <p class="text-muted mb-0">No assignments found</p>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Promote Student Tab -->
                <div 
                  class="tab-pane fade"
                  :class="{ 'show active': activeTab === 'promote' }" 
                  id="promote" 
                  role="tabpanel"
                >
                  <div class="content-card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                      <h5 class="mb-0">Student Promotion</h5>
                      <button class="btn btn-primary btn-sm" @click="promoteSelectedStudents" :disabled="!hasSelectedStudents">
                        <i class="fas fa-level-up-alt me-2"></i>
                        Promote Selected Students
                      </button>
                    </div>
                    <div class="card-body p-0">
                      <div class="table-responsive">
                        <table class="table custom-table">
                          <thead>
                            <tr>
                              <th style="width: 40px;">
                                <div class="form-check">
                                  <input 
                                    type="checkbox" 
                                    class="form-check-input" 
                                    v-model="selectAllStudents"
                                    @change="toggleAllStudents"
                                  >
                                </div>
                              </th>
                              <th>Student</th>
                              <th>Current Class</th>
                              <th>Promote To</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="student in classStudents" :key="student.id">
                              <td>
                                <div class="form-check">
                                  <input 
                                    type="checkbox" 
                                    class="form-check-input" 
                                    v-model="selectedStudents"
                                    :value="student.id"
                                  >
                                </div>
                              </td>
                              <td>
                                <div class="d-flex align-items-center">
                                  <div class="avatar-circle">
                                    {{ getInitials(student.name) }}
                                  </div>
                                  <div class="ms-3">
                                    <h6 class="mb-0">{{ student.name }}</h6>
                                    <small class="text-muted">ID: {{ student.identification }}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{{ selectedClassName }}</td>
                              <td>
                                <select 
                                  class="form-select form-select-sm" 
                                  v-model="studentPromotions[student.id]"
                                >
                                  <option value="" disabled selected>Select class...</option>
                                  <option 
                                    v-for="cls in availableClasses" 
                                    :key="cls.class_id" 
                                    :value="cls.class_id"
                                  >
                                    {{ cls.class_name }}
                                  </option>
                                </select>
                              </td>
                              <td>
                                <span class="status-badge pending">Pending</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            <!-- Initial selection prompt -->
            <div v-else class="text-center py-5">
              <div class="empty-state">
                <i class="fas fa-school fa-3x mb-4 text-muted"></i>
                <h4 class="mb-3">Welcome to Teacher Dashboard</h4>
                <p class="text-muted mb-4">
                  {{ isSuperAdmin ? 'Please select a school and class to get started.' : 'Please select a class to get started.' }}
                </p>
                <button 
                  class="btn btn-primary btn-lg"
                  @click="openClassSelectionModal"
                >
                  <i class="fas fa-arrow-right me-2"></i>
                  {{ isSuperAdmin ? 'Select School & Class' : 'Select Class' }}
                </button>
                              </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

    <!-- Redesigned Take Attendance Modal -->
    <div class="modal fade" id="takeAttendanceModal" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title d-flex align-items-center">
              <i class="fas fa-clipboard-check text-primary me-2"></i>
              Take Attendance
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeModal"
            ></button>
                              </div>
          <div class="modal-body p-0">
            <!-- Header Actions -->
            <div class="attendance-header">
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div class="date-picker" style="min-width: 300px;">
                  <div class="input-icon">
                    <i class="fas fa-calendar-alt"></i>
                    <input 
                      type="date" 
                      class="form-control" 
                      id="attendanceDate"
                      v-model="attendanceDate"
                      disabled
                      style="width: 100%;"
                    >
                              </div>
                            </div>
                <div class="quick-actions d-flex gap-2">
                  <button 
                    class="btn btn-sm btn-outline-success" 
                    @click="markAllPresent"
                  >
                    <i class="fas fa-check-circle me-1"></i>
                    All Present
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger" 
                    @click="markAllAbsent"
                  >
                    <i class="fas fa-times-circle me-1"></i>
                    All Absent
                  </button>
                          </div>
                        </div>
                      </div>

            <!-- Students List -->
            <div class="attendance-list-container">
              <div v-if="loadingStudents" class="loading-state">
                <div class="spinner"></div>
                <p>Loading students...</p>
                              </div>
              <div v-else-if="classStudents.length === 0" class="empty-state">
                <i class="fas fa-users text-muted"></i>
                <h5>No Students Found</h5>
                <p>There are no students assigned to this class</p>
                              </div>
              <div v-else class="attendance-list">
                <div v-for="student in classStudents" :key="student.id" class="student-attendance-row">
                  <div class="student-info">
                    <div class="avatar">{{ getInitials(student.name) }}</div>
                    <div class="details">
                      <h6 class="mb-0">{{ student.name }}</h6>
                      <p>ID: {{ student.identification }}</p>
                      <small v-if="!studentAttendance[student.identification]" class="text-danger">
                        <i class="fas fa-exclamation-circle me-1"></i>
                        Attendance not marked
                      </small>
                    </div>
                  </div>
                  <div class="attendance-options">
                    <div class="status-options">
                      <span 
                        v-for="status in statusOptions" 
                        :key="status"
                        class="status-option"
                        :class="[status, { active: studentAttendance[student.identification] === status }]"
                        @click="studentAttendance[student.identification] = status"
                      >
                        <i :class="{
                          'fas fa-check': status === 'present',
                          'fas fa-times': status === 'absent',
                          'fas fa-clock': status === 'late',
                          'fas fa-calendar': status === 'excused'
                        }"></i>
                      </span>
                    </div>
                    <div class="remarks-field">
                      <input 
                        type="text" 
                        class="form-control form-control-sm" 
                        v-model="studentRemarks[student.identification]"
                        placeholder="Add remarks (optional)"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-outline-secondary" 
              @click="closeModal"
            >
              Cancel
            </button>
            <button 
              type="button" 
              class="btn btn-primary"
              @click="saveAttendance"
              :disabled="saving || classStudents.length === 0 || !isAllStudentsMarked"
              :title="!isAllStudentsMarked ? 'Please mark attendance for all students' : ''"
            >
              <span v-if="saving">
                <i class="fas fa-spinner fa-spin me-2"></i>
                Saving...
              </span>
              <span v-else>
                <i class="fas fa-save me-2"></i>
                Save Attendance
              </span>
            </button>
                        </div>
                      </div>
                    </div>
                  </div>

    <!-- Date Picker Modal -->
    <div class="modal fade" id="datePickerModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title d-flex align-items-center">
              <i class="fas fa-calendar-alt text-primary me-2"></i>
              Select Date
            </h5>
            <button type="button" class="btn-close" @click="closeDatePickerModal"></button>
          </div>
          <div class="modal-body">
            <div class="date-picker-card">
              <div class="current-date-display">
                <div class="date-preview">
                  <div class="month-year">
                    {{ formatDateSegment(tempSelectedDate || today, 'month') }} {{ formatDateSegment(tempSelectedDate || today, 'year') }}
                  </div>
                  <div class="day-number">
                    {{ formatDateSegment(tempSelectedDate || today, 'day') }}
                  </div>
                  <div class="day-name">
                    {{ formatDateSegment(tempSelectedDate || today, 'weekday') }}
                  </div>
                </div>
              </div>

              <div class="date-selection">
                <label class="form-label">Choose a date</label>
                <div class="date-input-wrapper">
                  <div class="date-display" @click="focusDateInput">
                    <i class="fas fa-calendar-day text-primary"></i>
                    <input 
                      type="date" 
                      class="date-input" 
                      ref="dateInput"
                      v-model="tempSelectedDate"
                      :max="today"
                    >
                  </div>
                </div>

                <div class="quick-actions">
                  <button 
                    class="action-btn today-btn" 
                    @click="setTempDateToToday"
                    :disabled="tempSelectedDate === today"
                  >
                    <i class="fas fa-calendar-day me-2"></i>
                    Today
                  </button>
                  <button 
                    class="action-btn prev-btn" 
                    @click="navigateDate(-1)"
                    :disabled="isYesterdayDisabled"
                  >
                    <i class="fas fa-chevron-left me-2"></i>
                    Previous Day
                  </button>
                  <button 
                    class="action-btn next-btn" 
                    @click="navigateDate(1)"
                    :disabled="isTomorrowDisabled"
                  >
                    Next Day
                    <i class="fas fa-chevron-right ms-2"></i>
                        </button>
                      </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeDatePickerModal">
              Cancel
                                  </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="applyDateSelection"
              :disabled="!tempSelectedDate"
            >
              Apply Changes
                                  </button>
                        </div>
                      </div>
                    </div>
                  </div>

    <!-- Attendance Already Taken Modal -->
    <div class="modal fade" id="attendanceExistsModal" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body p-0">
            <div class="attendance-exists-card">
              <div class="warning-icon">
                <i class="fas fa-exclamation-circle"></i>
                </div>
              <div class="warning-content">
                <h4>Attendance Already Recorded</h4>
                <p>Attendance records already exist for today. To make changes, please use the edit button in the attendance table.</p>
              </div>
              <div class="attendance-summary">
                <div class="summary-item">
                  <span class="label">Present</span>
                  <span class="value text-success">{{ existingAttendanceSummary.present }}</span>
            </div>
                <div class="summary-item">
                  <span class="label">Absent</span>
                  <span class="value text-danger">{{ existingAttendanceSummary.absent }}</span>
          </div>
                <div class="summary-item">
                  <span class="label">Late</span>
                  <span class="value text-warning">{{ existingAttendanceSummary.late }}</span>
        </div>
      </div>
              <div class="edit-instruction">
                <div class="instruction-icon">
                  <i class="fas fa-info-circle"></i>
                </div>
                <p>To edit attendance, locate the student in the table below and click the <i class="fas fa-edit text-primary"></i> edit button.</p>
              </div>
              <div class="action-buttons">
                <button 
                  type="button" 
                  class="btn btn-primary" 
                  @click="closeAttendanceExistsModal"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Attendance Modal -->
    <div class="modal fade" id="editAttendanceModal" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title d-flex align-items-center">
              <i class="fas fa-user-edit text-primary me-2"></i>
              Edit Attendance
            </h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <div class="modal-body p-0">
            <div class="edit-attendance-card">
              <!-- Student Info -->
              <div class="student-info-section">
                <div class="avatar">{{ getInitials(editingStudent.name || '') }}</div>
                <div class="info">
                  <h4>{{ editingStudent.name }}</h4>
                  <p class="text-white">ID: {{ editingStudent.identification }}</p>
                </div>
              </div>

              <!-- Status Selection -->
              <div class="status-section">
                <label class="section-label">Attendance Status</label>
                <div class="status-options">
                  <button 
                    v-for="status in statusOptions" 
                    :key="status"
                    class="status-btn"
                    :class="[status, { active: editingStudent.status === status }]"
                    @click="editingStudent.status = status"
                  >
                    <i :class="{
                      'fas fa-check': status === 'present',
                      'fas fa-times': status === 'absent',
                      'fas fa-clock': status === 'late',
                      'fas fa-calendar': status === 'excused'
                    }"></i>
                    <span>{{ status.charAt(0).toUpperCase() + status.slice(1) }}</span>
                  </button>
                </div>
              </div>

              <!-- Remarks -->
              <div class="remarks-section">
                <label class="section-label">Remarks</label>
                <textarea 
                  v-model="editingStudent.remarks"
                  class="form-control"
                  rows="3"
                  placeholder="Add any additional notes or remarks..."
                ></textarea>
              </div>

              <!-- Last Updated Info -->
              <div class="last-updated" v-if="editingStudent.updated_at">
                <i class="fas fa-history text-muted me-2"></i>
                Last updated: {{ formatDateTime(editingStudent.updated_at) }}
              </div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button 
              type="button" 
              class="btn btn-outline-secondary" 
              @click="closeEditModal"
            >
              Cancel
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="saveAttendanceEdit"
              :disabled="!hasAttendanceChanged"
            >
              <i class="fas fa-save me-2"></i>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Assignment Modal -->
    <div class="modal fade" id="createAssignmentModal" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title d-flex align-items-center">
              <i class="fas fa-book text-primary me-2"></i>
              {{ isEditing ? 'Edit Assignment' : 'Create Assignment' }}
            </h5>
            <button type="button" class="btn-close" @click="closeCreateAssignmentModal"></button>
          </div>
          <div class="modal-body p-0">
            <div class="create-assignment-card">
              <!-- Step Progress -->
              <div v-if="newAssignment.type === 'mcq'" class="step-progress">
                <div class="step" :class="{ active: currentStep === 1 }">
                  <div class="step-number">1</div>
                  <div class="step-label">Basic Details</div>
                </div>
                <div class="step-line"></div>
                <div class="step" :class="{ active: currentStep === 2 }">
                  <div class="step-number">2</div>
                  <div class="step-label">Questions</div>
                </div>
              </div>

              <!-- Assignment Form -->
              <form @submit.prevent="saveAssignment">
                <div class="form-section">
                  <!-- Step 1: Basic Details -->
                  <div v-show="currentStep === 1">
                    <div class="basic-details mb-4">
                      <label class="section-label">Basic Details</label>
                      <div class="row g-3">
                        <div class="col-md-6">
                          <!-- Title -->
                          <div class="form-group">
                            <label class="form-label">Title <span class="text-danger">*</span></label>
                            <input 
                              type="text" 
                              class="form-control" 
                              v-model="newAssignment.title"
                              placeholder="Enter assignment title"
                              required
                            >
                          </div>
                        </div>
                        <div class="col-md-6">
                          <!-- Subject -->
                          <div class="form-group">
                            <label class="form-label">Subject <span class="text-danger">*</span></label>
                            <input 
                              type="text" 
                              class="form-control" 
                              v-model="newAssignment.subject"
                              placeholder="Enter subject"
                              required
                            >
                          </div>
                        </div>
                        <div class="col-md-12">
                          <!-- Description -->
                          <div class="form-group">
                            <label class="form-label">Instructions / Description <span class="text-danger">*</span></label>
                            <textarea 
                              class="form-control" 
                              v-model="newAssignment.description"
                              rows="4"
                              placeholder="Enter assignment description"
                              required
                            ></textarea>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <!-- Due Date -->
                          <div class="form-group">
                            <label class="form-label">Due Date <span class="text-danger">*</span></label>
                            <input 
                              type="date" 
                              class="form-control" 
                              v-model="newAssignment.due_date"
                              :min="today"
                              required
                            >
                          </div>
                        </div>
                        <div class="col-md-6">
                          <!-- Assignment Type -->
                          <div class="form-group">
                            <label class="form-label">Assignment Type <span class="text-danger">*</span></label>
                            <select 
                              class="form-select" 
                              v-model="newAssignment.type"
                              @change="handleAssignmentTypeChange"
                              disabled
                              required
                            >
                              <option value="mcq">Multiple Choice Questions</option>
                            </select>
                          </div>
                        </div>
                        <div class="col-md-12">
                          <!-- Timer Settings -->
                          <div class="form-group" v-if="!isEditing || (isEditing && originalAssignmentHadTimer)">
                            <div class="d-flex align-items-center mb-2">
                              <div class="form-check">
                                <input 
                                  type="checkbox" 
                                  class="form-check-input" 
                                  id="hasTimer"
                                  v-model="newAssignment.has_timer"
                                >
                                <label class="form-check-label" for="hasTimer">
                                  Enable Timer
                                </label>
                              </div>
                            </div>
                            <div v-if="newAssignment.has_timer" class="mt-2">
                              <label class="form-label">Time Limit (minutes) <span class="text-danger">*</span></label>
                              <input 
                                type="number" 
                                class="form-control" 
                                v-model="newAssignment.time_limit"
                                min="1"
                                placeholder="Enter time limit in minutes"
                                required
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Step 2: MCQ Questions -->
                  <div v-show="currentStep === 2">
                    <div class="mcq-section" ref="mcqSection">
                      <div class="questions-header">
                        <div class="d-flex justify-content-between align-items-start">
                          <div class="header-content">
                            <h5 class="section-label">Questions</h5>
                            <p class="text-muted">Add multiple choice questions for your assignment</p>
                          </div>
                          <button 
                            type="button" 
                            class="btn btn-outline-primary btn-sm"
                            @click="addQuestion"
                          >
                            <i class="fas fa-plus me-2"></i>
                            Add Question
                          </button>
                        </div>
                      </div>

                      <!-- Questions List -->
                      <div class="questions-list">
                        <div 
                          v-for="(question, index) in newAssignment.questions" 
                          :key="index"
                          class="question-card mb-4"
                        >
                          <div class="question-header">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                              <div class="d-flex align-items-center">
                                <span class="question-number me-3">{{ index + 1 }}</span>
                                <h6 class="mb-0">Question {{ index + 1 }}</h6>
                              </div>
                              <div class="d-flex gap-2">
                                <div class="points-badge">
                                  {{ question.points }} points
                                </div>
                                <button 
                                  type="button" 
                                  class="btn btn-outline-danger btn-sm"
                                  @click="removeQuestion(index)"
                                >
                                  <i class="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div class="question-content">
                            <!-- Question Text -->
                            <div class="form-group mb-3">
                              <label class="form-label">Question Text <span class="text-danger">*</span></label>
                              <textarea 
                                class="form-control" 
                                v-model="question.text"
                                rows="2"
                                placeholder="Enter your question"
                                required
                              ></textarea>
                            </div>

                            <div class="row g-3">
                              <div class="col-md-6">
                                <!-- Points -->
                                <div class="form-group">
                                  <label class="form-label">Points <span class="text-danger">*</span></label>
                                  <input 
                                    type="number" 
                                    class="form-control" 
                                    v-model="question.points"
                                    min="1"
                                    required
                                  >
                                </div>
                              </div>
                            </div>

                            <!-- Options -->
                            <div class="options-section mt-3">
                              <label class="form-label d-flex justify-content-between align-items-center">
                                <span>Options <span class="text-danger">*</span></span>
                                <button 
                                  type="button" 
                                  class="btn btn-outline-primary btn-sm"
                                  @click="addOption(index)"
                                  v-if="question.options.length < 6"
                                >
                                  <i class="fas fa-plus me-1"></i>
                                  Add Option
                                </button>
                              </label>

                              <div class="options-grid">
                                <div 
                                  v-for="(option, optIndex) in question.options" 
                                  :key="optIndex"
                                  class="option-item"
                                >
                                  <div class="input-group">
                                    <div class="input-group-text">
                                      <input 
                                        type="radio" 
                                        :name="'correct_' + index"
                                        :value="optIndex"
                                        v-model="question.correctOption"
                                        required
                                      >
                                    </div>
                                    <input 
                                      type="text" 
                                      class="form-control" 
                                      v-model="option.text"
                                      :placeholder="'Option ' + (optIndex + 1)"
                                      required
                                    >
                                    <button 
                                      type="button" 
                                      class="btn btn-outline-danger"
                                      @click="removeOption(index, optIndex)"
                                      v-if="question.options.length > 2"
                                    >
                                      <i class="fas fa-times"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div class="modal-footer border-0">
            <div class="d-flex justify-content-between w-100">
              <button 
                v-if="currentStep === 2" 
                type="button" 
                class="btn btn-outline-secondary" 
                @click="currentStep = 1"
              >
                <i class="fas fa-arrow-left me-2"></i>
                Back
              </button>
              <div v-else></div>
              
              <div>
                <button 
                  type="button" 
                  class="btn btn-outline-secondary me-2" 
                  @click="closeCreateAssignmentModal"
                >
                  Cancel
                </button>
                
                <button 
                  v-if="currentStep === 1 && newAssignment.type === 'mcq'"
                  type="button" 
                  class="btn btn-primary"
                  @click="goToQuestions"
                  :disabled="!isBasicDetailsValid"
                >
                  Next
                  <i class="fas fa-arrow-right ms-2"></i>
                </button>
                
                <button 
                  v-else
                  type="button" 
                  class="btn btn-primary" 
                  @click="saveAssignment"
                  :disabled="!isAssignmentFormValid || savingAssignment"
                >
                  <i class="fas fa-save me-2"></i>
                  {{ savingAssignment ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Assignment' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
// Add imports at the top of the script section
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from 'vue'
import * as bootstrap from 'bootstrap'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase'
import { useToast } from 'vue-toastification'
import { logActivity } from '@/lib/auditLogger'
import SchoolSelector from '@/components/SchoolSelector.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PromptModal from '@/components/PromptModal.vue'
import { useRouter } from 'vue-router'

// Initialize Bootstrap tabs
onMounted(() => {
  const tabElements = document.querySelectorAll('[data-bs-toggle="tab"]')
  tabElements.forEach(tabElement => {
    new bootstrap.Tab(tabElement)
  })
})

// Store and toast instances
const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

// Modal reference
let attendanceModal: bootstrap.Modal | null = null
let attendanceExistsModal: bootstrap.Modal | null = null
let editAttendanceModal: bootstrap.Modal | null = null
let datePickerModal: bootstrap.Modal | null = null

// Define status options first
const statusOptions = ['present', 'absent', 'late', 'excused'] as const
type AttendanceStatus = typeof statusOptions[number]

// State
const loadingStudents = ref(false)
const saving = ref(false)
const teacherClasses = ref<any[]>([])
const selectedClassId = ref('')
const classStudents = ref<any[]>([])
const studentAttendance = ref<Record<string, AttendanceStatus>>({})
const studentRemarks = ref<Record<string, string>>({})
const attendanceDate = ref(new Date().toISOString().slice(0, 10))
const todayAttendance = ref<any[]>([])
const totalStudents = ref(0)
const hasUnsavedChanges = ref(false)
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const showDatePicker = ref(false)
const tempSelectedDate = ref('')

// Add these refs
const existingAttendanceSummary = ref({
  present: 0,
  absent: 0,
  late: 0
})

const editingStudent = ref({
  id: '',
  name: '',
  identification: '',
  status: '',
  remarks: '',
  updated_at: null as string | null
})

const originalEditState = ref({
  status: '',
  remarks: ''
})

// Add this with other refs
const loadingClasses = ref(false)

// Computed properties
const today = computed(() => new Date().toISOString().slice(0, 10))
const selectedClassName = computed(() => {
  const selectedClass = teacherClasses.value.find(c => c.class_id === selectedClassId.value)
  return selectedClass?.class_name || ''
})

const absentCount = computed(() => {
  return todayAttendance.value.filter(record => record.status === 'absent').length
})

const presentCount = computed(() => {
  return todayAttendance.value.filter(record => record.status === 'present').length
})

const lateCount = computed(() => {
  return todayAttendance.value.filter(record => record.status === 'late').length
})

const isAdmin = computed(() => {
  const role = authStore.userRole?.role?.toLowerCase() || ''
  return role === 'admin' || role === 'superadmin'
})

const hasAttendanceChanged = computed(() => {
  return editingStudent.value.status !== originalEditState.value.status ||
         editingStudent.value.remarks !== originalEditState.value.remarks
})

// Update the interfaces to correctly match Supabase response structure
interface AttendanceRecord {
  id: string
  student_id: string
  class_id: bigint
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  remarks: string | null
  created_at: string
  updated_at: string
  school_id: string
  user_roles: {
    username: string
    identification: string
    class_id: bigint
  }
  classes: {
    class_name: string
  } | null
}

// A separate interface for the Supabase response format
interface AttendanceResponse {
  id: string
  student_id: string
  class_id: string
  date: string
  status: string
  remarks: string | null
  created_at: string
  updated_at: string | null
  teacher_name: string | null
  teacher_id: string
  user_roles: {
    username: string
    identification: string
    class_id: string
  }
  classes: {
    class_name: string
  } | null
}

// Update the interfaces at the top of the script section
interface TeacherRole {
  id: bigint
  class_id: bigint
  school_id: string
  username: string
}

interface Class {
  class_id: bigint
  class_name: string
}

interface Student {
  id: bigint
  username: string
  identification: string
  class_id: bigint
}

// Add these interfaces near the top of the script section
interface Assignment {
  id: string;
  title: string;
  description: string;
  class_id: number;
  teacher_id: number;
  due_date: string;
  total_points: number;
  status: string;
  school_id: string;
  assignment_questions?: AssignmentQuestion[];
  type?: 'mcq' | 'file';
  total_questions?: number;
}

interface AssignmentQuestion {
  id: string;
  question_text: string;
  points: number;
  question_order: number;
  question_options: QuestionOption[];
}

interface QuestionOption {
  id: string;
  option_text: string;
  is_correct: boolean;
  option_order: number;
}

// Helper functions
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getStatusBadgeClass = (status: string) => {
  return `badge ${status === 'present' ? 'bg-success' : 'bg-danger'}`
}

// Initialize modal and fetch data
onMounted(async () => {
  try {
    // Initialize modals
    const classSelectionModalElement = document.getElementById('classSelectionModal')
    if (classSelectionModalElement) {
      classSelectionModal = new bootstrap.Modal(classSelectionModalElement)
    }

    // Initialize other modals
    const attendanceModalElement = document.getElementById('takeAttendanceModal')
    if (attendanceModalElement) {
      attendanceModal = new bootstrap.Modal(attendanceModalElement)
    }
    
    const datePickerModalElement = document.getElementById('datePickerModal')
    if (datePickerModalElement) {
      datePickerModal = new bootstrap.Modal(datePickerModalElement)
    }

    const attendanceExistsModalElement = document.getElementById('attendanceExistsModal')
    if (attendanceExistsModalElement) {
      attendanceExistsModal = new bootstrap.Modal(attendanceExistsModalElement)
    }

    const editAttendanceModalElement = document.getElementById('editAttendanceModal')
    if (editAttendanceModalElement) {
      editAttendanceModal = new bootstrap.Modal(editAttendanceModalElement)
    }

    // Initialize create assignment modal
    const createAssignmentModalElement = document.getElementById('createAssignmentModal')
    if (createAssignmentModalElement) {
      createAssignmentModal = new bootstrap.Modal(createAssignmentModalElement)
    }

    // For superadmin, check if a school is already selected
    if (isSuperAdmin.value && !authStore.getSelectedSchoolId) {
      isPageReady.value = true // Show the school selector
      loading.value = false
    } else {
      // For other roles or if superadmin has school selected
      await fetchTeacherClasses()
      
      // Show class selection for admin/superadmin or show page directly for teachers
      if (shouldShowClassSelection.value && !selectedClassId.value) {
        classSelectionModal?.show()
      } else {
        isPageReady.value = true
        await fetchAttendanceRecords()
      }
      loading.value = false
    }

    // Fetch available classes
    await fetchAvailableClasses()
  } catch (error) {
    console.error('Error in initialization:', error)
    loading.value = false
  }
})

// Fetch teacher's classes
const fetchTeacherClasses = async () => {
  loadingClasses.value = true
  try {
    // Get the user's role and school_id
    const { data: userData, error: userError } = await supabase
      .from('user_roles')
      .select('role, school_id, class_id')
      .eq('id', authStore.userRole?.id)
      .single()

    if (userError) throw userError

    // For superadmin, use the selected school ID from auth store
    const effectiveSchoolId = isSuperAdmin.value 
      ? authStore.getSelectedSchoolId 
      : userData.school_id

    if (!effectiveSchoolId) {
      if (!isSuperAdmin.value) {
        toast.error('No school assigned')
      }
      return
    }

    console.log('Fetching classes for school:', effectiveSchoolId)

    // Handle differently based on role
    if (userData.role.toLowerCase() === 'admin' || userData.role.toLowerCase() === 'superadmin') {
      // For admin/superadmin, fetch all classes in their school
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('class_id, class_name')
        .eq('school_id', effectiveSchoolId)
        .order('class_name', { ascending: true })

      if (classError) throw classError

      if (!classData || classData.length === 0) {
        toast.info('No classes found in this school')
        return
      }

      teacherClasses.value = classData
      if (!selectedClassId.value) {
        selectedClassId.value = classData[0].class_id // Select first class by default
      }
      
      // Now fetch the students for the selected class
      await fetchClassStudents(effectiveSchoolId)
    } else {
      // For teachers, fetch their assigned class
      if (!userData?.class_id) {
        toast.error('No class assigned to this teacher')
        return
      }

      // Get the class details
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('class_id, class_name')
        .eq('class_id', userData.class_id)
        .single()

      if (classError) throw classError

      if (!classData) {
        toast.error('Class not found')
        return
      }

      teacherClasses.value = [classData]
      selectedClassId.value = classData.class_id
      
      // Now fetch the students for this class
      await fetchClassStudents(effectiveSchoolId)
    }
  } catch (error) {
    console.error('Error fetching class details:', error)
    toast.error('Failed to fetch class details')
  } finally {
    loadingClasses.value = false
  }
}

// Fetch students for selected class
const fetchClassStudents = async (schoolId: string) => {
  if (!selectedClassId.value || !schoolId) return

  loadingStudents.value = true
  try {
    console.log('Fetching students for class:', selectedClassId.value, 'in school:', schoolId)

    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        username,
        identification
      `)
      .eq('role', 'student')
      .eq('class_id', selectedClassId.value)
      .eq('school_id', schoolId)

    if (error) throw error

    classStudents.value = data?.map(student => ({
      id: student.id,
      name: student.username,
      identification: student.identification
    })) || []
    
    totalStudents.value = classStudents.value.length
    
    // Initialize attendance for each student
    classStudents.value.forEach(student => {
      studentAttendance.value[student.identification] = 'present'
    })

    if (classStudents.value.length === 0) {
      toast.info('No students found in this class')
    }
  } catch (error) {
    console.error('Error fetching students:', error)
    toast.error('Failed to fetch students')
  } finally {
    loadingStudents.value = false
  }
}

// Fetch today's attendance
const fetchAttendanceRecords = async () => {
  try {
    // Get user data for role check
    const { data: userData, error: userError } = await supabase
      .from('user_roles')
      .select('role, school_id, class_id')
      .eq('id', authStore.userRole?.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      toast.error('Failed to fetch user information')
      return
    }

    // For superadmin, use the selected school ID from auth store
    const effectiveSchoolId = isSuperAdmin.value 
      ? authStore.getSelectedSchoolId 
      : userData.school_id

    if (!effectiveSchoolId) {
      console.error('No school ID found')
      if (isSuperAdmin.value) {
        toast.info('Please select a school first')
      } else {
        toast.error('School information not found')
      }
      return
    }

    // Build the query
    let query = supabase
      .from('attendances')
      .select(`
        *,
        user_roles (
          username,
          identification,
          class_id
        ),
        classes (
          class_name
        )
      `)
      .eq('date', selectedDate.value)
      .eq('school_id', effectiveSchoolId)

    // Determine which class ID to use based on role
    const classIdToUse = userData.role.toLowerCase() === 'admin' || userData.role.toLowerCase() === 'superadmin'
      ? selectedClassId.value
      : userData.class_id

    if (!classIdToUse) {
      console.error('No class ID available')
      toast.error('Please select a class first')
      return
    }

    // Add class filter
    query = query.eq('class_id', classIdToUse)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching attendance:', error)
      toast.error('Failed to fetch attendance records')
      return
    }

    const attendanceRecords = (data as unknown) as AttendanceResponse[] || []
    
    console.log('Current user ID:', authStore.userRole?.id, 'Type:', typeof authStore.userRole?.id)
    
    todayAttendance.value = attendanceRecords.map(record => {
      const mappedRecord = {
        id: record.id,
        student_name: record.user_roles.username,
        identification: record.student_id,
        status: record.status,
        remarks: record.remarks,
        class_name: record.classes?.class_name || '',
        teacher_name: record.teacher_name || 'Unknown',
        teacher_id: String(record.teacher_id) // Ensure teacher_id is a string
      }
      console.log('Mapped record teacher_id:', mappedRecord.teacher_id, 'Type:', typeof mappedRecord.teacher_id)
      return mappedRecord
    })

  } catch (error) {
    console.error('Error fetching attendance:', error)
    toast.error('Failed to fetch attendance records')
  }
}

// Quick actions
const markAllPresent = () => {
  classStudents.value.forEach(student => {
    studentAttendance.value[student.identification] = 'present'
  })
}

const markAllAbsent = () => {
  classStudents.value.forEach(student => {
    studentAttendance.value[student.identification] = 'absent'
  })
}

// Update the openTakeAttendanceModal function
const openTakeAttendanceModal = async () => {
  try {
    // Set attendance date to selected date
    attendanceDate.value = selectedDate.value

    const { data: userData, error: userError } = await supabase
      .from('user_roles')
      .select('role, school_id, class_id')
      .eq('id', authStore.userRole?.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      toast.error('Failed to fetch user information')
      return
    }

    // For superadmin, use the selected school ID from auth store
    const effectiveSchoolId = isSuperAdmin.value 
      ? authStore.getSelectedSchoolId 
      : userData.school_id

    if (!effectiveSchoolId) {
      console.error('No school ID found')
      if (isSuperAdmin.value) {
        toast.info('Please select a school first')
      } else {
        toast.error('School information not found')
      }
      return
    }

    // Determine which class ID to use based on role
    const classIdToUse = userData.role.toLowerCase() === 'admin' || userData.role.toLowerCase() === 'superadmin'
      ? selectedClassId.value
      : userData.class_id

    if (!classIdToUse) {
      console.error('No class ID available')
      toast.error('Please select a class first')
      return
    }

    // Check if attendance records exist for today
    const { data, error } = await supabase
      .from('attendances')
      .select('status')
      .eq('date', selectedDate.value)
      .eq('class_id', classIdToUse)
      .eq('school_id', effectiveSchoolId)

    if (error) {
      console.error('Error checking attendance:', error)
      toast.error('Failed to check attendance records')
      return
    }

    if (data && data.length > 0) {
      // Calculate summary
      existingAttendanceSummary.value = data.reduce((acc, record) => {
        const status = record.status.toLowerCase() as 'present' | 'absent' | 'late'
        if (status in acc) {
          acc[status]++
        }
        return acc
      }, { present: 0, absent: 0, late: 0 })

      // Show the warning modal
      if (!attendanceExistsModal) {
        const modalElement = document.getElementById('attendanceExistsModal')
        if (modalElement) {
          attendanceExistsModal = new bootstrap.Modal(modalElement)
        }
      }
      attendanceExistsModal?.show()
    } else {
      // No attendance yet, proceed with taking attendance
      showTakeAttendanceModal()
    }
  } catch (error) {
    console.error('Error checking attendance:', error)
    toast.error('Failed to check if attendance exists')
  }
}

const showTakeAttendanceModal = () => {
  const modalElement = document.getElementById('takeAttendanceModal')
  if (modalElement) {
    // First dispose of any existing modal instance to prevent duplicates
    bootstrap.Modal.getInstance(modalElement)?.dispose()
    
    // Create and store the modal instance
    attendanceModal = new bootstrap.Modal(modalElement, {
      backdrop: 'static',
      keyboard: false
    })
    
    // Reset form data
    resetForm()
    
    // Show the modal
    attendanceModal.show()
  }

}

const closeAttendanceExistsModal = () => {
  attendanceExistsModal?.hide()
}

// Save attendance
const saveAttendance = async () => {
  if (!selectedClassId.value) {
    toast.error('Please select a class')
    return
  }

  saving.value = true
  try {
    // Get the teacher's information
    const { data: userData, error: userError } = await supabase
      .from('user_roles')
      .select('school_id, username')
      .eq('id', authStore.userRole?.id)
      .single()

    if (userError) throw userError

    // For superadmin, use the selected school ID from auth store
    const effectiveSchoolId = isSuperAdmin.value 
      ? authStore.getSelectedSchoolId 
      : userData?.school_id

    if (!effectiveSchoolId) {
      if (isSuperAdmin.value) {
        throw new Error('Please select a school first')
      } else {
        throw new Error('No school assigned to this teacher')
      }
    }

    const attendanceRecords = classStudents.value.map(student => ({
      student_id: student.identification,
      class_id: selectedClassId.value,
      date: attendanceDate.value,
      status: studentAttendance.value[student.identification] || 'absent',
      remarks: studentRemarks.value[student.identification] || null,
      school_id: effectiveSchoolId,
      teacher_id: authStore.userRole?.id,
      teacher_name: userData.username
    }))

    const { error } = await supabase
      .from('attendances')
      .insert(attendanceRecords)

    if (error) throw error

    // Log activity
    await logActivity(
      'create',
      'attendances',
      selectedClassId.value.toString(),
      null,
      { date: attendanceDate.value, records: attendanceRecords.length }
    )

    toast.success('Attendance saved successfully')
    attendanceModal?.hide()

    // Refresh attendance data
    await fetchAttendanceRecords()

    // Reset form
    studentAttendance.value = {}
    studentRemarks.value = {}
    attendanceDate.value = new Date().toISOString().slice(0, 10)
  } catch (error) {
    console.error('Error saving attendance:', error)
    toast.error(error instanceof Error ? error.message : 'Failed to save attendance')
  } finally {
    saving.value = false
  }
}

// Edit attendance
const editAttendance = async (record: any) => {
  try {
    // Initialize modal if not already done
    if (!editAttendanceModal) {
      const modalElement = document.getElementById('editAttendanceModal')
      if (modalElement) {
        editAttendanceModal = new bootstrap.Modal(modalElement)
      }
    }

    // Set editing student data
    editingStudent.value = {
      id: record.id,
      name: record.student_name,
      identification: record.identification,
      status: record.status,
      remarks: record.remarks || '',
      updated_at: record.updated_at
    }

    // Store original state for comparison
    originalEditState.value = {
      status: record.status,
      remarks: record.remarks || ''
    }

    // Show modal
    editAttendanceModal?.show()
  } catch (error) {
    console.error('Error preparing attendance edit:', error)
    toast.error('Failed to prepare attendance edit')
  }
}

// Delete attendance
const deleteAttendance = async (id: string) => {
  promptModalData.value = {
    title: 'Delete Attendance Record',
    message: 'Are you sure you want to delete this attendance record? This action cannot be undone.',
    itemToDelete: id
  }
  
  nextTick(() => {
    promptModalRef.value?.show()
  })
}

// Update the watch function to handle null school_id
watch(selectedClassId, async () => {
  // Get the teacher's school_id
  const { data: teacherData } = await supabase
    .from('user_roles')
    .select('school_id')
    .eq('id', authStore.userRole?.id)
    .single()

  if (teacherData?.school_id) {
    await fetchClassStudents(teacherData.school_id)
  }
})

// Add this method to handle modal closing
const handleModalClose = () => {
  if (hasUnsavedChanges.value) {
    if (confirm('You have unsaved changes. Are you sure you want to close?')) {
      attendanceModal?.hide()
      resetForm()
    }
  } else {
    attendanceModal?.hide()
    resetForm()
  }
}

// Add reset form method
const resetForm = () => {
  studentAttendance.value = {}
  studentRemarks.value = {}
  hasUnsavedChanges.value = false
}

// Add a watch to track changes
watch([studentAttendance, studentRemarks], () => {
  hasUnsavedChanges.value = true
}, { deep: true })

// Update the closeModal function to ensure it handles errors
const closeModal = () => {
  try {
    if (attendanceModal) {
      attendanceModal.hide()
      resetForm()
    } else {
      // If modal reference is missing, try to get it again
      const modalElement = document.getElementById('takeAttendanceModal')
      if (modalElement) {
        const bootstrapModalInstance = bootstrap.Modal.getOrCreateInstance(modalElement)
        bootstrapModalInstance.hide()
      }
      resetForm()
    }
  } catch (error) {
    console.error('Error closing modal:', error)
    // Try alternative method to close the modal
    const modalElement = document.getElementById('takeAttendanceModal')
    if (modalElement) {
      const bootstrapModalInstance = bootstrap.Modal.getOrCreateInstance(modalElement)
      bootstrapModalInstance.hide()
    }
    resetForm()
  }
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

const resetToToday = () => {
  selectedDate.value = today.value
  fetchAttendanceRecords()
}

const openDatePickerModal = () => {
  // Initialize the date picker modal if not already done
  if (!datePickerModal) {
    const modalElement = document.getElementById('datePickerModal')
    if (modalElement) {
      datePickerModal = new bootstrap.Modal(modalElement)
    }
  }
  
  // Set the temporary date to the current selected date
  tempSelectedDate.value = selectedDate.value
  
  // Show the modal
  datePickerModal?.show()
}

// Add function to apply the date selection
const applyDateSelection = () => {
  if (tempSelectedDate.value) {
    selectedDate.value = tempSelectedDate.value
    fetchAttendanceRecords()
    datePickerModal?.hide()
  }
}

const formatDateFull = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

const getYesterday = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().slice(0, 10)
}

const setTempDateToToday = () => {
  tempSelectedDate.value = today.value
}

const setTempDateToYesterday = () => {
  tempSelectedDate.value = getYesterday()
}

const closeDatePickerModal = () => {
  datePickerModal?.hide()
}

const hasDateChanges = () => {
  return tempSelectedDate.value !== selectedDate.value
}

const dateInput = ref<HTMLInputElement | null>(null)

const focusDateInput = () => {
  dateInput.value?.click()
}

const formatDateSegment = (dateString: string, segment: 'month' | 'day' | 'year' | 'weekday') => {
  const date = new Date(dateString)
  switch (segment) {
    case 'month':
      return date.toLocaleString('en-US', { month: 'long' })
    case 'day':
      return date.getDate()
    case 'year':
      return date.getFullYear()
    case 'weekday':
      return date.toLocaleString('en-US', { weekday: 'long' })
    default:
      return ''
  }
}

const navigateDate = (days: number) => {
  const currentDate = new Date(tempSelectedDate.value || today.value)
  currentDate.setDate(currentDate.getDate() + days)
  
  // Don't allow future dates
  if (currentDate <= new Date(today.value)) {
    tempSelectedDate.value = currentDate.toISOString().slice(0, 10)
  }
}

const isYesterdayDisabled = computed(() => {
  return false // You can add logic here if needed
})

const isTomorrowDisabled = computed(() => {
  if (!tempSelectedDate.value) return true
  const nextDay = new Date(tempSelectedDate.value)
  nextDay.setDate(nextDay.getDate() + 1)
  return nextDay > new Date(today.value)
})

const formatDateModern = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })
}

const closeEditModal = () => {
  if (hasAttendanceChanged.value) {
    if (confirm('Are you sure you want to discard your changes?')) {
      editAttendanceModal?.hide()
    }
  } else {
    editAttendanceModal?.hide()
  }
}

const saveAttendanceEdit = async () => {
  try {
    const { error } = await supabase
      .from('attendances')
      .update({
        status: editingStudent.value.status,
        remarks: editingStudent.value.remarks,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingStudent.value.id)

    if (error) throw error

    // Log the activity
    await logActivity(
      'update',
      'attendances',
      editingStudent.value.id,
      {
        status: originalEditState.value.status,
        remarks: originalEditState.value.remarks
      },
      {
        status: editingStudent.value.status,
        remarks: editingStudent.value.remarks
      }
    )

    toast.success('Attendance updated successfully')
    editAttendanceModal?.hide()
    
    // Refresh attendance records
    await fetchAttendanceRecords()
  } catch (error) {
    console.error('Error updating attendance:', error)
    toast.error('Failed to update attendance')
  }
}

const handleClassChange = async () => {
  if (selectedClassId.value) {
    const { data: userData } = await supabase
      .from('user_roles')
      .select('school_id')
      .eq('id', authStore.userRole?.id)
      .single()

    if (userData?.school_id) {
      await fetchClassStudents(userData.school_id)
      await fetchAttendanceRecords()
    }
  }
}

// Add these refs
const isPageReady = ref(false)
let classSelectionModal: bootstrap.Modal | null = null

// Add this computed property
const shouldShowClassSelection = computed(() => {
  const role = authStore.userRole?.role?.toLowerCase() || ''
  return role === 'admin' || role === 'superadmin'
})

// Add this function
const proceedToTeacherView = async () => {
  if (selectedClassId.value) {
    const schoolId = isSuperAdmin.value ? authStore.getSelectedSchoolId : authStore.userRole?.school_id
    if (!schoolId) {
      toast.error('No school selected')
      return
    }
    
    classSelectionModal?.hide()
    isPageReady.value = true
    await fetchClassStudents(schoolId)
    await fetchAttendanceRecords()
  }
}

// Add the computed property for isSuperAdmin
const isSuperAdmin = computed(() => {
  return authStore.userRole?.role?.toLowerCase() === 'superadmin'
})

// Add the handleSchoolChange function
const handleSchoolChange = async (schoolId: string) => {
  console.log('School changed to:', schoolId)
  
  // Reset class selection
  selectedClassId.value = ''
  teacherClasses.value = []
  
  if (schoolId) {
    try {
      // Update the auth store with the selected school ID
      await authStore.setSelectedSchoolId(schoolId)
      
      // Fetch classes for the selected school
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('class_id, class_name')
        .eq('school_id', schoolId)
        .order('class_name', { ascending: true })

      if (classError) throw classError

      if (!classData || classData.length === 0) {
        toast.info('No classes found in this school')
        return
      }

      teacherClasses.value = classData
      console.log('Classes loaded:', teacherClasses.value)
      
      // Reset attendance data
      todayAttendance.value = []
      classStudents.value = []
      
    } catch (error) {
      console.error('Error fetching classes:', error)
      toast.error('Failed to load classes')
    }
  }
}

// Add the openClassSelectionModal function
const openClassSelectionModal = () => {
  if (classSelectionModal) {
    classSelectionModal.show()
  }
}

// New refs for promotion functionality
const selectedStudents = ref<number[]>([])
const selectAllStudents = ref(false)
const studentPromotions = ref<{ [key: number]: number }>({})
const availableClasses = ref<any[]>([])

// Computed property for button state
const hasSelectedStudents = computed(() => selectedStudents.value.length > 0)

// Methods for promotion functionality
const toggleAllStudents = () => {
  if (selectAllStudents.value) {
    selectedStudents.value = classStudents.value.map(student => student.id)
  } else {
    selectedStudents.value = []
  }
}

const fetchAvailableClasses = async () => {
  try {
    const schoolId = isSuperAdmin.value 
      ? authStore.getSelectedSchoolId 
      : authStore.userRole?.school_id

    if (!schoolId) return

    const { data, error } = await supabase
      .from('classes')
      .select('class_id, class_name')
      .eq('school_id', schoolId)
      .order('class_name', { ascending: true })

    if (error) throw error

    // Filter out the current class
    availableClasses.value = data?.filter(cls => cls.class_id !== selectedClassId.value) || []
  } catch (error) {
    console.error('Error fetching available classes:', error)
    toast.error('Failed to fetch available classes')
  }
}

const promoteSelectedStudents = async () => {
  try {
    const updates = selectedStudents.value
      .filter(studentId => studentPromotions.value[studentId])
      .map(studentId => ({
        id: studentId,
        class_id: studentPromotions.value[studentId]
      }))

    if (updates.length === 0) {
      toast.warning('Please select students and their target classes')
      return
    }

    const { error } = await supabase
      .from('user_roles')
      .upsert(updates)

    if (error) throw error

    // Log the activity
    await logActivity(
      'update',
      'user_roles',
      'bulk',
      null,
      { promoted_students: updates.length }
    )

    toast.success('Students promoted successfully')
    
    // Reset selections
    selectedStudents.value = []
    selectAllStudents.value = false
    studentPromotions.value = {}
    
    // Refresh student list and other data
    const schoolId = isSuperAdmin.value ? authStore.getSelectedSchoolId : authStore.userRole?.school_id
    if (schoolId) {
      await Promise.all([
        fetchClassStudents(schoolId),
        fetchAttendanceRecords(),
        fetchAvailableClasses()
      ])
    }

    // Update analytics
    totalStudents.value = classStudents.value.length
  } catch (error) {
    console.error('Error promoting students:', error)
    toast.error('Failed to promote students')
  }
}

// Add loading state
const loading = ref(true)

// Add these refs for assignment functionality
let createAssignmentModal: bootstrap.Modal | null = null
const newAssignment = ref({
  title: '',
  subject: '',
  description: '',
  due_date: '',
  max_score: 100,
  class_id: '',
  school_id: '',
  type: '',
  has_timer: false,
  time_limit: null as number | null,
  questions: [] as Array<{
    text: string;
    points: number;
    options: Array<{ text: string }>;
    correctOption: number;
  }>
})
const savingAssignment = ref(false)

// Add computed property for form validation
const isAssignmentFormValid = computed(() => {
  const baseValidation = newAssignment.value.title &&
    newAssignment.value.subject &&
    newAssignment.value.description &&
    newAssignment.value.due_date &&
    newAssignment.value.type

  if (newAssignment.value.type === 'mcq') {
    // Validate MCQ specific fields
    return baseValidation && newAssignment.value.questions.every(question => 
      question.text && // Question text is not empty
      question.points > 0 && // Points are positive
      question.options.every(opt => opt.text.trim() !== '') && // All options have text
      question.correctOption >= 0 && // Has a correct option selected
      question.correctOption < question.options.length // Correct option is valid
    )
  }

  // For file upload type
  return baseValidation && newAssignment.value.max_score > 0
})

// Add to your onMounted function
onMounted(async () => {
  // ... existing code ...

  // Initialize create assignment modal
  const createAssignmentModalElement = document.getElementById('createAssignmentModal')
  if (createAssignmentModalElement) {
    createAssignmentModal = new bootstrap.Modal(createAssignmentModalElement)
  }

  // Fetch assignments on mount
  await fetchAssignments()
})

// Add these functions for assignment management
const openCreateAssignmentModal = async () => {
  try {
    // Get user's role and school info
    const { data: userData, error: userError } = await supabase
      .from('user_roles')
      .select('role, school_id, class_id')
      .eq('id', authStore.userRole?.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      toast.error('Failed to fetch user information')
      return
    }

    // For superadmin, use the selected school ID from auth store
    const effectiveSchoolId = isSuperAdmin.value 
      ? authStore.getSelectedSchoolId 
      : userData.school_id

    if (!effectiveSchoolId) {
      toast.error('No school selected')
      return
    }

    // Determine which class ID to use based on role
    const classIdToUse = userData.role.toLowerCase() === 'admin' || userData.role.toLowerCase() === 'superadmin'
      ? selectedClassId.value
      : userData.class_id

    if (!classIdToUse) {
      toast.error('Please select a class first')
      return
    }

    // Reset form and set initial values
    newAssignment.value = {
      title: '',
      subject: '',
      description: '',
      due_date: '',
      max_score: 100,
      class_id: classIdToUse,
      school_id: effectiveSchoolId,
      type: 'mcq',
      has_timer: false,
      time_limit: null,
      questions: []
    }

    // Show modal
    createAssignmentModal?.show()
  } catch (error) {
    console.error('Error preparing assignment creation:', error)
    toast.error('Failed to prepare assignment creation')
  }
}

const closeCreateAssignmentModal = () => {
  currentStep.value = 1
  isEditing.value = false
  editingAssignmentId.value = ''
  originalAssignmentHadTimer.value = false
  createAssignmentModal?.hide()
}

const saveAssignment = async () => {
  if (!isAssignmentFormValid.value) {
    toast.error('Please fill in all required fields')
    return
  }

  savingAssignment.value = true
  try {
    // Calculate total points
    const totalPoints = newAssignment.value.type === 'mcq' 
      ? newAssignment.value.questions.reduce((sum, q) => sum + q.points, 0)
      : newAssignment.value.max_score

    const assignmentData = {
      title: newAssignment.value.title,
      subject: newAssignment.value.subject,
      description: newAssignment.value.description,
      class_id: newAssignment.value.class_id,
      teacher_id: authStore.userRole?.id,
      due_date: newAssignment.value.due_date,
      total_points: totalPoints,
      school_id: newAssignment.value.school_id,
      status: 'active',
      has_timer: newAssignment.value.has_timer,
      time_limit: newAssignment.value.has_timer ? newAssignment.value.time_limit : null
    }

    let assignmentId: string

    if (isEditing.value) {
      // Update existing assignment
      const { error: assignmentError } = await supabase
        .from('assignments')
        .update(assignmentData)
        .eq('id', editingAssignmentId.value)

      if (assignmentError) throw assignmentError
      assignmentId = editingAssignmentId.value
    } else {
      // Create new assignment
      const { data: newAssignmentData, error: assignmentError } = await supabase
        .from('assignments')
        .insert([assignmentData])
        .select()
        .single()

      if (assignmentError) throw assignmentError
      assignmentId = newAssignmentData.id
    }

    // Handle MCQ questions and options
    if (newAssignment.value.type === 'mcq') {
      if (isEditing.value) {
        // Get existing questions for this assignment
        const { data: existingQuestions, error: fetchError } = await supabase
          .from('assignment_questions')
          .select('id, question_text, points, question_order, question_options(id, option_text, is_correct, option_order)')
          .eq('assignment_id', assignmentId)

        if (fetchError) throw fetchError

        // Create a map of existing questions for comparison
        const existingQuestionsMap = new Map(
          existingQuestions?.map(q => [
            `${q.question_text}-${q.points}-${q.question_order}`,
            { ...q, options: q.question_options }
          ])
        )

        // Process each question
        for (const [qIndex, question] of newAssignment.value.questions.entries()) {
          const questionKey = `${question.text}-${question.points}-${qIndex + 1}`
          const existingQuestion = existingQuestionsMap.get(questionKey)

          let questionId: string

          if (existingQuestion) {
            // Question exists, update it if needed
            questionId = existingQuestion.id
            
            // Update question if points changed
            if (existingQuestion.points !== question.points) {
              await supabase
                .from('assignment_questions')
                .update({ points: question.points })
                .eq('id', questionId)
            }

            // Update options
            const existingOptions = existingQuestion.options || []
            const optionsToUpdate = question.options.map((opt, optIndex) => ({
              question_id: questionId,
              option_text: opt.text,
              is_correct: optIndex === question.correctOption,
              option_order: optIndex + 1
            }))

            // Delete old options and insert new ones
            if (existingOptions.length > 0) {
              await supabase
                .from('question_options')
                .delete()
                .eq('question_id', questionId)
            }

            await supabase
              .from('question_options')
              .insert(optionsToUpdate)

          } else {
            // Question doesn't exist, create it
            const { data: newQuestion, error: questionError } = await supabase
              .from('assignment_questions')
              .insert({
                assignment_id: assignmentId,
                question_text: question.text,
                points: question.points,
                question_order: qIndex + 1
              })
              .select()
              .single()

            if (questionError) throw questionError
            questionId = newQuestion.id

            // Insert new options
            const optionsToInsert = question.options.map((opt, optIndex) => ({
              question_id: questionId,
              option_text: opt.text,
              is_correct: optIndex === question.correctOption,
              option_order: optIndex + 1
            }))

            const { error: optionsError } = await supabase
              .from('question_options')
              .insert(optionsToInsert)

            if (optionsError) throw optionsError
          }

          existingQuestionsMap.delete(questionKey)
        }

        // Delete questions that no longer exist
        const questionsToDelete = Array.from(existingQuestionsMap.values()).map(q => q.id)
        if (questionsToDelete.length > 0) {
          await supabase
            .from('assignment_questions')
            .delete()
            .in('id', questionsToDelete)
        }
      } else {
        // Create new questions and options for new assignment
        for (const [qIndex, question] of newAssignment.value.questions.entries()) {
          const { data: questionData, error: questionError } = await supabase
            .from('assignment_questions')
            .insert({
              assignment_id: assignmentId,
              question_text: question.text,
              points: question.points,
              question_order: qIndex + 1
            })
            .select()
            .single()

          if (questionError) throw questionError

          const optionsToInsert = question.options.map((opt, optIndex) => ({
            question_id: questionData.id,
            option_text: opt.text,
            is_correct: optIndex === question.correctOption,
            option_order: optIndex + 1
          }))

          const { error: optionsError } = await supabase
            .from('question_options')
            .insert(optionsToInsert)

          if (optionsError) throw optionsError
        }
      }
    }

    // Log the activity
    await logActivity(
      isEditing.value ? 'update' : 'create',
      'assignments',
      assignmentId,
      null,
      {
        title: newAssignment.value.title,
        type: newAssignment.value.type
      }
    )

    toast.success(`Assignment ${isEditing.value ? 'updated' : 'created'} successfully`)
    closeCreateAssignmentModal()
    await fetchAssignments()
  } catch (error) {
    console.error(`Error ${isEditing.value ? 'updating' : 'creating'} assignment:`, error)
    toast.error(`Failed to ${isEditing.value ? 'update' : 'create'} assignment`)
  } finally {
    savingAssignment.value = false
    isEditing.value = false
    editingAssignmentId.value = ''
  }
}

// Update fetchAssignments to include questions and options
const fetchAssignments = async () => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('user_roles')
      .select('role, school_id, class_id')
      .eq('id', authStore.userRole?.id)
      .single()

    if (userError) throw userError

    const effectiveSchoolId = isSuperAdmin.value 
      ? authStore.getSelectedSchoolId 
      : userData.school_id

    if (!effectiveSchoolId) return

    const classIdToUse = userData.role.toLowerCase() === 'admin' || userData.role.toLowerCase() === 'superadmin'
      ? selectedClassId.value
      : userData.class_id

    if (!classIdToUse) return

    // Fetch assignments with their questions and options
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        teacher:teacher_id (
          username
        ),
        assignment_questions (
          id,
          question_text,
          points,
          question_order,
          question_options (
            id,
            option_text,
            is_correct,
            option_order
          )
        ),
        assignment_status (
          id,
          student_id,
          status
        )
      `)
      .eq('class_id', classIdToUse)
      .eq('school_id', effectiveSchoolId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Process the assignments to include type and submission info
    interface AssignmentStatus {
      id: string;
      student_id: string;
      status: 'pending' | 'completed';
    }

    // Process the assignments to include type and submission info
    assignments.value = data?.map(assignment => {
      // Count completed submissions, handle null assignment_status
      const statuses = assignment.assignment_status || [];
      const completedSubmissions = statuses.filter(
        (status: AssignmentStatus) => status.status === 'completed'
      ).length;

      return {
        ...assignment,
        type: assignment.assignment_questions?.length > 0 ? 'mcq' : 'file',
        total_questions: assignment.assignment_questions?.length || 0,
        total_points: assignment.total_points || 0,
        submission_count: completedSubmissions
      };
    }) || [];

  } catch (error) {
    console.error('Error fetching assignments:', error)
    toast.error('Failed to fetch assignments')
  }
}

// Add computed property for assignment type display
const getAssignmentTypeDisplay = (assignment: Assignment): string => {
  return assignment.type === 'mcq' 
    ? `MCQ (${assignment.total_questions} questions, ${assignment.total_points} points)`
    : 'File Upload'
}

// Add this ref for assignments list
const assignments = ref<any[]>([])

// Add these functions for assignment management
const deleteAssignment = async (id: string) => {
  try {
    // First check if the current user is the assignment creator
    const { data: assignment, error: fetchError } = await supabase
      .from('assignments')
      .select('teacher_id')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    if (assignment?.teacher_id !== authStore.userRole?.id) {
      toast.error('You can only delete assignments that you created')
      return
    }

    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Log activity
    await logActivity(
      'delete',
      'assignments',
      id,
      null,
      null
    )

    toast.success('Assignment deleted successfully')
    await fetchAssignments()
  } catch (error) {
    console.error('Error deleting assignment:', error)
    toast.error('Failed to delete assignment')
  }
}

const editAssignment = async (assignment: any) => {
  try {
    // Check if the current user is the assignment creator
    if (assignment.teacher_id !== authStore.userRole?.id) {
      toast.error('You can only edit assignments that you created')
      return
    }

    editingAssignmentId.value = assignment.id
    isEditing.value = true
    originalAssignmentHadTimer.value = assignment.has_timer || false

    // Pre-fill the form with existing assignment data
    newAssignment.value = {
      title: assignment.title,
      subject: assignment.subject,
      description: assignment.description,
      due_date: new Date(assignment.due_date).toISOString().split('T')[0], // Format the date properly
      max_score: assignment.total_points,
      class_id: assignment.class_id,
      school_id: assignment.school_id,
      type: assignment.type,
      has_timer: assignment.has_timer || false,
      time_limit: assignment.time_limit || null,
      questions: assignment.assignment_questions?.map((q: any) => ({
        text: q.question_text,
        points: q.points,
        options: q.question_options.map((opt: any) => ({
          text: opt.option_text
        })),
        correctOption: q.question_options.findIndex((opt: any) => opt.is_correct)
      })) || []
    }

    // Reset step to 1 and show modal
    currentStep.value = 1
    createAssignmentModal?.show()
  } catch (error) {
    console.error('Error preparing assignment edit:', error)
    toast.error('Failed to prepare assignment edit')
  }
}

// Add this watch to fetch assignments when class changes
watch(selectedClassId, async () => {
  await fetchAssignments()
})

const addQuestion = () => {
  newAssignment.value.questions.push({
    text: '',
    points: 1,
    options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
    correctOption: 0
  })
}

const removeQuestion = (index: number) => {
  newAssignment.value.questions.splice(index, 1)
}

const addOption = (index: number) => {
  newAssignment.value.questions[index].options.push({ text: '' })
}

const removeOption = (index: number, optIndex: number) => {
  newAssignment.value.questions[index].options.splice(optIndex, 1)
}

// Add this to the script section
const mcqSection = ref<HTMLElement | null>(null)

const handleAssignmentTypeChange = () => {
  if (newAssignment.value.type === 'mcq') {
    // Wait for the MCQ section to be rendered
    nextTick(() => {
      if (mcqSection.value) {
        const formSection = mcqSection.value.closest('.form-section')
        if (formSection) {
          formSection.scrollTo({
            top: mcqSection.value.offsetTop - 20,
            behavior: 'smooth'
          })
        }
      }
    })
  }
}

// Add these refs and computed properties
const currentStep = ref(1)

// Add this computed property
const isBasicDetailsValid = computed(() => {
  const baseValidation = newAssignment.value.title &&
    newAssignment.value.subject &&
    newAssignment.value.description &&
    newAssignment.value.due_date &&
    newAssignment.value.type

  // Add timer validation
  if (newAssignment.value.has_timer) {
    return baseValidation && 
      typeof newAssignment.value.time_limit === 'number' && 
      newAssignment.value.time_limit > 0
  }

  return baseValidation
})

// Add this method
const goToQuestions = () => {
  if (isBasicDetailsValid.value) {
    currentStep.value = 2
  }
}

// Add these refs for editing assignments
const editingAssignmentId = ref('')
const isEditing = ref(false)
const originalAssignmentHadTimer = ref(false)

// Add these refs for the prompt modal
const promptModalRef = ref<InstanceType<typeof PromptModal> | null>(null)
const promptModalData = ref({
  title: '',
  message: '',
  itemToDelete: null as string | null
})

// Add a new function to handle the actual deletion
const confirmDeleteAssignment = async () => {
  if (!promptModalData.value.itemToDelete) return
  
  try {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', promptModalData.value.itemToDelete)

    if (error) throw error

    // Log activity
    await logActivity(
      'delete',
      'assignments',
      promptModalData.value.itemToDelete,
      null,
      null
    )

    toast.success('Assignment deleted successfully')
    await fetchAssignments()
  } catch (error) {
    console.error('Error deleting assignment:', error)
    toast.error('Failed to delete assignment')
  }
}

// Add a new function to handle the actual attendance deletion
const confirmDeleteAttendance = async () => {
  if (!promptModalData.value.itemToDelete) return
  
  try {
    const { error } = await supabase
      .from('attendances')
      .delete()
      .eq('id', promptModalData.value.itemToDelete)

    if (error) throw error

    toast.success('Attendance record deleted')
    await fetchAttendanceRecords()
  } catch (error) {
    console.error('Error deleting attendance:', error)
    toast.error('Failed to delete attendance record')
  }
}

// Add a generic handler for the prompt modal confirmation
const handlePromptConfirm = async () => {
  const title = promptModalData.value.title
  
  if (title === 'Delete Assignment') {
    await confirmDeleteAssignment()
  } else if (title === 'Delete Attendance Record') {
    await confirmDeleteAttendance()
  }
}

// Add this in the script section after other computed properties
const shouldShowLockIcon = computed(() => (record: any) => {
  console.log('Lock icon - Record teacher ID:', record.teacher_id)
  console.log('Lock icon - Current user ID:', authStore.userRole?.id)
  return record.teacher_id !== authStore.userRole?.id
})

// Add these computed properties after other computed properties
const shouldShowEditButton = computed(() => (record: any) => {
  console.log('Edit button - Record teacher ID:', record.teacher_id)
  console.log('Edit button - Current user ID:', authStore.userRole?.id)
  return record.teacher_id === authStore.userRole?.id
})

// Add this computed property after other computed properties
const isAllStudentsMarked = computed(() => {
  return classStudents.value.every(student => 
    studentAttendance.value[student.identification] !== undefined
  )
})

// Add in script section after other refs
const activeTab = ref('attendance')

// Add these functions after other functions
const setActiveTab = (tab: string) => {
  activeTab.value = tab
  window.location.hash = tab
}

const initializeTab = () => {
  // Get tab from URL hash or default to 'attendance'
  const hash = window.location.hash.replace('#', '')
  if (['attendance', 'assignments', 'promote'].includes(hash)) {
    activeTab.value = hash
  } else {
    activeTab.value = 'attendance'
  }
}

// Add to onMounted
onMounted(() => {
  // Initialize tab from URL
  initializeTab()

  // Listen for hash changes
  window.addEventListener('hashchange', initializeTab)
})

// Add cleanup in onUnmounted
onUnmounted(() => {
  window.removeEventListener('hashchange', initializeTab)
})

const openClassScheduleModal = () => {
  router.push({ name: 'ClassSchedule' })
}

</script>

<style lang="scss" scoped>
// Modern Color Palette
$primary: #10b981;
$primary-light: #d1fae5;
$primary-dark: #059669;
$success: #10b981;
$success-light: #d1fae5;
$danger: #ef4444;
$danger-light: #fee2e2;
$warning: #f59e0b;
$warning-light: #fef3c7;
$info: #3b82f6;
$info-light: #dbeafe;
$dark: #1f2937;
$gray: #6b7280;
$light-gray: #e5e7eb;
$background: #f9fafb;
$white: #ffffff;

// Reset and Base Styles
.teachers-view {
  background-color: $background;
  min-height: 100vh;
}

// Reduce spacing in cards
.header-card, .content-card, .analytics-card {
  padding: 1.25rem;
}

// Reduce table padding
.custom-table {
  th {
    padding: 0.875rem 1.25rem;
  }
  
  td {
    padding: 0.875rem 1.25rem;
  }
}

// Make modal more compact
.modal-dialog.modal-xl {
  max-width: 1000px;
}

// Reduce padding in modal sections
.modal-header, .modal-footer, .attendance-header {
  padding: 1rem 1.25rem;
}

.attendance-list {
  padding: 1rem 1.25rem;
}

// Smaller avatar size
.avatar-circle, .student-attendance-row .avatar {
  width: 36px;
  height: 36px;
  min-width: 36px;
}

// More compact attendance row
.student-attendance-row {
  padding: 0.875rem;
  margin-bottom: 0.625rem;
}

// Modern Card Styles
.header-card {
  background-color: $white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;

  h2 {
    font-weight: 600;
    color: $dark;
    font-size: 1.5rem;
  }

  p {
    color: $gray;
  }
}

// Analytics Cards
.analytics-card {
  background-color: $white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;

  .analytics-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    i {
      font-size: 1.25rem;
      color: $white;
    }

    &.students {
      background-color: $primary;
    }

    &.present {
      background-color: $success;
    }

    &.absent {
      background-color: $danger;
    }

    &.late {
      background-color: $warning;
    }
  }
  
  .analytics-data {
    h4 {
      font-weight: 600;
      font-size: 1.5rem;
      margin-bottom: 0.25rem;
      color: $dark;
    }

    p {
      margin-bottom: 0;
      color: $gray;
      font-size: 0.875rem;
}
  }
}

// Content Tabs
.content-tabs {
  margin-bottom: 1.5rem;

  .nav-pills {
    background-color: $white;
    padding: 0.5rem;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    
    .nav-link {
      color: $gray;
      border-radius: 8px;
      padding: 0.75rem 1.25rem;
  font-weight: 500;
      transition: all 0.15s ease;
      margin-right: 0.5rem;

      &.active {
        background-color: $primary;
        color: $white;
      }

      &:not(.active):hover {
        background-color: $light-gray;
      }
    }
  }
}

// Content Cards
.content-card {
  background-color: $white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .card-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid $light-gray;
    background-color: $white;

    h5 {
      font-weight: 600;
      color: $dark;
      margin-bottom: 0;
    }
  }
}

// Custom Table
.custom-table {
  margin-bottom: 0;

  th {
    background-color: $white;
    font-weight: 600;
    color: $dark;
    font-size: 0.875rem;
  padding: 1rem 1.5rem;
    border-bottom: 1px solid $light-gray;
  }

  td {
    padding: 1rem 1.5rem;
    vertical-align: middle;
    border-bottom: 1px solid $light-gray;
    color: $dark;

    h6 {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.125rem;
    }

    small {
      font-size: 0.75rem;
      color: $gray;
    }
  }

  tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.01);
}

.avatar-circle {
  width: 40px;
  height: 40px;
    min-width: 40px;
    border-radius: 10px;
    background: $primary;
    color: $white;
  display: flex;
  align-items: center;
  justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
  }
}

// Status Badges
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  
  &.present {
    background-color: $success-light;
    color: darken($success, 15%);
  }
  
  &.absent {
    background-color: $danger-light;
    color: darken($danger, 15%);
  }
  
  &.late {
    background-color: $warning-light;
    color: darken($warning, 15%);
}

  &.excused {
    background-color: $info-light;
    color: darken($info, 15%);
  }
  
  &.pending {
    background-color: $warning-light;
    color: darken($warning, 15%);
  }
}

// Action Buttons
.actions {
  display: flex;
  gap: 0.5rem;

  .action-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    
    i {
      font-size: 0.875rem;
    }
    
    &.edit {
      color: $info;
      background-color: $info-light;
    }
    
    &.delete {
      color: $danger;
      background-color: $danger-light;
    }
  }
}

// Empty State
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  
  i {
    font-size: 3rem;
    color: $primary;
    margin-bottom: 1.5rem;
    opacity: 0.8;
    filter: drop-shadow(0 4px 6px rgba($primary, 0.2));
  }
  
  h4 {
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: $dark;
    font-size: 1.5rem;
  }
  
  p {
    color: $gray;
    max-width: 400px;
    text-align: center;
    margin-bottom: 2rem;
    font-size: 1.1rem;
    line-height: 1.6;
  }

  .btn-primary {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 500;
    border-radius: 12px;
    background: linear-gradient(45deg, $primary, darken($primary, 10%));
    border: none;
    box-shadow: 0 4px 12px rgba($primary, 0.3);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &::before {
  content: '';
  position: absolute;
      top: 0;
  left: 0;
  width: 100%;
      height: 100%;
      background: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0.2)
      );
      transform: translateX(-100%) rotate(45deg);
      transition: transform 0.6s ease;
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba($primary, 0.4);
      background: linear-gradient(45deg, darken($primary, 5%), darken($primary, 15%));
      
      &::before {
        transform: translateX(100%) rotate(45deg);
      }
    }
    
    &:active {
      transform: translateY(1px);
      box-shadow: 0 2px 8px rgba($primary, 0.3);
    }
    
    i {
      font-size: 1rem;
      margin-right: 0.75rem;
      color: white;
      opacity: 1;
      filter: none;
      margin-bottom: 0;
      transition: transform 0.3s ease;
    }
    
    &:hover i {
      transform: translateX(3px);
    }
  }
}

// Bootstrap Overrides
.btn {
  font-weight: 500;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  
  &.btn-primary {
    background-color: $primary;
    border-color: $primary;
    
    &:hover, &:focus {
      background-color: $primary-dark;
      border-color: $primary-dark;
}
  }
  
  &.btn-outline-primary {
    border-color: $primary;
    color: $primary;
    
    &:hover, &:focus {
      background-color: $primary;
      color: $white;
    }
  }
}

// Modal Redesign
.modal-content {
  border-radius: 12px;
  border: none;
  overflow: hidden;
}

.modal-header {
  padding: 1.25rem;
  border-bottom: 1px solid $light-gray;
  
  .modal-title {
    font-weight: 600;
    color: $dark;
  }
}

.modal-footer {
  padding: 1.25rem;
  border-top: 1px solid $light-gray;
}

.attendance-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid $light-gray;
  
  .date-picker {
    max-width: 240px;
    
    .form-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: $gray;
      margin-bottom: 0.35rem;
    }
    
    .input-icon {
      position: relative;
      
      i {
        position: absolute;
        top: 50%;
        left: 0.75rem;
        transform: translateY(-50%);
        color: $gray;
      }
      
      input {
        padding-left: 2rem;
  padding-right: 1rem;
        border-radius: 8px;
        height: 40px;
        width: 100%;
      }
    }
  }
}

.attendance-list-container {
  max-height: 500px;
  overflow-y: auto;
  background-color: $background;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  
  .spinner {
    width: 48px;
    height: 48px;
    border: 3px solid $light-gray;
    border-top-color: $primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  p {
    color: $gray;
  }
}

.attendance-list {
  padding: 1.25rem 1.5rem;
}

.student-attendance-row {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background-color: $white;
  border-radius: 10px;
  margin-bottom: 0.75rem;
  border: 1px solid $light-gray;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .student-info {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background-color: $primary;
      color: $white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }
    
    .details {
      h6 {
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 0.125rem;
        color: $dark;
      }
      
      p {
        font-size: 0.75rem;
        color: $gray;
        margin-bottom: 0;
      }
      
      small.text-danger {
        font-size: 0.75rem;
        display: block;
        margin-top: 0.25rem;
      }
    }
  }
  
  .attendance-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    
    .status-options {
      display: flex;
      gap: 0.5rem;
      
      .status-option {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background-color: $light-gray;
        
        i {
          color: $gray;
          font-size: 0.875rem;
        }
        
        &.active {
          &.present {
            background-color: $success;
            i { color: $white; }
          }
          
          &.absent {
            background-color: $danger;
            i { color: $white; }
          }
          
          &.late {
            background-color: $warning;
            i { color: $white; }
          }
          
          &.excused {
            background-color: $info;
            i { color: $white; }
          }
        }
      }
    }
    
    .remarks-field {
      input {
        border-radius: 8px;
        border: 1px solid $light-gray;
        
        &::placeholder {
          color: #adb5bd;
          font-size: 0.75rem;
        }
        
        &:focus {
          border-color: $primary;
          box-shadow: 0 0 0 0.15rem rgba($primary, 0.15);
        }
      }
    }
  }
}

// Responsive Adjustments
@media (min-width: 768px) {
  .student-attendance-row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    
    .student-info {
      margin-bottom: 0;
    }
    
    .attendance-options {
      flex-direction: row;
      align-items: center;
      gap: 1rem;
      
      .remarks-field {
        min-width: 200px;
      }
    }
  }
}

@media (max-width: 767px) {
  .analytics-card {
    .analytics-data {
      h4 {
        font-size: 1.25rem;
      }
    }
  }
  
  .content-tabs {
    .nav-pills {
      .nav-link {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
      }
    }
  }
  
  .custom-table {
    th, td {
      padding: 0.75rem 1rem;
    }
  }
}

.empty-state-container {
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $white;
}

.empty-state {
  padding: 2rem;
  max-width: 400px;
  margin: 0 auto;
}

.modern-date-display {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba($dark, 0.05);
  border-radius: 6px;
  font-size: 0.9rem;
  color: $dark;
  font-weight: 500;
  
  i {
    color: $gray;
  }
}

.btn-date-change {
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid rgba($dark, 0.1);
  color: $dark;
  background: transparent;
  
  &:hover {
    background: rgba($dark, 0.05);
    border-color: rgba($dark, 0.15);
  }
}

.btn-today {
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  color: $primary;
  background: transparent;
  border: none;
  
  &:hover {
    color: darken($primary, 10%);
  }
}

.date-picker-card {
  background: $white;
  border-radius: 12px;
  overflow: hidden;
  
  .current-date-display {
    padding: 2rem;
    background: linear-gradient(45deg, $primary, darken($primary, 10%));
    color: white;
    text-align: center;
    
    .date-preview {
      .month-year {
        font-size: 1.1rem;
        opacity: 0.9;
        margin-bottom: 0.5rem;
      }
      
      .day-number {
        font-size: 3.5rem;
        font-weight: 600;
        line-height: 1;
        margin-bottom: 0.5rem;
      }
      
      .day-name {
        font-size: 1.1rem;
        opacity: 0.9;
      }
    }
  }
  
  .date-selection {
    padding: 1.5rem;
    
    .form-label {
      font-size: 0.9rem;
      font-weight: 500;
      color: $gray;
      margin-bottom: 1rem;
    }
    
    .date-input-wrapper {
      margin-bottom: 1.5rem;
      
      .date-display {
        position: relative;
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        border: 1px solid $light-gray;
        border-radius: 8px;
        background: $white;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          border-color: $primary;
          background: rgba($primary, 0.02);
        }
        
        i {
          margin-right: 1rem;
        }
        
        .date-input {
          border: none;
  background: none;
          width: 100%;
          color: $dark;
          font-size: 1rem;
          
          &:focus {
            outline: none;
          }
        }
      }
}

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      
      .action-btn {
        padding: 0.75rem;
        border: 1px solid $light-gray;
        border-radius: 8px;
        background: $white;
        color: $dark;
        font-size: 0.9rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        
        &:hover:not(:disabled) {
          border-color: $primary;
          background: rgba($primary, 0.02);
          color: $primary;
        }
        
        &.today-btn {
          border-color: $primary;
          color: $primary;
          
          &:hover:not(:disabled) {
            background: rgba($primary, 0.1);
          }
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        i {
          font-size: 0.8rem;
        }
      }
    }
  }
}

#datePickerModal {
  .modal-content {
    border: none;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
  
  .modal-header {
    border-bottom: 1px solid $light-gray;
    padding: 1.25rem;
    
    .modal-title {
      font-size: 1.1rem;
      font-weight: 600;
    }
  }
  
  .modal-footer {
    border-top: 1px solid $light-gray;
    padding: 1.25rem;
    
    .btn {
      padding: 0.75rem 1.5rem;
      font-weight: 500;
    }
  }
}

.attendance-exists-card {
  padding: 2rem;
  text-align: center;
  
  .warning-icon {
    width: 80px;
    height: 80px;
    background: rgba($warning, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    
    i {
      font-size: 2.5rem;
      color: $warning;
    }
  }
  
  .warning-content {
    margin-bottom: 2rem;
    
    h4 {
      color: $dark;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    p {
      color: $gray;
      margin-bottom: 0;
      font-size: 0.95rem;
      line-height: 1.5;
    }
}

  .attendance-summary {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: $background;
    border-radius: 12px;
    
    .summary-item {
      text-align: center;
      
      .label {
        display: block;
        font-size: 0.9rem;
        color: $gray;
        margin-bottom: 0.5rem;
      }
      
      .value {
        font-size: 1.5rem;
        font-weight: 600;
      }
    }
  }

  .edit-instruction {
    background: rgba($primary, 0.05);
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .instruction-icon {
  width: 40px;
  height: 40px;
      min-width: 40px;
      background: rgba($primary, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
      
      i {
        color: $primary;
        font-size: 1.25rem;
      }
    }
    
    p {
      margin: 0;
      text-align: left;
      font-size: 0.95rem;
      color: $dark;
      
      i {
        margin: 0 0.25rem;
      }
    }
  }
  
  .action-buttons {
    .btn {
      padding: 0.75rem 2rem;
  font-weight: 500;
}
  }
}

.edit-attendance-card {
  .student-info-section {
    background: linear-gradient(45deg, $primary, darken($primary, 10%));
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    color: white;
    
    .avatar {
      width: 64px;
      height: 64px;
      background: rgba(white, 0.2);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .info {
      h4 {
        margin: 0 0 0.25rem;
        font-weight: 600;
}

      p {
        margin: 0;
        opacity: 0.9;
        color: white;
      }
    }
  }
  
  .section-label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: $gray;
    margin-bottom: 1rem;
  }
  
  .status-section {
    padding: 1.5rem;
    border-bottom: 1px solid $light-gray;
    
    .status-options {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      
      .status-btn {
        padding: 1rem;
        border: 1px solid $light-gray;
        border-radius: 12px;
        background: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
        
        i {
          font-size: 1.25rem;
          color: $gray;
        }
        
        span {
          font-size: 0.85rem;
          color: $dark;
          font-weight: 500;
        }
        
        &.active {
          &.present {
            background: rgba($success, 0.1);
            border-color: $success;
            i, span { color: $success; }
          }
          
          &.absent {
            background: rgba($danger, 0.1);
            border-color: $danger;
            i, span { color: $danger; }
          }
          
          &.late {
            background: rgba($warning, 0.1);
            border-color: $warning;
            i, span { color: $warning; }
          }
          
          &.excused {
            background: rgba($info, 0.1);
            border-color: $info;
            i, span { color: $info; }
          }
        }
        
        &:hover:not(.active) {
          background: $background;
          border-color: darken($light-gray, 5%);
        }
      }
    }
}

  .remarks-section {
    padding: 1.5rem;
    border-bottom: 1px solid $light-gray;
    
    textarea {
      border-radius: 12px;
      resize: none;
      font-size: 0.95rem;
      
      &:focus {
        border-color: $primary;
        box-shadow: 0 0 0 0.25rem rgba($primary, 0.1);
      }
    }
  }
  
  .last-updated {
    padding: 1rem 1.5rem;
    background: $background;
    font-size: 0.85rem;
    color: $gray;
    text-align: center;
  }
}

#editAttendanceModal {
  .modal-content {
    border: none;
    border-radius: 16px;
    overflow: hidden;
  }
  
  .modal-header {
    padding: 1.5rem;
    
    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
    }
  }
  
  .modal-footer {
    padding: 1.25rem 1.5rem;
    
    .btn {
      padding: 0.75rem 1.5rem;
      font-weight: 500;
}
  }
}

.class-selector {
  .form-select {
    min-width: 200px;
    border-radius: 8px;
    border: 1px solid $light-gray;
    padding: 0.5rem 2.25rem 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: $dark;
    background-color: $white;
    transition: all 0.2s;
    
    &:focus {
      border-color: $primary;
      box-shadow: 0 0 0 0.15rem rgba($primary, 0.15);
    }
    
    &:hover:not(:disabled) {
      border-color: $primary;
    }
  }
}

.class-selection-card {
  .info-section {
    background: rgba($primary, 0.05);
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 0;
    border-radius: 0;
    
    .icon {
      width: 36px;
      height: 36px;
      min-width: 36px;
      background: rgba($primary, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      i {
        color: $primary;
        font-size: 1rem;
      }
    }
    
    p {
      margin: 0;
      font-size: 0.9rem;
      color: $dark;
      line-height: 1.5;
    }
  }

  .selection-container {
    padding: 1.25rem;

    .selection-section {
      .form-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: $gray;
        margin-bottom: 0.5rem;
        display: block;
      }

      .class-select-wrapper {
        position: relative;
        
        .form-select {
          width: 100%;
    padding: 0.75rem 1rem;
          font-size: 0.9rem;
          border-radius: 8px;
          border: 1px solid $light-gray;
          background-color: $white;
          transition: all 0.2s ease;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 16px 12px;
          
          &:focus {
            border-color: $primary;
            box-shadow: 0 0 0 0.25rem rgba($primary, 0.1);
          }
          
          &:disabled {
            background-color: rgba($light-gray, 0.5);
            cursor: not-allowed;
          }
        }

        .spinner-wrapper {
          position: absolute;
          right: 2.5rem;
          top: 50%;
          transform: translateY(-50%);
          
          .spinner-border {
            width: 1rem;
            height: 1rem;
            border-width: 0.15em;
          }
        }
      }
    }
  }
}

.modal-header {
  padding: 1.25rem;
  
  .modal-title {
    font-size: 1.1rem;
    font-weight: 600;
    
    i {
      color: $primary;
    }
  }
}

.modal-footer {
  padding: 1.25rem;
  
  .btn {
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
  }
}

.class-info {
  .badge {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    font-weight: 500;
    background: linear-gradient(45deg, $primary, darken($primary, 10%));
    
    i {
      opacity: 0.8;
    }
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;

  .spinner-container {
    text-align: center;
    
    .spinner-border {
      width: 3rem;
      height: 3rem;
      color: #42b883;
    }
    
    p {
      color: #2c3e50;
      font-size: 1.1rem;
      font-weight: 500;
      margin: 1rem 0 0;
    }
  }
}

// Add these styles for the create assignment modal
.create-assignment-card {
  height: calc(90vh - 180px);
  display: flex;
  flex-direction: column;
  
  .form-section {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    
    > div {
      height: 100%;
      
      .mcq-section {
        height: 100%;
        display: flex;
        flex-direction: column;
        margin-top: 0;
        padding-top: 0;
        border-top: none;
        
        .questions-list {
          flex: 1;
          overflow-y: auto;
          padding-right: 1rem;
          margin: 0 -1rem 0 0;
        }
      }
    }
  }
}

.mcq-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid $light-gray;
  animation: slideDown 0.3s ease-out;

  .questions-list {
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 1rem;
    margin-right: -1rem;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: $light-gray;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: darken($light-gray, 15%);
      border-radius: 3px;
      
      &:hover {
        background: darken($light-gray, 20%);
      }
    }
  }

  .question-card {
    background: $white;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid $light-gray;
    transition: all 0.2s ease;
    margin-bottom: 1.5rem;

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      border-color: $primary;
      box-shadow: 0 4px 12px rgba($primary, 0.1);
    }

    .question-number {
      width: 28px;
      height: 28px;
      background: $primary;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .points-badge {
      padding: 0.25rem 0.75rem;
      background: rgba($primary, 0.1);
      color: $primary;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .question-content {
      padding: 1rem;
      background: $background;
      border-radius: 8px;
      margin-top: 1rem;
    }

    .options-section {
      .options-grid {
        display: grid;
        gap: 0.75rem;
        
        .option-item {
          .input-group {
            background: $white;
            border-radius: 8px;
            overflow: hidden;
            
            .input-group-text {
              background: none;
              border: 1px solid $light-gray;
              border-right: none;
              padding: 0.5rem 0.75rem;
            }
            
            .form-control {
              border-left: none;
              border-right: none;
              
              &:focus {
                border-color: $light-gray;
                box-shadow: none;
              }
            }
            
            .btn-outline-danger {
              border: 1px solid $light-gray;
              border-left: none;
              padding: 0 1rem;
              
              &:hover {
                background: $danger;
                border-color: $danger;
                color: white;
              }
            }
          }
        }
      }
    }
  }
}

// Update modal styles
#createAssignmentModal {
  .modal-dialog {
    max-width: 900px;
    margin: 1rem auto;
    display: flex;
    align-items: center;
    min-height: calc(100% - 2rem);
    animation: modalSlideIn 0.4s ease-out;
  }

  .modal-content {
    border: none;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1),
                0 10px 20px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    background: linear-gradient(to bottom, #ffffff, #f8fafc);
    animation: modalFadeIn 0.3s ease-out;
    height: 75vh;
    display: flex;
    flex-direction: column;
  }

  .modal-body {
    flex: 1;
    overflow: hidden; // Changed from overflow-y: auto
    padding: 0;
  }

  .create-assignment-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    .form-section {
      padding: 2rem;
      height: 100%;
      overflow: hidden; // Changed from overflow-y: auto
      
      .basic-details {
        animation: cardSlideUp 0.4s ease-out;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05),
                    0 2px 6px rgba(0, 0, 0, 0.03);
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08),
                      0 3px 8px rgba(0, 0, 0, 0.05);
        }

        .form-group {
          margin-bottom: 1.5rem;
          
          &:last-child {
            margin-bottom: 0;
          }

          textarea.form-control {
            min-height: 80px;
          }
        }
      }

      .mcq-section {
        animation: cardSlideUp 0.4s ease-out 0.2s backwards;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05),
                    0 2px 6px rgba(0, 0, 0, 0.03);
        padding: 1.5rem;
        height: calc(100% - 350px); // Adjusted for the new total height
        display: flex;
        flex-direction: column;
        
        .questions-list {
          flex: 1;
          overflow-y: auto;
          padding-right: 1rem;
          margin-right: -1rem;
          
          &::-webkit-scrollbar {
            width: 6px;
          }
          
          &::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 3px;
          }
          
          &::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.15);
            border-radius: 3px;
            
            &:hover {
              background: rgba(0, 0, 0, 0.25);
            }
          }
        }
        
        .question-card {
          background: $background;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          animation: questionCardSlide 0.4s ease-out;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }

          .question-content {
            .form-group {
              margin-bottom: 1.5rem;
            }

            .options-section {
              margin-top: 1.5rem;
              
              .options-grid {
                margin-top: 0.75rem;
                
                .option-item {
                  margin-bottom: 0.75rem;
                  
                  &:last-child {
                    margin-bottom: 0;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

.mcq-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid $light-gray;

  .section-label {
    font-size: 1rem;
    font-weight: 600;
    color: $dark;
  }
}

.question-card {
  background-color: $background;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid $light-gray;
  transition: all 0.2s ease;

  &:hover {
    border-color: $primary;
    box-shadow: 0 4px 12px rgba($primary, 0.1);
  }

  .question-header {
    h6 {
      font-weight: 600;
      color: $dark;
    }
  }

  .options-section {
    background: $white;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 1rem;

    .form-label {
      margin-bottom: 1rem;
    }

    .option-item {
      margin-bottom: 0.75rem;

      &:last-child {
        margin-bottom: 0;
      }

      .input-group {
        .input-group-text {
          background: none;
          border-color: $light-gray;
          padding: 0.5rem;

          input[type="radio"] {
            cursor: pointer;
          }
        }

        .form-control {
          border-radius: 8px;
          margin-left: 0.5rem;
        }

        .btn-outline-danger {
          margin-left: 0.5rem;
          padding: 0.375rem 0.75rem;
          border-radius: 8px;

          i {
            font-size: 0.875rem;
          }
        }
      }
    }
  }
}

// Add these styles for the assignment type selector
.form-select {
  border-radius: 8px;
  border: 1px solid $light-gray;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  
  &:focus {
    border-color: $primary;
    box-shadow: 0 0 0 0.25rem rgba($primary, 0.1);
  }
}

// Add styles for the add/remove question buttons
.btn-outline-primary, .btn-outline-danger {
  &.btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    border-radius: 6px;
    
    i {
      font-size: 0.75rem;
    }
  }
}

.step-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: $white;
  border-bottom: 1px solid $light-gray;
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;
    
    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: $light-gray;
      color: $gray;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-bottom: 0.5rem;
      transition: all 0.3s ease;
    }
    
    .step-label {
      font-size: 0.875rem;
      color: $gray;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    &.active {
      .step-number {
        background: $primary;
        color: $white;
      }
      
      .step-label {
        color: $primary;
        font-weight: 600;
      }
    }
  }
  
  .step-line {
    flex: 1;
    height: 2px;
    background: $light-gray;
    margin: 0 1rem;
    margin-bottom: 2rem;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: $primary;
      transition: width 0.3s ease;
      width: 0;
    }
  }
  
  .step:nth-child(2).active ~ .step-line::after {
    width: 100%;
  }
}

// Enhanced Create Assignment Modal Styles
#createAssignmentModal {
  .modal-dialog {
    max-width: 900px;
    margin: 1.75rem auto;
    display: flex;
    align-items: center;
    min-height: calc(100% - 3.5rem);
    animation: modalSlideIn 0.4s ease-out;
  }

  .modal-content {
    border: none;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1),
                0 10px 20px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    background: linear-gradient(to bottom, #ffffff, #f8fafc);
    animation: modalFadeIn 0.3s ease-out;
  }

  .create-assignment-card {
    .form-section {
      padding: 2.5rem;
      
      .basic-details {
        animation: cardSlideUp 0.4s ease-out;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05),
                    0 2px 6px rgba(0, 0, 0, 0.03);
        padding: 2rem;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08),
                      0 3px 8px rgba(0, 0, 0, 0.05);
        }

        .form-group {
          margin-bottom: 2rem;
          
          .form-label {
            font-weight: 600;
            color: $dark;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            
            &::before {
              content: '';
              display: inline-block;
              width: 4px;
              height: 16px;
              background: $primary;
              border-radius: 2px;
              animation: labelBarSlide 0.3s ease-out;
            }
          }
          
          .form-control, .form-select {
            border-radius: 12px;
            border: 2px solid $light-gray;
            padding: 1rem 1.25rem;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: white;
            
            &:focus {
              border-color: $primary;
              box-shadow: 0 0 0 4px rgba($primary, 0.1);
              transform: translateY(-2px);
            }
            
            &:hover:not(:focus) {
              border-color: darken($light-gray, 10%);
            }
          }
        }
      }

      .mcq-section {
        animation: cardSlideUp 0.4s ease-out 0.2s backwards;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05),
                    0 2px 6px rgba(0, 0, 0, 0.03);
        padding: 2rem;
        margin-top: 2rem;
        
        .question-card {
          background: $background;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          animation: questionCardSlide 0.4s ease-out;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }
        }
      }
    }
  }

  // Step Progress Animation
  .step-progress {
    .step {
      &.active {
        .step-number {
          animation: stepNumberPop 0.4s ease-out;
        }
        
        .step-label {
          animation: stepLabelFade 0.4s ease-out;
        }
      }
    }
    
    .step-line::after {
      transition: width 0.6s ease-in-out;
    }
  }
}

// Animation Keyframes
@keyframes modalSlideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes cardSlideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes labelBarSlide {
  from {
    transform: scaleY(0);
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

@keyframes questionCardSlide {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes stepNumberPop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes stepLabelFade {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ... existing code ...

.mcq-section {
  animation: cardSlideUp 0.4s ease-out 0.2s backwards;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05),
              0 2px 6px rgba(0, 0, 0, 0.03);
  padding: 1.5rem;
  height: calc(100% - 350px);
  display: flex;
  flex-direction: column;
  
  .questions-header {
    background: white;
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    animation: cardSlideUp 0.3s ease-out;
    border: 1px solid rgba(0, 0, 0, 0.05);
    
    .header-content {
      .section-label {
        font-size: 1.1rem;
        font-weight: 600;
        color: $dark;
        margin-bottom: 0.5rem;
      }
      
      p {
        color: $gray;
        margin: 0;
        font-size: 0.9rem;
      }
    }
    
    .btn-outline-primary {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      border-radius: 8px;
      border-width: 2px;
      font-weight: 500;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba($primary, 0.15);
      }
      
      i {
        font-size: 0.8rem;
      }
    }
  }

  // ... rest of existing mcq-section styles ...
}

// ... rest of existing styles ...

</style> 

<!-- Add PromptModal component before closing div -->
<PromptModal
  ref="promptModalRef"
  modalId="confirmPromptModal"
  :title="promptModalData.title"
  :message="promptModalData.message"
  icon="fa-exclamation-triangle"
  confirmButtonText="Delete"
  confirmIcon="fa-trash"
  @confirm="handlePromptConfirm"
/>
