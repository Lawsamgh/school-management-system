<template>
  <div class="students-view">
    <div class="container py-4">
      <!-- Class Overview Section -->
      <div class="section-header mb-4">
        <div class="class-info-card">
          <div class="content">
            <div class="class-details">
              <h1>{{ studentClassName || 'Loading...' }}</h1>
              <div class="meta-info">
                <!-- <span class="badge bg-primary">
                  <i class="fas fa-users me-2"></i>
                  Class {{ classId }}
                </span> -->
                <!-- <span class="teacher-info" v-if="classTeachers.length">
                  <i class="fas fa-chalkboard-teacher me-2"></i>
                  {{ classTeachers.join(', ') }}
                </span> -->
              </div>
            </div>
            <div class="quick-stats">
              <div class="stat-item">
                <div class="stat-value">{{ pendingAssignments }}</div>
                <div class="stat-label">Attempted Tasks</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ completedAssignments }}</div>
                <div class="stat-label">Completed</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ attendancePercentage }}%</div>
                <div class="stat-label">Attendance (Present)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="row g-4">
        <!-- Assignments Section -->
        <div class="col-lg-8">
          <div class="content-card assignments-section">
            <div class="card-header">
              <h2>
                <i class="fas fa-tasks me-2"></i>
                Assignments
              </h2>
              <div class="header-actions">
                
              </div>
            </div>
            <div class="card-body">
              <!-- Assignment List -->
              <div class="assignments-list" v-if="!loading && filteredAssignments.length">
                <div v-for="assignment in filteredAssignments" 
                     :key="assignment.id" 
                     class="assignment-item"
                     :class="{ 
                       'completed': assignment.student_status === 'completed',
                       'expired': isAssignmentExpired(assignment.due_date) && assignment.student_status === 'pending'
                     }"
                >
                  <div class="assignment-content">
                    <div class="status-badge" 
                         :class="{
                           'status-completed': assignment.student_status === 'completed',
                           'status-pending': assignment.student_status === 'pending' && !isAssignmentExpired(assignment.due_date),
                           'status-expired': isAssignmentExpired(assignment.due_date) && assignment.student_status === 'pending'
                         }">
                      <i class="fas" 
                         :class="{
                           'fa-check-circle': assignment.student_status === 'completed',
                           'fa-hourglass-half': assignment.student_status === 'pending' && !isAssignmentExpired(assignment.due_date),
                           'fa-exclamation-circle': isAssignmentExpired(assignment.due_date) && assignment.student_status === 'pending'
                         }">
                      </i>
                      <span>{{ 
                        assignment.student_status === 'completed' ? 'Completed' : 
                        isAssignmentExpired(assignment.due_date) ? 'Expired' : 'Pending' 
                      }}</span>
                    </div>
                    
                    <div class="assignment-details">
                      <div class="assignment-header">
                        <h3>{{ assignment.title }}</h3>
                        <div class="assignment-badges">
                          <span v-if="!assignment.assignment_status?.length" 
                                class="new-badge">New</span>
                        </div>
                      </div>
                      
                      <p class="description">{{ assignment.description }}</p>
                      
                      <div class="meta-info">
                        <div class="meta-item">
                          <i class="far fa-calendar-alt"></i>
                          <span :class="{ 'text-danger': isAssignmentExpired(assignment.due_date) }">
                            Due: {{ formatDate(assignment.due_date) }}
                          </span>
                        </div>
                        <div class="meta-item">
                          <i class="fas fa-book"></i>
                          <span>{{ assignment.subject }}</span>
                        </div>
                        <div class="meta-item">
                          <i class="fas fa-star"></i>
                          <span>{{ assignment.total_points }} points</span>
                        </div>
                        <div v-if="assignment.has_timer" class="meta-item">
                          <i class="fas fa-clock"></i>
                          <span>{{ assignment.time_limit }} minutes</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="assignment-actions">
                      <button class="btn-action btn-view" 
                              @click="viewAssignment(assignment)"
                              :disabled="isAssignmentExpired(assignment.due_date) && assignment.student_status === 'pending'">
                        <i class="fas fa-eye"></i>
                        <span>View</span>
                      </button>
                      <button 
                        v-if="assignment.student_status !== 'completed'"
                        class="btn-action btn-submit" 
                        @click="submitAssignment(assignment)"
                        :disabled="isAssignmentExpired(assignment.due_date)">
                        <i class="fas fa-paper-plane"></i>
                        <span>Submit</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Empty State -->
              <div v-else-if="!loading && !filteredAssignments.length" class="empty-state">
                <i class="fas fa-tasks fa-3x mb-3"></i>
                <h3>No Assignments Found</h3>
                <p>There are no assignments matching your current filter.</p>
              </div>
              <!-- Loading State -->
              <div v-else class="loading-state">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading assignments...</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <!-- Upcoming Tests -->
          <div class="content-card upcoming-tests-card mb-4">
            <div class="card-header">
              <h2>
                <i class="fas fa-calendar-alt me-2"></i>
                Class Schedule
              </h2>
            </div>
            <div class="card-body">
              <div class="upcoming-tests">
                <div v-if="classSchedules.length > 0" v-for="schedule in classSchedules" :key="schedule.id" class="test-item">
                  <div class="test-date">
                    <span class="day">{{ schedule.day_of_week }}</span>
                    <span class="month">{{ formatTime(schedule.start_time) }}</span>
                  </div>
                  <div class="test-details">
                    <h4>{{ schedule.subject_name }}</h4>
                    <p>{{ schedule.teacher_name }}</p>
                    <span class="time">
                      <i class="far fa-clock me-1"></i>
                      {{ formatTime(schedule.start_time) }} - {{ formatTime(schedule.end_time) }}
                    </span>
                  </div>
                </div>
                <div v-else class="empty-schedule">
                  <i class="fas fa-calendar-day"></i>
                  <p>No Class Schedule for Today</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Stats Card -->
          <div class="content-card performance-stats-card">
            <div class="card-header">
              <h2>
                <i class="fas fa-chart-line me-2"></i>
                Performance Stats
              </h2>
            </div>
            <div class="card-body h-100">
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value">{{ completedAssignments }}</div>
                  <div class="stat-label">Completed Tasks</div>
                </div>
                
                <div class="stat-item">
                  <div class="stat-value">{{ pastDueAssignments }}</div>
                  <div class="stat-label">Past Due</div>
                </div>

                <div class="stat-item">
                  <div class="stat-value">{{ averageScore }}%</div>
                  <div class="stat-label">Average Score</div>
                </div>

                <div class="stat-item">
                  <div class="stat-value">{{ attendancePercentage }}%</div>
                  <div class="stat-label">Attendance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Completed Assignments Section -->
      <div class="row mt-4">
        <div class="col-md-12">
          <div class="content-card completed-assignments-card">
            <div class="card-header">
              <h2>
                <i class="fas fa-check-circle me-2"></i>
                Completed Assignments
              </h2>
            </div>
            <div class="card-body">
              <div class="completed-assignments">
                <div v-if="loading" class="loading-state">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading assignments...</span>
                  </div>
                  <p>Loading completed assignments...</p>
                </div>
                <div v-else-if="completedAssignmentsList.length" class="completed-list">
                  <div v-for="assignment in completedAssignmentsList" 
                       :key="assignment.id" 
                       class="completed-item">
                    <div class="assignment-info">
                      <div class="main-content">
                        <div class="title-section">
                          <h4>{{ assignment.title }}</h4>
                          <div class="meta-info">
                            <span class="subject">
                              <i class="fas fa-book me-1"></i>
                              {{ assignment.subject }}
                            </span>
                            <span class="questions" v-if="assignment.questions">
                              <i class="fas fa-list-ol me-1"></i>
                              {{ assignment.questions.length }} Questions
                            </span>
                          </div>
                        </div>
                        <div class="score-display" :class="getScoreClass(assignment.score, assignment.max_score)">
                          <div class="score-percentage">
                            {{ Math.round((assignment.score / assignment.max_score) * 100) }}%
                          </div>
                          <div class="score-points">
                            {{ assignment.score }}/{{ assignment.max_score }}
                          </div>
                        </div>
                      </div>
                      <div class="action-bar">
                        <div class="completion-date">
                          Completed Date: <i class="far fa-calendar-check me-1"></i>
                          {{ formatDate(assignment.submitted_at) }}
                        </div>
                        <button class="btn-review" @click="viewAssignment(assignment)">
                          <i class="fas fa-eye me-1"></i>
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <i class="fas fa-check-circle fa-3x mb-3"></i>
                  <h3>No Completed Assignments</h3>
                  <p>Complete your assignments to see them here.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assignment View Modal -->
    <div class="modal fade" 
         id="assignmentModal" 
         tabindex="-1" 
         data-bs-backdrop="static" 
         data-bs-keyboard="false">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title-wrapper">
              <div class="header-content">
                <div class="title-section">
                  <h5 class="modal-title">{{ selectedAssignment?.title }}</h5>
                  <div class="badges-container">
                    <span class="subject-badge">{{ selectedAssignment?.subject }}</span>
                    <span class="due-badge">
                      <i class="far fa-clock me-1"></i>
                      Due: {{ formatDate(selectedAssignment?.due_date) }}
                    </span>
                  </div>
                </div>
                <div v-if="selectedAssignment?.has_timer && selectedAssignment?.student_status === 'pending'" 
                     class="timer-section">
                  <div class="timer-countdown"
                       :class="{ 'time-warning': remainingTime && remainingTime <= 300 }">
                    <div class="timer-label">Time Remaining</div>
                    <div class="timer-value">
                      <i class="fas fa-clock"></i>
                      {{ formatTimeRemaining }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button type="button" 
                    class="btn-close" 
                    @click="handleModalClose"
                    v-if="!selectedAssignment?.has_timer || selectedAssignment?.student_status === 'completed'">
            </button>
          </div>
          <div class="modal-body">
            <div class="quiz-container" v-if="selectedAssignment">
              <!-- Progress Bar -->
              <div class="quiz-progress" v-if="selectedAssignment.student_status === 'pending'">
                <div class="progress-stats">
                  <div class="d-flex align-items-center">
                    <span class="total-points">
                      <i class="fas fa-star"></i>
                      {{ selectedAssignment.total_points }} Points Total
                    </span>
                    <span class="questions-count ms-3">
                      <i class="fas fa-list-ol"></i>
                      {{ selectedAssignment.questions.length }} Questions
                    </span>
                  </div>
                  <div class="progress-percentage">{{ calculateProgress }}% Complete</div>
                </div>
                <div class="progress">
                  <div class="progress-bar" 
                       role="progressbar" 
                       :style="{ width: calculateProgress + '%' }" 
                       :aria-valuenow="calculateProgress" 
                       aria-valuemin="0" 
                       aria-valuemax="100">
                  </div>
                </div>
              </div>

              <!-- Instructions Section -->
              <div class="quiz-section instructions-section">
                <div class="section-header">
                  <i class="fas fa-info-circle"></i>
                  <h6>Instructions</h6>
            </div>
                <div class="instructions-content">
                  <p class="instructions-text">{{ selectedAssignment.description }}</p>
                  <div class="instructions-meta">
                    <div class="meta-item">
                      <i class="fas fa-check-circle"></i>
                      Answer all questions
          </div>
                    <div class="meta-item">
                      <i class="fas fa-save"></i>
                      Progress auto-saved
                    </div>
                    <div class="meta-item">
                      <i class="fas fa-redo"></i>
                      Can change answers until submission
                    </div>
        </div>
      </div>
    </div>

              <!-- Questions Section -->
              <div class="quiz-section questions-section">
                <div class="questions-navigation">
                  <button v-for="(question, idx) in selectedAssignment.questions"
                          :key="question.id"
                          class="nav-dot"
                          :class="{ 'active': idx === 0, 'answered': false }"
                          @click="scrollToQuestion(question.id)">
                    {{ idx + 1 }}
                  </button>
          </div>
                
                <div class="questions-container">
                  <div v-for="(question, index) in selectedAssignment.questions" 
                       :key="question.id" 
                       :id="'question-' + question.id"
                       class="question-card">
                    <div class="question-header">
                      <div class="question-meta">
                        <div class="question-number">Question {{ index + 1 }}</div>
                        <div class="question-points">
                          <i class="fas fa-star-half-alt"></i>
                          {{ question.points }} points
          </div>
        </div>
                      
                    </div>
                    
                    <div class="question-content">
                      <p class="question-text">{{ question.question_text }}</p>
                      
                      <!-- Multiple Choice Options -->
                      <div v-if="question.options?.length" class="options-grid">
                        <label v-for="option in question.options" 
                               :key="option.id" 
                               :for="option.id"
                               class="option-card"
                               :class="{ 
                                 'selected': question.student_response?.selected_option_id === option.id,
                                 'disabled': selectedAssignment.student_status === 'completed',
                                 'correct': selectedAssignment.student_status === 'completed' && 
                                          option.is_correct && 
                                          question.student_response?.selected_option_id !== option.id &&
                                          !question.options.find(opt => 
                                            opt.id === question.student_response?.selected_option_id && 
                                            opt.is_correct
                                          ),
                                 'incorrect': selectedAssignment.student_status === 'completed' && 
                                            question.student_response?.selected_option_id === option.id && 
                                            !option.is_correct
                               }">
                          <input type="radio" 
                                 :id="option.id"
                                 :name="'question' + question.id"
                                 :value="option.id"
                                 :checked="question.student_response?.selected_option_id === option.id"
                                 :disabled="selectedAssignment.student_status === 'completed'"
                                 class="option-input"
                                 @change="handleOptionSelect(question.id, option.id)">
                          <div class="option-content">
                            <div class="option-indicator">
                              <i v-if="selectedAssignment.student_status === 'completed'" 
                                 class="fas" 
                                 :class="{
                                  'fa-check': question.student_response?.selected_option_id === option.id && option.is_correct,
                                  'fa-times': question.student_response?.selected_option_id === option.id && !option.is_correct,
                                  'fa-circle-check': option.is_correct && 
                                                   question.student_response?.selected_option_id !== option.id &&
                                                   !question.options.find(opt => 
                                                     opt.id === question.student_response?.selected_option_id && 
                                                     opt.is_correct
                                                   )
                                }"></i>
                            </div>
                            <span class="option-text">{{ option.option_text }}</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="quiz-actions">
                <div class="action-info" v-if="selectedAssignment.student_status === 'pending'">
                  <i class="fas fa-info-circle"></i>
                  <span>Your progress is automatically saved</span>
                </div>
                <div class="action-buttons">
                  <button class="action-btn btn-secondary" 
                          @click="closeModal"
                          v-if="!selectedAssignment.has_timer || selectedAssignment.student_status === 'completed'">
                    <i class="fas" :class="selectedAssignment.student_status === 'completed' ? 'fa-times' : 'fa-save'"></i>
                    {{ selectedAssignment.student_status === 'completed' ? 'Close' : 'Save & Exit' }}
                  </button>
                  <button v-if="selectedAssignment.student_status === 'pending'"
                          class="action-btn btn-primary" 
                          @click="submitAssignment(selectedAssignment)">
                    <i class="fas fa-paper-plane"></i>
                    Submit Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { Modal } from 'bootstrap'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/lib/supabase'
import { useToast } from 'vue-toastification'
import { logActivity } from '@/lib/auditLogger'

// Update interfaces to match Supabase response structure
interface QuestionOption {
  id: string
  option_text: string
  is_correct: boolean
  option_order: number
}

interface StudentResponse {
  id: string
  selected_option_id: string
}

interface AssignmentQuestion {
  id: string
  question_text: string
  points: number
  question_order: number
  question_options?: QuestionOption[]
  student_responses?: StudentResponse[]
}

interface AssignmentStatus {
  id: string;
  assignment_id: string;
  student_id: string;
  status: 'pending' | 'completed';
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AssignmentScore {
  score: number;
  max_score: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  class_id: number;
  teacher_id: number;
  due_date: string;
  total_points: number;
  status: 'active' | 'draft' | 'archived';
  school_id: string;
  subject: string | null;
  assignment_questions?: AssignmentQuestion[];
  student_status?: 'pending' | 'completed';
  assignment_status?: AssignmentStatus[];
  assignment_scores?: AssignmentScore[];
  score?: number;
  max_score?: number;
  submitted_at?: string;
  created_at: string;
  has_timer: boolean;
  time_limit: number;
}

// Update the processed assignment interface
interface ProcessedAssignment extends Omit<Assignment, 'assignment_questions'> {
  questions: (Omit<AssignmentQuestion, 'question_options' | 'student_responses'> & {
    options: QuestionOption[]
    student_response?: StudentResponse
  })[]
}

interface ClassSchedule {
  id: string
  subject_name: string
  teacher_name: string
  day_of_week: string
  start_time: string
  end_time: string
}

// Initialize
const toast = useToast()
const authStore = useAuthStore()

// State
const loading = ref(true)
const studentClassName = ref('')
const classId = ref('')
const classTeachers = ref<string[]>([])
const assignments = ref<ProcessedAssignment[]>([])
const selectedFilter = ref('all')
const selectedAssignment = ref<ProcessedAssignment | null>(null)
const assignmentModal = ref<Modal | null>(null)
const remainingTime = ref<number | null>(null)
const timerInterval = ref<number | null>(null)

const classSchedules = ref<ClassSchedule[]>([])

// Mock data for demo (replace with actual data fetching)
const upcomingTests = ref([
  {
    id: 1,
    subject: 'Mathematics',
    topic: 'Algebra Test',
    date: '2024-02-20',
    time: '09:00 AM'
  },
  {
    id: 2,
    subject: 'Science',
    topic: 'Biology Quiz',
    date: '2024-02-22',
    time: '10:30 AM'
  }
])

// Initialize the refs with 0
const presentDays = ref(0)
const absentDays = ref(0)
const totalDays = ref(0)

// Initialize attendance data when component mounts
onMounted(async () => {
  console.log('Component mounted, initializing data...')
  await fetchAttendanceData()
  fetchClassSchedules()
})

// Attendance data
const attendancePercentage = computed(() => {
  console.log('Computing attendance percentage:', {
    presentDays: presentDays.value,
    totalDays: totalDays.value
  })
  if (totalDays.value === 0) return 0
  return Math.round((presentDays.value / totalDays.value) * 100)
})

// Computed
const pendingAssignments = computed(() => {
  return assignments.value.filter(assignment => {
    // Check if the assignment is pending and not past due date
    const isPending = assignment.student_status === 'pending'
    const dueDate = assignment.due_date ? new Date(assignment.due_date) : null
    const now = new Date()
    
    // Only count if pending AND either has no due date or due date hasn't passed
    return isPending && (!dueDate || dueDate > now)
  }).length
})

const completedAssignments = computed(() => 
  assignments.value.filter(a => a.student_status === 'completed').length
)

const filteredAssignments = computed(() => {
  if (selectedFilter.value === 'all') {
    // Only show pending assignments that haven't expired
    return assignments.value.filter(a => {
      const isExpired = new Date(a.due_date) < new Date();
      return a.student_status === 'pending' && !isExpired;
    });
  }
  return assignments.value.filter(a => a.student_status === selectedFilter.value);
})

const completedAssignmentsList = computed(() => {
  return assignments.value
    .filter(assignment => assignment.student_status === 'completed')
    .map(assignment => ({
        ...assignment,
      score: assignment.score || 0,
      max_score: assignment.max_score || assignment.total_points,
        submitted_at: assignment.assignment_status?.[0]?.submitted_at || undefined,
        created_at: assignment.created_at
    }))
    .sort((a, b) => {
      // Sort by submission date, most recent first
      const dateA = a.submitted_at || '';
      const dateB = b.submitted_at || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
});

const calculateProgress = computed(() => {
  if (!selectedAssignment.value) return 0;
  const totalQuestions = selectedAssignment.value.questions.length;
  if (totalQuestions === 0) return 0;
  
  const answeredQuestions = selectedAssignment.value.questions.filter(q => q.student_response).length;
  return Math.round((answeredQuestions / totalQuestions) * 100);
});

const formatDate = (date: string | undefined) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDay = (date: string) => {
  return new Date(date).getDate()
}

const formatMonth = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short' })
}

const formatTimeRemaining = computed(() => {
  if (!remainingTime.value) return '--:--';
  const minutes = Math.floor(remainingTime.value / 60);
  const seconds = remainingTime.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// Add watchers after the component setup
// Watch remaining time changes
watch(remainingTime, async (newTime) => {
  if (selectedAssignment.value?.has_timer && 
      selectedAssignment.value?.student_status === 'pending' && 
      newTime !== null) {
    const studentId = authStore.userRole?.id;
    if (studentId && selectedAssignment.value) {
      try {
        await supabase
          .from('assignment_status')
          .update({
            remaining_time: newTime,
            updated_at: new Date().toISOString()
          })
          .eq('assignment_id', selectedAssignment.value.id)
          .eq('student_id', studentId);
      } catch (error) {
        console.error('Error saving timer state:', error);
      }
    }
  }
});

// Update handleOptionSelect to save progress immediately
const handleOptionSelect = async (questionId: string, optionId: string) => {
  if (!selectedAssignment.value) return;

  // Find and update the question in the selectedAssignment
  const question = selectedAssignment.value.questions.find(q => q.id === questionId);
  if (question) {
    question.student_response = {
      id: `temp_${Date.now()}`, // Temporary ID for new responses
      selected_option_id: optionId
    };
  }

  // Update the navigation dot status
  const questionElement = document.getElementById('question-' + questionId);
  if (questionElement) {
    const navDot = document.querySelector(`.nav-dot[data-question="${questionId}"]`);
    if (navDot) {
      navDot.classList.add('answered');
    }
  }

  // Save progress to database
  try {
    const studentId = authStore.userRole?.id;
    if (!studentId) return;

    const now = new Date().toISOString();

    // Save the response
    await supabase
      .from('student_responses')
      .upsert({
        student_id: studentId,
        question_id: questionId,
        selected_option_id: optionId,
        created_at: now,
        updated_at: now
      }, {
        onConflict: 'student_id,question_id'
      });

    // Update assignment status
    await supabase
      .from('assignment_status')
      .upsert({
        assignment_id: selectedAssignment.value.id,
        student_id: studentId,
        status: 'pending',
        remaining_time: remainingTime.value,
        updated_at: now
      }, {
        onConflict: 'assignment_id,student_id'
      });

  } catch (error) {
    console.error('Error saving response:', error);
    toast.error('Failed to save your answer. Please try again.');
  }
}

// Update startTimer to pass isTimerExpired flag
const startTimer = async () => {
  if (!selectedAssignment.value?.has_timer || !selectedAssignment.value?.time_limit) return;
  
  const studentId = authStore.userRole?.id;
  if (!studentId || !selectedAssignment.value) return;

  try {
    // Get existing assignment status
    const { data: statusData, error: statusError } = await supabase
      .from('assignment_status')
      .select('started_at, remaining_time')
      .eq('assignment_id', selectedAssignment.value.id)
      .eq('student_id', studentId)
      .single();

    if (statusError && statusError.code !== 'PGRST116') {
      console.error('Error fetching timer status:', statusError);
      throw statusError;
    }

    const now = new Date();
    
    if (!statusData?.started_at) {
      // First time starting the timer
      remainingTime.value = selectedAssignment.value.time_limit * 60;
      
      // Save initial timer state
      const { error: saveError } = await supabase
        .from('assignment_status')
        .upsert({
          assignment_id: selectedAssignment.value.id,
          student_id: studentId,
          status: 'pending',
          started_at: now.toISOString(),
          remaining_time: remainingTime.value,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        }, {
          onConflict: 'assignment_id,student_id'
        });

      if (saveError) {
        console.error('Error saving timer status:', saveError);
        throw saveError;
      }
    } else {
      // Resume from saved state
      remainingTime.value = statusData.remaining_time;
    }
  } catch (error) {
    console.error('Error in startTimer:', error);
    toast.error('Failed to start timer. Please try again.');
    return;
  }

  // Clear any existing interval
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
  
  // Start countdown
  timerInterval.value = window.setInterval(() => {
    if (remainingTime.value && remainingTime.value > 0) {
      remainingTime.value--;
    } else {
      // Time's up - auto submit
      if (timerInterval.value) {
        clearInterval(timerInterval.value);
      }
      if (selectedAssignment.value) {
        submitAssignment(selectedAssignment.value, true); // Pass true for timer expiration
      }
    }
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
  remainingTime.value = null;
};

// Modify viewAssignment to handle both initial view and refresh
const viewAssignment = async (assignment: ProcessedAssignment) => {
  // Check if assignment is expired and not yet started
  if (isAssignmentExpired(assignment.due_date) && assignment.student_status === 'pending') {
    toast.error('This assignment has expired. The due date has passed.');
    return;
  }

  selectedAssignment.value = assignment;
  
  // Check if this is a timed assignment
  if (assignment.has_timer && assignment.student_status === 'pending') {
    const studentId = authStore.userRole?.id;
    if (studentId) {
      const { data: statusData } = await supabase
        .from('assignment_status')
        .select('started_at, remaining_time')
        .eq('assignment_id', assignment.id)
        .eq('student_id', studentId)
        .single();

      // If there's an ongoing timer or it's a new start, initialize timer
      if (statusData?.started_at && statusData?.remaining_time) {
        startTimer();
      } else {
        startTimer();
      }
    }
  }
  
  // Ensure modal is initialized
  if (!assignmentModal.value) {
    const modalElement = document.getElementById('assignmentModal')
    if (modalElement) {
      assignmentModal.value = new Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
      })
    }
  }
  
  assignmentModal.value?.show()
}

// Update submitAssignment function to clear timer data
const submitAssignment = async (assignment: ProcessedAssignment, isTimerExpired: boolean = false) => {
  try {
    // Only validate complete answers if not timer expired
    if (!isTimerExpired) {
      // 1. Validate that all questions are answered
      const unansweredQuestions = assignment.questions.filter(q => !q.student_response);
      if (unansweredQuestions.length > 0) {
        toast.warning(`Please answer all questions before submitting. ${unansweredQuestions.length} questions remaining.`);
        scrollToQuestion(unansweredQuestions[0].id);
        return;
      }
    }

    // Show loading toast
    toast.info('Submitting your assignment...', {
      timeout: false,
      closeOnClick: false,
      closeButton: false
    });

    // 2. Get student ID and timestamp
    const studentId = authStore.userRole?.id;
    if (!studentId) {
      toast.error('Unable to identify student. Please try logging in again.');
      return;
    }
    const now = new Date().toISOString();

    // 3. Save student responses (only for answered questions)
    const answeredQuestions = assignment.questions.filter(q => q.student_response);
    const responses = answeredQuestions.map(question => ({
      student_id: studentId,
      question_id: question.id,
      selected_option_id: question.student_response?.selected_option_id,
      created_at: now,
      updated_at: now
    }));

    if (responses.length > 0) {
      const { error: submissionError } = await supabase
        .from('student_responses')
        .upsert(responses, {
          onConflict: 'student_id,question_id'
        });

      if (submissionError) throw submissionError;
    }

    // 4. Calculate and save score
    let score = 0;
    let maxScore = 0;
    for (const question of assignment.questions) {
      maxScore += question.points;
      const selectedOption = question.options.find(
        opt => opt.id === question.student_response?.selected_option_id
      );
      if (selectedOption?.is_correct) {
        score += question.points;
      }
    }

    const { error: scoreError } = await supabase
      .from('assignment_scores')
      .upsert({
        assignment_id: assignment.id,
        student_id: studentId,
        score: score,
        max_score: maxScore,
        graded_at: now,
        created_at: now,
        updated_at: now
      }, {
        onConflict: 'assignment_id,student_id'
      });

    if (scoreError) throw scoreError;

    // 5. Update assignment status to completed
    const { error: statusError } = await supabase
      .from('assignment_status')
      .update({
        status: 'completed',
        submitted_at: now,
        remaining_time: null,
        updated_at: now
      })
      .eq('assignment_id', assignment.id)
      .eq('student_id', studentId);

    if (statusError) throw statusError;

    // 6. Log activity
    await logActivity(
      'create',
      'assignments',
      assignment.id,
      null,
      { 
        title: assignment.title,
        score: score,
        max_score: maxScore,
        status: 'completed',
        submitted_by: isTimerExpired ? 'timer_expired' : 'student'
      }
    );

    // Clear loading toast and show success
    toast.clear();
    
    // Show different message based on submission type
    if (isTimerExpired) {
      toast.warning(`Time's up! Assignment auto-submitted. Score: ${score}/${maxScore} (${Math.round(score/maxScore * 100)}%)`);
    } else {
      toast.success(`Assignment submitted successfully! Score: ${score}/${maxScore} (${Math.round(score/maxScore * 100)}%)`);
    }

    // Close modal and refresh data
    assignmentModal.value?.hide();
    
    // Add a small delay before fetching updated data
    await new Promise(resolve => setTimeout(resolve, 1000));
    await fetchStudentData();

  } catch (error) {
    console.error('Error in submitAssignment:', error);
    toast.clear();
    toast.error('Failed to submit assignment. Please try again.');
  }
}

const scrollToQuestion = (questionId: string) => {
  const element = document.getElementById('question-' + questionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Update closeModal function
const closeModal = async () => {
  try {
    // Only perform save operations if the assignment is pending
    if (selectedAssignment.value?.student_status === 'pending') {
      const studentId = authStore.userRole?.id;
      if (!studentId || !selectedAssignment.value) {
        stopTimer();
        assignmentModal.value?.hide();
        return;
      }

      // Show saving toast
      toast.info('Saving your progress...', {
        timeout: false,
        closeOnClick: false,
        closeButton: false
      });

      const now = new Date().toISOString();

      // Get all answered questions
      const answeredQuestions = selectedAssignment.value.questions.filter(q => q.student_response);
      
      if (answeredQuestions.length > 0) {
        // Save responses
        const responses = answeredQuestions.map(question => ({
          student_id: studentId,
          question_id: question.id,
          selected_option_id: question.student_response?.selected_option_id,
          created_at: now,
          updated_at: now
        }));

        const { error: submissionError } = await supabase
          .from('student_responses')
          .upsert(responses, {
            onConflict: 'student_id,question_id'
          });

        if (submissionError) throw submissionError;
      }

      // Save assignment status with remaining time
      const { error: statusError } = await supabase
        .from('assignment_status')
        .upsert({
          assignment_id: selectedAssignment.value.id,
          student_id: studentId,
          status: 'pending',
          remaining_time: remainingTime.value,
          updated_at: now
        }, {
          onConflict: 'assignment_id,student_id'
        });

      if (statusError) throw statusError;

      // Log the activity
      await logActivity(
        'update',
        'assignments',
        selectedAssignment.value.id,
        null,
        { title: selectedAssignment.value.title, action: 'saved_progress' }
      );

      // Clear toast and show success
      toast.clear();
      toast.success('Progress saved successfully!');
    }

    // Stop timer and close modal
    stopTimer();
    assignmentModal.value?.hide();
    
    // Refresh assignments if needed
    if (selectedAssignment.value?.student_status === 'pending') {
      await fetchStudentData();
    }

  } catch (error) {
    console.error('Error saving progress:', error);
    toast.error('Failed to save progress. Please try again.');
  }
}

// Modify handleModalClose to handle timer
const handleModalClose = () => {
  stopTimer();  // Stop the timer when closing with X button
  assignmentModal.value?.hide();
}

// Update fetchStudentData function
const fetchStudentData = async () => {
  try {
    loading.value = true
    const schoolId = authStore.userRole?.school_id
    const studentId = authStore.userRole?.id

    console.log('Starting fetchStudentData:', { schoolId, studentId })

    if (!schoolId || !studentId) {
      toast.error('Unable to fetch student data')
      return
    }

    // Add a small delay to ensure database updates are complete
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Fetch attendance data first
    console.log('Fetching attendance data...')
    await fetchAttendanceData()
    console.log('Attendance data fetched')

    // Fetch class information
    const { data: userData, error: userError } = await supabase
      .from('user_roles')
      .select('class_id')
      .eq('id', studentId)
      .eq('school_id', schoolId)
      .single();

    if (userError) throw userError;

    if (userData?.class_id) {
      classId.value = userData.class_id;

      // Fetch class name
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('class_name')
        .eq('class_id', userData.class_id)
        .eq('school_id', schoolId)
        .single();

      if (classError) throw classError;
      if (classData) studentClassName.value = classData.class_name;

      // Fetch class teachers
      const { data: teachersData, error: teachersError } = await supabase
        .from('user_roles')
        .select('username')
        .eq('class_id', userData.class_id)
        .eq('school_id', schoolId)
        .eq('role', 'teacher');

      if (teachersError) throw teachersError;
      if (teachersData) {
        classTeachers.value = teachersData
          .map(teacher => teacher.username)
          .filter(name => name);
      }

      // Fetch assignments with questions and options
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('assignments')
      .select(`
        *,
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
          ),
          student_responses (
            id,
            selected_option_id
          )
        ),
        assignment_status (
          id,
          assignment_id,
          student_id,
          status,
          submitted_at,
          created_at,
          updated_at
        ),
        assignment_scores (
          score,
          max_score
        )
      `)
      .eq('class_id', userData.class_id)
      .eq('school_id', schoolId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        throw assignmentsError;
      }

    if (assignmentsData) {
      console.log('[DEBUG] Raw assignments data:', assignmentsData);
      
      assignments.value = assignmentsData.map((assignment: Assignment): ProcessedAssignment => {
        // Filter status records for this student and get the most recent one
        const studentStatuses = assignment.assignment_status?.filter(
          status => status.student_id === studentId
        ) || [];
        
        console.log('[DEBUG] Student statuses for assignment', assignment.id, ':', studentStatuses);
        
        const latestStatus = studentStatuses.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0];

        // Get the score from assignment_scores
        const assignmentScore = assignment.assignment_scores?.[0] || {
          score: 0,
          max_score: assignment.total_points
        };

        console.log('[DEBUG] Latest status for assignment', assignment.id, ':', latestStatus);
        
        const processedAssignment = {
          ...assignment,
          student_status: latestStatus?.status || 'pending',
          score: assignmentScore.score,
          max_score: assignmentScore.max_score,
          questions: assignment.assignment_questions?.map((question: AssignmentQuestion) => ({
            id: question.id,
            question_text: question.question_text,
            points: question.points,
            question_order: question.question_order,
            options: question.question_options?.sort((a: QuestionOption, b: QuestionOption) => 
              a.option_order - b.option_order
            ) || [],
            student_response: question.student_responses?.[0]
          }))?.sort((a, b) => a.question_order - b.question_order) || []
        };
        
        console.log('[DEBUG] Processed assignment', assignment.id, ':', {
          id: processedAssignment.id,
          student_status: processedAssignment.student_status,
          score: processedAssignment.score,
          max_score: processedAssignment.max_score,
          latestStatus: latestStatus
        });
        
        return processedAssignment;
      });
      
      console.log('[DEBUG] Final processed assignments with statuses:', 
        assignments.value.map(a => ({ 
          id: a.id, 
          title: a.title, 
          student_status: a.student_status 
        }))
      );
      }
    }

  } catch (error) {
    console.error('Error fetching student data:', error);
    toast.error('Failed to load student data');
  } finally {
    loading.value = false;
  }
};

// Add this to the fetchStudentData function, inside the try block
const fetchAttendanceData = async () => {
  // @ts-ignore - Accessing identification field which might not be in the type definition
  const studentId = authStore.userRole?.identification
  const schoolId = authStore.userRole?.school_id
  
  console.log('🔍 ATTENDANCE DEBUG:')
  console.log('------------------------')
  console.log('Student ID (identification):', studentId)
  console.log('School ID:', schoolId)
  console.log('------------------------')
  
  if (!studentId || !schoolId) {
    console.log('❌ ERROR: Missing studentId or schoolId')
    return
  }

  const { data: attendanceData, error: attendanceError } = await supabase
    .from('attendances')
    .select('*')
    .eq('student_id', studentId)
    .eq('school_id', schoolId)

  if (attendanceError) {
    console.error('❌ Database Error:', attendanceError)
    return
  }

  console.log('📊 Query Results:', {
    recordsFound: attendanceData?.length || 0,
    data: attendanceData
  })

  if (attendanceData && attendanceData.length > 0) {
    const present = attendanceData.filter(record => record.status === 'present').length
    const total = attendanceData.length
    
    presentDays.value = present
    absentDays.value = total - present
    totalDays.value = total
  } else {
    console.log('❌ No attendance records found for this student')
    presentDays.value = 0
    absentDays.value = 0
    totalDays.value = 0
  }
}

// Make sure we're calling this at the right time
onMounted(async () => {
  console.log('[DEBUG] Component mounted, initializing attendance data...')
  await fetchAttendanceData()
})

// Also call it when auth state changes
watch(() => authStore.isAuthenticated, async (newValue) => {
  console.log('[DEBUG] Auth state changed:', newValue)
  if (newValue) {
    await fetchAttendanceData()
  }
})

// Watch for changes in userRole
watch(() => authStore.userRole, async (newValue) => {
  console.log('[DEBUG] UserRole changed:', newValue)
  if (newValue?.id) {
    await fetchAttendanceData()
  }
}, { deep: true })

// Add beforeunload event handler
onMounted(async () => {
  // Initialize Bootstrap modal
  const modalElement = document.getElementById('assignmentModal')
  if (modalElement) {
    assignmentModal.value = new Modal(modalElement, {
      backdrop: 'static',
      keyboard: false
    })
  }

  // Add page refresh/close handler
  window.addEventListener('beforeunload', handlePageUnload);

  await fetchStudentData()
})

// Clean up timer and event listeners on component unmount
onUnmounted(() => {
  stopTimer();
  window.removeEventListener('beforeunload', handlePageUnload);
  if (assignmentModal.value) {
    assignmentModal.value.dispose()
    assignmentModal.value = null
  }
})

// Add page unload handler
const handlePageUnload = async (event: BeforeUnloadEvent) => {
  if (selectedAssignment.value?.student_status === 'pending' && remainingTime.value) {
    try {
      // Save current timer state before page unload
      const studentId = authStore.userRole?.id;
      if (studentId && selectedAssignment.value) {
        await supabase
          .from('assignment_status')
          .update({
            remaining_time: remainingTime.value,
            updated_at: new Date().toISOString()
          })
          .eq('assignment_id', selectedAssignment.value.id)
          .eq('student_id', studentId);
      }
    } catch (error) {
      console.error('Error saving timer state on page unload:', error);
    }
    
    // Show warning message to user
    event.preventDefault();
    event.returnValue = 'You have an ongoing test. Are you sure you want to leave?';
    return event.returnValue;
  }
};

// Add these helper functions in the script section:
const getScoreClass = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return 'excellent';
  if (percentage >= 75) return 'good';
  if (percentage >= 60) return 'average';
  return 'needs-improvement';
};

const getTimeDifference = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    const hours = Math.floor((diffInMinutes % 1440) / 60);
    return `${days}d ${hours}h`;
  }
};

// Add computed property to check if assignment is expired
const isAssignmentExpired = (dueDate: string) => {
  return new Date(dueDate) < new Date();
};

// First add the computed properties
const pastDueAssignments = computed(() => {
  return assignments.value.filter(assignment => {
    const isPending = assignment.student_status === 'pending'
    const dueDate = assignment.due_date ? new Date(assignment.due_date) : null
    const now = new Date()
    
    // Count if pending AND has due date that has passed
    return isPending && dueDate && dueDate < now
  }).length
})

const averageScore = computed(() => {
  const completedWithScores = assignments.value.filter(assignment => 
    assignment.student_status === 'completed' && assignment.score !== null
  )
  
  if (completedWithScores.length === 0) return 0
  
  const totalScore = completedWithScores.reduce((sum, assignment) => 
    sum + (assignment.score || 0), 0
  )
  
  return Math.round(totalScore / completedWithScores.length)
})

// Format time from 24-hour to 12-hour format
const formatTime = (time: string) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Fetch class schedules
const fetchClassSchedules = async () => {
  try {
    const schoolId = authStore.userRole?.school_id || authStore.getSelectedSchoolId
    const classId = authStore.userRole?.class_id

    if (!schoolId || !classId) {
      console.error('Missing school_id or class_id')
      return
    }

    // Get current day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const currentDay = days[new Date().getDay()]

    const { data, error } = await supabase
      .from('class_schedules')
      .select('id, subject_name, teacher_name, day_of_week, start_time, end_time')
      .eq('school_id', schoolId)
      .eq('class_id', classId)
      .eq('day_of_week', currentDay)
      .eq('is_active', true)
      .order('start_time', { ascending: true })

    if (error) throw error

    classSchedules.value = data || []
  } catch (error) {
    console.error('Error fetching class schedules:', error)
  }
}

onMounted(() => {
  fetchClassSchedules()
})
</script>

<style lang="scss" scoped>
.students-view {
  background-color: var(--background);
  min-height: 100vh;

  .container {
    max-width: 1400px;
    padding: 2rem 1.5rem;
    margin: 0 auto;

    @media (max-width: 768px) {
      padding: 1rem;
    }
  }

  .section-header {
    margin-bottom: 2rem;

    .class-info-card {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%);
      border-radius: 1.5rem;
      padding: 2.5rem;
      color: white;
      box-shadow: 0 10px 30px rgba(var(--primary-rgb), 0.15);

      @media (max-width: 768px) {
        padding: 1.5rem;
        border-radius: 1rem;
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: 2rem;

        @media (min-width: 768px) {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }

        .class-details {
          flex: 1;

          h1 {
            font-size: 2.25rem;
            margin-bottom: 1rem;
            font-weight: 700;
            letter-spacing: -0.5px;

            @media (max-width: 768px) {
              font-size: 1.75rem;
            }
          }

          .meta-info {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: center;

            .badge {
              padding: 0.5rem 1rem;
              font-size: 0.875rem;
              border-radius: 2rem;
              background: rgba(255, 255, 255, 0.2);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .teacher-info {
              font-size: 0.875rem;
              opacity: 0.9;
            }
          }
        }

        .quick-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);

          @media (max-width: 768px) {
            gap: 1rem;
            padding: 1rem;
          }

          .stat-item {
            text-align: center;
            padding: 0.5rem;

            .stat-value {
              font-size: 2.25rem;
              font-weight: 700;
              line-height: 1.2;
              margin-bottom: 0.5rem;
              background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%);
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;

              @media (max-width: 768px) {
                font-size: 1.75rem;
              }
            }

            .stat-label {
              font-size: 0.875rem;
              opacity: 0.9;
              font-weight: 500;
            }
          }
        }
      }
    }
  }

  .content-card {
    background: white;
    border-radius: 1.25rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    height: 100%;
    overflow: hidden;

    &.assignments-section {
      height: 920px;

      .card-body {
        height: calc(100% - 80px);
        overflow-y: auto;
        padding: 1.5rem;
        
        scrollbar-width: thin;
        scrollbar-color: var(--primary) var(--background-light);

        &::-webkit-scrollbar {
          width: 8px;
        }

        &::-webkit-scrollbar-track {
          background: var(--background-light);
        }

        &::-webkit-scrollbar-thumb {
          background-color: var(--primary);
          border-radius: 4px;
          border: 2px solid var(--background-light);
        }
      }
    }

    .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
      background: white;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
        color: var(--text);
        display: flex;
        align-items: center;
        gap: 0.5rem;

        i {
          color: var(--primary);
        }
      }

      .header-actions {
        .btn {
          border-radius: 2rem;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          border-color: var(--border);
          color: var(--primary);

          &:hover {
            background-color: var(--primary);
            border-color: var(--primary);
            color: white;
          }
        }
      }
    }
  }

  .assignments-section {
    .assignments-list {
      .assignment-item {
        background: white;
        border-radius: 1rem;
        margin-bottom: 1.5rem;
        border: 1px solid var(--border);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        overflow: hidden;
        
        &:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
        }

        &.completed {
          border-left: 5px solid var(--primary);
          
          .assignment-content {
            border-left: none;
          }
        }
        
        &.expired {
          border-left: 5px solid var(--danger);
          
          .assignment-content {
            border-left: none;
          }
        }

        .assignment-content {
          padding: 1.5rem;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 1.5rem;
          align-items: start;
          
          .status-badge {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0.75rem;
            border-radius: 0.75rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            min-width: 90px;
            
            i {
              font-size: 1.25rem;
              margin-bottom: 0.5rem;
            }
            
            &.status-completed {
              background-color: rgba(var(--primary-rgb), 0.1);
              color: var(--primary);
            }
            
            &.status-pending {
              background-color: rgba(var(--info-rgb), 0.1);
              color: var(--info);
            }
            
            &.status-expired {
              background-color: rgba(var(--danger-rgb), 0.1);
              color: var(--danger);
            }
          }
          
          .assignment-details {
            display: flex;
            flex-direction: column;
            
            .assignment-header {
              display: flex;
              align-items: center;
              gap: 1rem;
              margin-bottom: 0.5rem;
              
              h3 {
                font-size: 1.15rem;
                font-weight: 600;
                color: var(--text);
                margin: 0;
              }
              
              .assignment-badges {
                display: flex;
                gap: 0.5rem;
                
                .new-badge {
                  background: #3b82f6;
                  color: white;
                  padding: 0.25rem 0.5rem;
                  border-radius: 1rem;
                  font-size: 0.75rem;
                  font-weight: 600;
                  display: inline-flex;
                  align-items: center;
                  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.4);
                  letter-spacing: 0.5px;
                  text-transform: uppercase;
                  animation: pulse-badge 2s infinite;
                }

                @keyframes pulse-badge {
                  0% {
                    transform: scale(1);
                  }
                  50% {
                    transform: scale(1.05);
                  }
                  100% {
                    transform: scale(1);
                  }
                }
              }
            }
            
            .description {
              color: var(--text-light);
              font-size: 0.9rem;
              line-height: 1.5;
              margin-bottom: 1rem;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .meta-info {
              display: flex;
              flex-wrap: wrap;
              gap: 1rem;
              margin-top: auto;
              
              .meta-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.8rem;
                color: var(--text-light);
                background: var(--background-light);
                padding: 0.35rem 0.75rem;
                border-radius: 2rem;
                
                i {
                  color: var(--primary);
                  font-size: 0.85rem;
                }
                
                .text-danger {
                  color: var(--danger) !important;
                  
                  & + i {
                    color: var(--danger);
                  }
                }
              }
            }
          }
          
          .assignment-actions {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            
            .btn-action {
              border: none;
              padding: 0.75rem 1.25rem;
              border-radius: 0.5rem;
              font-weight: 500;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
              transition: all 0.2s ease;
              font-size: 0.85rem;
              min-width: 110px;
              
              i {
                font-size: 0.9rem;
              }
              
              &.btn-view {
                background: white;
                color: var(--primary);
                border: 2px solid var(--primary);
                font-weight: 600;
                box-shadow: 0 2px 4px rgba(var(--primary-rgb), 0.2);
                
                i {
                  color: var(--primary);
                }
                
                &:disabled {
                  opacity: 0.6;
                  cursor: not-allowed;
                }
              }
              
              &.btn-submit {
                background: var(--primary);
                color: white;
                
                &:disabled {
                  background: var(--danger-light);
                  color: var(--danger);
                  opacity: 0.8;
                  cursor: not-allowed;
                }
              }
            }
          }
        }
        
        @media (max-width: 768px) {
          .assignment-content {
            grid-template-columns: 1fr;
            padding: 1rem;
            gap: 1rem;
            
            .status-badge {
              flex-direction: row;
              width: 100%;
              min-width: 0;
              padding: 0.5rem 0.75rem;
              
              i {
                margin-bottom: 0;
                margin-right: 0.5rem;
              }
            }
            
            .assignment-actions {
              flex-direction: row;
              width: 100%;
              
              .btn-action {
                flex: 1;
              }
            }
          }
        }
      }
    }
  }

  .upcoming-tests {
    .test-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--background-light);
      border-radius: 1rem;
      margin-bottom: 1rem;

      .test-date {
        background: var(--primary);
        color: white;
        padding: 0.75rem;
        border-radius: 0.75rem;
        text-align: center;
        min-width: 70px;

        .day {
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1;
          display: block;
          margin-bottom: 0.25rem;
        }

        .month {
          font-size: 0.75rem;
          text-transform: uppercase;
          opacity: 0.9;
        }
      }

      .test-details {
        flex: 1;

        h4 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: var(--text);
        }

        p {
          font-size: 0.875rem;
          color: var(--text-light);
          margin-bottom: 0.5rem;
        }

        .time {
          font-size: 0.75rem;
          color: var(--text-lighter);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-lighter);

    i {
      color: var(--border);
      margin-bottom: 1rem;
    }

    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text);
    }

    p {
      font-size: 0.875rem;
    }
  }

  .loading-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-lighter);

    .spinner-border {
      color: var(--primary);
      margin-bottom: 1rem;
      width: 3rem;
      height: 3rem;
    }

    p {
      font-size: 0.875rem;
      color: var(--text-lighter);
      margin: 0;
    }
  }
}

.modal {
  &.show {
    display: flex !important;
    align-items: center;
  }

  .modal-dialog {
    max-width: 800px;
    height: 80vh;
    margin: 1rem auto;
    display: flex;
    width: 100%;

    @media (max-width: 768px) {
      height: 95vh;
      margin: 0.5rem;
      max-width: calc(100% - 1rem);
      width: calc(100% - 1rem);
    }

    @media (max-height: 600px) {
      height: 95vh;
      margin: 0.5rem auto;
              }
            }

  .modal-content {
    border: none;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 100%;

    @media (max-width: 768px) {
      border-radius: 12px;
    }

    .modal-header {
      padding: 1.5rem 2rem;
      background: white;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);

      @media (max-width: 768px) {
        padding: 1rem 1.25rem;
      }

      // Make close button white
      .btn-close {
        background-color: var(--primary) !important;
        color: white;
        opacity: 1;
        padding: 0.75rem;
        border-radius: 50%;
        
        &::before {
          color: white;
        }
        
        // Create a white X
        background: var(--primary) url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='white'%3e%3cpath d='M.293.293a1 1 0 011.414 0L8 6.586 14.293.293a1 1 0 111.414 1.414L9.414 8l6.293 6.293a1 1 0 01-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 01-1.414-1.414L6.586 8 .293 1.707a1 1 0 010-1.414z'/%3e%3c/svg%3e") center/0.75em auto no-repeat;
      }

      .modal-title-wrapper {
        flex: 1;
        margin-right: 1rem;

        .header-content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1.5rem;
          width: 100%;

          @media (max-width: 768px) {
            flex-direction: column;
            gap: 1rem;
          }

          .title-section {
            flex: 1;
            min-width: 0;

            .modal-title {
              font-size: 1.5rem;
              font-weight: 600;
              color: #1a1a1a;
              margin: 0 0 0.75rem 0;
              line-height: 1.2;

              @media (max-width: 768px) {
                font-size: 1.25rem;
              }
            }

            .badges-container {
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;

              .subject-badge,
              .due-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.375rem;
                padding: 0.375rem 0.75rem;
                border-radius: 0.75rem;
                font-size: 0.875rem;
                font-weight: 500;
                line-height: 1;
                white-space: nowrap;
              }

              .subject-badge {
                background: #f0fdf4;
                color: #42b883;
                border: 1.5px solid #42b883;
              }

              .due-badge {
                background: #f1f5f9;
                color: #64748b;
                border: 1.5px solid #94a3b8;

                i {
                  color: #64748b;
                }
              }

              @media (max-width: 768px) {
                .subject-badge,
                .due-badge {
                  font-size: 0.75rem;
                  padding: 0.25rem 0.625rem;
                }
              }
            }
          }

          .timer-section {
            .timer-countdown {
              background: #fff1f2;
              border: 2px solid #e11d48;
              border-radius: 1rem;
              padding: 0.75rem 1.25rem;
              min-width: 180px;
              box-shadow: 0 4px 6px rgba(225, 29, 72, 0.1);

              .timer-label {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #e11d48;
                margin-bottom: 0.25rem;
                font-weight: 600;
              }

              .timer-value {
                font-size: 1.5rem;
                font-weight: 700;
                color: #e11d48;
                display: flex;
                align-items: center;
                gap: 0.5rem;

                i {
                  font-size: 1.25rem;
                }
              }

              &.time-warning {
                animation: pulse 1.5s ease-in-out infinite;
                background: #fecdd3;
                border-color: #be123c;

                .timer-value {
                  color: #be123c;
                }
              }

              @keyframes pulse {
                0% {
                  transform: scale(1);
                }
                50% {
                  transform: scale(1.02);
                  box-shadow: 0 6px 12px rgba(225, 29, 72, 0.2);
                }
                100% {
                  transform: scale(1);
                }
              }

              @media (max-width: 768px) {
                width: 100%;
                min-width: 0;
                padding: 0.5rem 1rem;

                .timer-value {
                  font-size: 1.25rem;

                  i {
                    font-size: 1rem;
                  }
                }
              }
            }
          }
        }
      }
    }

    .modal-body {
      padding: 0;
      flex: 1;
      overflow: hidden;
      display: flex;

      .quiz-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;

        .quiz-progress {
          background: white;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          flex-shrink: 0;

          @media (max-width: 768px) {
            padding: 1rem 1.25rem;
          }

          .progress-stats {
            display: flex;
            justify-content: space-between;
            align-items: center;
      margin-bottom: 1rem;

            .total-points, .questions-count {
              font-size: 0.875rem;
              color: #4b5563;
              display: flex;
              align-items: center;
              gap: 0.5rem;

              i {
                color: #42b883;
    }
  }

            .timer-countdown {
              font-size: 0.875rem;
              color: #e11d48;
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.25rem 0.75rem;
              background: #fff1f2;
              border-radius: 1rem;
              border: 1.5px solid #e11d48;
              font-weight: 600;
              box-shadow: 0 2px 4px rgba(225, 29, 72, 0.1);
              transition: all 0.2s ease;
              margin-left: auto;

              i {
                color: #e11d48;
                font-size: 0.875rem;
              }

              &.time-warning {
                animation: pulse 1.5s ease-in-out infinite;
                background: #fecdd3;
              }

              @keyframes pulse {
                0% {
                  transform: scale(1);
                }
                50% {
                  transform: scale(1.03);
                  box-shadow: 0 4px 8px rgba(225, 29, 72, 0.2);
                }
                100% {
                  transform: scale(1);
                }
              }

              @media (max-width: 768px) {
                font-size: 0.75rem;
                padding: 0.25rem 0.5rem;
                
                i {
                  font-size: 0.75rem;
                }
              }
            }

            .progress-percentage {
              font-size: 0.875rem;
              font-weight: 500;
              color: #42b883;
            }
          }

          .progress {
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
    overflow: hidden;

            .progress-bar {
              background: #42b883;
              transition: width 0.3s ease;
            }
          }
        }

        .quiz-section {
          padding: 1.5rem 2rem;

          @media (max-width: 768px) {
            padding: 1rem 1.25rem;
          }

          &.instructions-section {
      background: white;
            margin-bottom: 1rem;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            flex-shrink: 0;

            .section-header {
              display: flex;
              align-items: center;
              gap: 0.75rem;
              margin-bottom: 1rem;
              padding-bottom: 1rem;
              border-bottom: 1px solid rgba(0, 0, 0, 0.05);

              i {
                color: #42b883;
                font-size: 1.25rem;
      }

              h6 {
        font-size: 1.1rem;
                font-weight: 600;
        margin: 0;
                color: #1a1a1a;
              }
            }

            .instructions-content {
              .instructions-text {
                color: #4b5563;
                font-size: 0.9375rem;
                line-height: 1.6;
                margin-bottom: 1.5rem;
    }

              .instructions-meta {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;

                .meta-item {
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                  padding: 0.75rem;
                  background: #f8fafc;
                  border-radius: 12px;
                  font-size: 0.875rem;
                  color: #4b5563;

                  i {
                    color: #42b883;
                    font-size: 1rem;
      }
    }
  }
            }
          }

          &.questions-section {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            padding: 0;

            .questions-navigation {
              flex-shrink: 0;
              position: sticky;
              top: 0;
              z-index: 1;
              background: #f8fafc;
              display: flex;
              gap: 0.5rem;
              margin-bottom: 1.5rem;
              padding: 1rem 2rem;
              border-bottom: 1px solid rgba(0, 0, 0, 0.05);
              overflow-x: auto;
              scrollbar-width: none;
              -ms-overflow-style: none;

              &::-webkit-scrollbar {
                display: none;
              }

              .nav-dot {
                min-width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 2px solid #e5e7eb;
                background: white;
                color: #6b7280;
                font-size: 0.875rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;

                &:hover {
                  border-color: #42b883;
                  color: #42b883;
        }

                &.active {
                  background: #42b883;
                  border-color: #42b883;
                  color: white;
                }

                &.answered {
                  background: #f0fdf4;
                  border-color: #42b883;
                  color: #42b883;
                }
              }
            }

            .questions-container {
              flex: 1;
              overflow-y: auto;
              padding: 0 2rem 2rem;
              
              /* Custom scrollbar styles */
              scrollbar-width: thin;
              scrollbar-color: #42b883 #f8fafc;

              &::-webkit-scrollbar {
                width: 8px;
              }

              &::-webkit-scrollbar-track {
                background: #f8fafc;
              }

              &::-webkit-scrollbar-thumb {
                background-color: #42b883;
                border-radius: 4px;
                border: 2px solid #f8fafc;
              }

              .question-card {
                background: white;
                border-radius: 16px;
            padding: 1.5rem;
                margin-bottom: 1rem;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                transition: transform 0.2s ease, box-shadow 0.2s ease;

                &:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  }

                .question-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 1.5rem;

                  .question-meta {
                    display: flex;
                    align-items: center;
                    gap: 1rem;

                    .question-number {
                      font-weight: 600;
                      color: #42b883;
                      font-size: 1rem;
                    }

                    .question-points {
                      font-size: 0.875rem;
                      color: #6b7280;
                      background: #f8fafc;
                      padding: 0.375rem 0.75rem;
                      border-radius: 1rem;
                      display: flex;
                      align-items: center;
                      gap: 0.375rem;

                      i {
                        color: #42b883;
                      }
                    }
                  }

                  .question-status {
                    font-size: 0.875rem;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    padding: 0.375rem 0.75rem;
                    background: #f8fafc;
                    border-radius: 1rem;
                    border: 1px solid #e5e7eb;

                    &.answered {
                      background: #f0fdf4;
                      border-color: #42b883;
                      color: #42b883;

                      i {
                        color: #42b883;
                      }
                    }
                  }
                }

                .question-content {
                  .question-text {
                    font-size: 1rem;
                    color: #1a1a1a;
      margin-bottom: 1.5rem;
                    line-height: 1.6;
                  }

                  .options-grid {
                    display: grid;
                    gap: 0.75rem;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));

                    .option-card {
                      cursor: pointer;
                      margin: 0;

                      .option-input {
                        display: none;

                        &:checked + .option-content {
                          background: #f0fdf4;
                          border-color: #42b883;

                          .option-indicator {
                            background: #42b883;
                            border-color: #42b883;

                            i {
                              opacity: 1;
                              transform: scale(1);
        }
                          }
                        }
                      }
                    }

                    .option-content {
                      display: flex;
                      align-items: center;
                      gap: 1rem;
                      padding: 1rem 1.25rem;
                      background: #f8fafc;
                      border: 2px solid #e5e7eb;
                      border-radius: 12px;
                      transition: all 0.2s ease;

                      &:hover {
                        border-color: #42b883;
                      }

                      .option-indicator {
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        border: 2px solid #d1d5db;
                        background: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s ease;

                        i {
                          color: white;
                          opacity: 0;
                          transform: scale(0.5);
                          transition: all 0.2s ease;
                        }
                      }

                      .option-text {
                        flex: 1;
                        font-size: 0.9375rem;
                        color: #4b5563;
                      }
                    }
          }
        }
      }
    }
  }
}

        .quiz-actions {
          flex-shrink: 0;
          position: sticky;
          bottom: 0;
          background: white;
          padding: 1.25rem 2rem;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;

          @media (max-width: 768px) {
            padding: 1rem 1.25rem;
            flex-direction: column;
            gap: 1rem;

            .action-info {
  text-align: center;
            }

            .action-buttons {
              width: 100%;
              
              .action-btn {
                flex: 1;
                justify-content: center;
              }
            }
          }

          .action-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #6b7280;
            font-size: 0.875rem;

            i {
              color: #42b883;
            }
          }

          .action-buttons {
            display: flex;
            gap: 0.75rem;

            .action-btn {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.75rem 1.25rem;
              border-radius: 10px;
              font-size: 0.9375rem;
              font-weight: 500;
              transition: all 0.2s ease;

              &.btn-secondary {
                background-color: var(--primary);
                color: white;
                border-color: var(--primary);
                
                i {
                  color: white;
                }
                
                &:hover {
                  background-color: darken(#42b883, 10%);
                  border-color: darken(#42b883, 10%);
                }
              }

              &.btn-primary {
                background: #42b883;
                border: none;
                color: white;

                &:hover {
                  background: #3aa876;
                  transform: translateY(-1px);
                }
              }

              i {
                font-size: 0.875rem;
              }
            }
          }
        }
      }
    }
  }
}

.completed-assignments {
  .completed-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .completed-item {
    background: white;
    border-radius: 0.75rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    }

    .assignment-info {
      .main-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;

        .title-section {
          flex: 1;
          min-width: 0;

          h4 {
            font-size: 1rem;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 0.5rem 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .meta-info {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;

            span {
              display: inline-flex;
              align-items: center;
              gap: 0.25rem;
              padding: 0.25rem 0.5rem;
              background: #f8fafc;
              border-radius: 1rem;
              font-size: 0.75rem;
              color: #4b5563;
              border: 1px solid #e5e7eb;

              i {
                color: #42b883;
                font-size: 0.75rem;
              }
            }
          }
        }

        .score-display {
          padding: 0.75rem 1.25rem;
          border-radius: 0.75rem;
          text-align: center;
          min-width: 100px;
          
          &.excellent {
            background: #ecfdf5;
            .score-percentage { color: #059669; }
          }
          
          &.good {
            background: #f0fdf4;
            .score-percentage { color: #16a34a; }
          }
          
          &.average {
            background: #fef3c7;
            .score-percentage { color: #d97706; }
          }
          
          &.needs-improvement {
            background: #fee2e2;
            .score-percentage { color: #dc2626; }
          }

          .score-percentage {
            font-size: 1.5rem;
            font-weight: 700;
            line-height: 1;
            margin-bottom: 0.25rem;
          }

          .score-points {
            font-size: 0.75rem;
            font-weight: 500;
            color: #4b5563;
          }
        }
      }

      .action-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 0.75rem;
        padding-top: 0.75rem;
        border-top: 1px solid #e5e7eb;

        .completion-date {
          font-size: 0.75rem;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 0.25rem;

          i {
            color: #42b883;
            font-size: 0.75rem;
          }
        }

        .btn-review {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.75rem;
          background: #42b883;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: #3aa876;
          }

          i {
            font-size: 0.75rem;
          }
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 0.75rem;
    border: 2px dashed #e5e7eb;

    i {
      color: #42b883;
      opacity: 0.5;
      margin-bottom: 1rem;
    }

    h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #1a1a1a;
    }

    p {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
    }
  }
}

.option-card {
  &.disabled {
    pointer-events: none;
    opacity: 0.8;
    cursor: default;
    
    .option-content {
      background: #f8f9fa;
      border-color: #e5e7eb;
    }
  }

  &.correct {
    .option-content {
      background: #f0fdf4;
      border-color: #42b883;
      
      .option-indicator {
        background: #42b883;
        border-color: #42b883;
        
        i {
          color: white;
          opacity: 1;
          transform: scale(1);
        }
      }
      
      .option-text {
        color: #166534;
      }
    }
  }

  &.incorrect {
    .option-content {
      background: #fef2f2;
      border-color: #ef4444;
      
      .option-indicator {
        background: #ef4444;
        border-color: #ef4444;
        
        i {
          color: white;
          opacity: 1;
          transform: scale(1);
        }
      }
      
      .option-text {
        color: #991b1b;
      }
    }
  }
}

.new-badge {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.4);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  animation: pulse-badge 2s infinite;
}

@keyframes pulse-badge {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.modal-title-wrapper {
  .d-flex {
    flex-wrap: wrap;
    row-gap: 0.5rem;
  }

  .subject-badge, 
  .due-badge {
    white-space: nowrap;
  }
}

// Add these styles
.assignment-item {
  &.expired {
    background: #fee2e2;
    border-color: #ef4444;
    
    .status-indicator {
      background: #ef4444;
    }
    
    .meta-info {
      .due-date {
        &.text-danger {
          color: #dc2626;
          border-color: #dc2626;
          background: #fee2e2;
          
          i {
            color: #dc2626;
          }
        }
      }
    }
  }
}

.expired-badge {
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.btn-action {
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      background: inherit;
    }
  }
}

// Add CSS to make the grid look better
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 0.5rem;

  .stat-item {
    background: var(--background-light);
    border-radius: 0.75rem;
    padding: 1.25rem;
    text-align: center;
    transition: all 0.3s ease;
    border: 1px solid var(--border);

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      border-color: var(--primary);
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.25rem;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .stat-label {
      color: var(--text-light);
      font-size: 0.875rem;
      font-weight: 500;
    }
  }
}

.performance-stats-card {
  position: sticky;
  top: 1rem;
  height: 450px !important; // Half of assignments card (920px/2) - 10px for margin
  margin-bottom: 20px; // Increased margin for better spacing
  display: flex;
  flex-direction: column;

  .card-header {
    padding: 0.75rem;
    h2 {
      font-size: 1rem;
      margin: 0;
    }
  }

  .card-body {
    flex: 1;
    display: flex;
    padding: 0.5rem;
    min-height: 0; // Important for flex child
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    width: 100%;
    padding: 0.5rem;

    .stat-item {
      background: white;
      border-radius: 0.75rem;
      padding: 1.25rem 0.75rem;
      text-align: center;
      border: 2px solid var(--border);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 0; // Important for flex child
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, var(--primary) 0%, var(--primary-dark, darken(#42b883, 10%)) 100%);
      }

      .stat-value {
        font-size: 2.25rem;
        font-weight: 700;
        color: var(--text);
        margin-bottom: 0.5rem;
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark, darken(#42b883, 10%)) 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        line-height: 1;
      }

      .stat-label {
        color: var(--text);
        font-size: 0.9rem;
        font-weight: 500;
        line-height: 1.2;
      }
    }
  }
}

// Update the completed assignments card
.content-card {
  &.completed-assignments-card {
    height: 600px; // Match performance stats card height
    display: flex;
    flex-direction: column;

    .card-body {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }
  }

  // Add styles for upcoming tests card
  &.upcoming-tests-card {
    height: 450px; // Match performance stats card height
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;

    .card-body {
      flex: 1;
      overflow-y: auto;
      padding: 0.75rem;
      
      /* Custom scrollbar styles */
      scrollbar-width: thin;
      scrollbar-color: #42b883 #f8fafc;

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        background: #f8fafc;
      }

      &::-webkit-scrollbar-thumb {
        background-color: #42b883;
        border-radius: 4px;
        border: 2px solid #f8fafc;
      }
    }

    .upcoming-tests {
      .test-item {
        padding: 0.75rem;
        border-radius: 0.5rem;
        background: #f8f9fa;
        margin-bottom: 0.5rem;
        border: 1px solid #e9ecef;
        display: flex;
        align-items: center;
        gap: 0.75rem;

        &:last-child {
          margin-bottom: 0;
        }

        .test-date {
          background: #42b883;
          color: white;
          padding: 0.5rem;
          border-radius: 0.4rem;
          text-align: center;
          min-width: 50px;
          
          .day {
            font-size: 1.1rem;
            font-weight: 700;
            display: block;
            line-height: 1;
          }
          
          .month {
            font-size: 0.75rem;
            display: block;
            opacity: 0.9;
            text-transform: uppercase;
            margin-top: 0.2rem;
          }
        }

        .test-details {
          flex: 1;
          min-width: 0;

          h4 {
            font-size: 0.9rem;
            margin: 0 0 0.25rem;
            font-weight: 600;
          }

          p {
            font-size: 0.8rem;
            margin: 0 0 0.25rem;
            color: #666;
          }

          .time {
            font-size: 0.75rem;
            color: #666;
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }
        }
      }
    }
  }
}

.completed-assignments {
  height: 100%;
}

.empty-schedule {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;

  i {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #42b883;
    opacity: 0.5;
  }

  p {
    font-size: 0.9375rem;
    margin: 0;
  }
}
</style> 
