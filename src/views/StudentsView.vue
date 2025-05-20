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
                <div class="stat-label">Pending Tasks</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ completedAssignments }}</div>
                <div class="stat-label">Completed</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ attendancePercentage }}%</div>
                <div class="stat-label">Attendance</div>
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
                     :class="{ 'completed': assignment.student_status === 'completed' }"
                >
                  <div class="assignment-content">
                    <div class="status-indicator"></div>
                    <div class="assignment-details">
                      <h3>{{ assignment.title }}</h3>
                      <p>{{ assignment.description }}</p>
                      <div class="meta-info">
                        <span class="due-date">
                          <i class="far fa-calendar-alt me-1"></i>
                          Due: {{ formatDate(assignment.due_date) }}
                        </span>
                        <span class="subject">
                          <i class="fas fa-book me-1"></i>
                          {{ assignment.subject }}
                        </span>
                        <span class="points">
                          <i class="fas fa-star me-1"></i>
                          {{ assignment.total_points }} points
                        </span>
                      </div>
                    </div>
                    <div class="assignment-actions">
                      <button class="btn-action btn-view" @click="viewAssignment(assignment)">
                        <i class="fas fa-eye"></i>
                        <span>View</span>
                      </button>
                      <button 
                        v-if="assignment.student_status !== 'completed'"
                        class="btn-action btn-submit" 
                        @click="submitAssignment(assignment)"
                      >
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
          <div class="content-card mb-4">
            <div class="card-header">
              <h2>
                <i class="fas fa-clipboard-list me-2"></i>
                Upcoming Tests
              </h2>
            </div>
            <div class="card-body">
              <div class="upcoming-tests">
                <div v-for="test in upcomingTests" :key="test.id" class="test-item">
                  <div class="test-date">
                    <span class="day">{{ formatDay(test.date) }}</span>
                    <span class="month">{{ formatMonth(test.date) }}</span>
                  </div>
                  <div class="test-details">
                    <h4>{{ test.subject }}</h4>
                    <p>{{ test.topic }}</p>
                    <span class="time">
                      <i class="far fa-clock me-1"></i>
                      {{ test.time }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Completed Assignments Section - Full Width -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="content-card">
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
              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="subject-badge">{{ selectedAssignment?.subject }}</span>
                <span class="due-badge">
                  <i class="far fa-clock me-1"></i>
                  Due: {{ formatDate(selectedAssignment?.due_date) }}
                </span>
            </div>
              <h5 class="modal-title">{{ selectedAssignment?.title }}</h5>
                  </div>
            <button type="button" class="btn-close" @click="handleModalClose"></button>
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
                      <div class="question-status" :class="{ 'answered': false }">
                        <i class="fas fa-circle-check"></i>
                        <span>Not answered</span>
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
                  <button class="action-btn btn-secondary" @click="closeModal">
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
import { ref, onMounted, computed, onUnmounted } from 'vue'
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
}

// Update the processed assignment interface
interface ProcessedAssignment extends Omit<Assignment, 'assignment_questions'> {
  questions: (Omit<AssignmentQuestion, 'question_options' | 'student_responses'> & {
    options: QuestionOption[]
    student_response?: StudentResponse
  })[]
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

// Attendance data
const presentDays = ref(85)
const absentDays = ref(15)
const totalDays = ref(100)
const attendancePercentage = ref(85)

// Computed
const pendingAssignments = computed(() => {
  const schoolId = authStore.userRole?.school_id;
  const studentId = authStore.userRole?.id;
  if (!schoolId || !studentId) return 0;

  return assignments.value.filter(assignment => {
    // Check if the assignment has a status of 'pending' for this specific student
    return assignment.assignment_status?.some((status: AssignmentStatus) => 
      status.status === 'pending' && 
   
      status.student_id === studentId
    );
  }).length;
})

const completedAssignments = computed(() => 
  assignments.value.filter(a => a.student_status === 'completed').length
)

const filteredAssignments = computed(() => {
  if (selectedFilter.value === 'all') {
    // Only show pending assignments by default
    return assignments.value.filter(a => a.student_status === 'pending');
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

const viewAssignment = (assignment: ProcessedAssignment) => {
  selectedAssignment.value = assignment
  
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

const submitAssignment = async (assignment: ProcessedAssignment) => {
  try {
    // 1. Validate that all questions are answered
    const unansweredQuestions = assignment.questions.filter(q => !q.student_response);
    if (unansweredQuestions.length > 0) {
      toast.warning(`Please answer all questions before submitting. ${unansweredQuestions.length} questions remaining.`);
      scrollToQuestion(unansweredQuestions[0].id);
      return;
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

    // 3. Save student responses
    const responses = assignment.questions.map(question => ({
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

    if (submissionError) {
      console.error('Error saving responses:', submissionError);
      throw submissionError;
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

    if (scoreError) {
      console.error('Error saving score:', scoreError);
      throw scoreError;
    }

    // 5. Update assignment status to completed
    // First, check if a status record exists
    const { data: existingStatus, error: checkError } = await supabase
      .from('assignment_status')
      .select('*')
      .eq('assignment_id', assignment.id)
      .eq('student_id', studentId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking status:', checkError);
      throw checkError;
    }

    let statusUpdateResult;
    const statusData = {
      assignment_id: assignment.id,
      student_id: studentId,
      status: 'completed' as const,
      submitted_at: now,
      updated_at: now
    };

    if (existingStatus) {
      // Update existing status
      const { error: updateError } = await supabase
        .from('assignment_status')
        .update(statusData)
        .eq('id', existingStatus.id)
        .eq('student_id', studentId)
        .eq('assignment_id', assignment.id);

      if (updateError) {
        console.error('Error updating status:', updateError);
        throw updateError;
      }
    } else {
      // Insert new status
      const { error: insertError } = await supabase
        .from('assignment_status')
        .insert({
          ...statusData,
          created_at: now
        });

      if (insertError) {
        console.error('Error inserting status:', insertError);
        throw insertError;
      }
    }

    // 6. Verify the status update
    const { data: verifyStatus, error: verifyError } = await supabase
      .from('assignment_status')
      .select('*')
      .eq('assignment_id', assignment.id)
      .eq('student_id', studentId)
      .single();

    if (verifyError) {
      console.error('Error verifying status:', verifyError);
      throw verifyError;
    }

    if (!verifyStatus || verifyStatus.status !== 'completed') {
      throw new Error('Status verification failed: Status not updated to completed');
    }

    // 7. Log activity
    await logActivity(
      'create',
      'assignments',
      assignment.id,
      null,
      { 
        title: assignment.title,
        score: score,
        max_score: maxScore,
        status: 'completed'
      }
    );

    // Clear loading toast and show success
    toast.clear();
    /*toast.success(`Assignment submitted successfully! Score: ${score}/${maxScore} (${Math.round(score/maxScore * 100)}%)`); */

    // 8. Close modal and refresh data
    assignmentModal.value?.hide();
    
    // Add a small delay before fetching updated data
    await new Promise(resolve => setTimeout(resolve, 1000));
    await fetchStudentData();

  } catch (error) {
    console.error('Error in submitAssignment:', error);
    toast.clear();
    toast.error('Failed to submit assignment. Please try again.');
    
    // Log detailed error for debugging
    console.error('Detailed submission error:', {
      error,
      assignmentId: assignment.id,
      studentId: authStore.userRole?.id,
      timestamp: new Date().toISOString()
    });
  }
}

const scrollToQuestion = (questionId: string) => {
  const element = document.getElementById('question-' + questionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

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

  // Progress bar will automatically update through the computed property
}

const closeModal = async () => {
  try {
    // Only perform save operations if the assignment is pending
    if (selectedAssignment.value?.student_status === 'pending') {
      // Get the student ID from auth store
      const studentId = authStore.userRole?.id;
      if (!studentId || !selectedAssignment.value) {
        assignmentModal.value?.hide();
        return;
      }

      // Get all answered questions
      const answeredQuestions = selectedAssignment.value.questions.filter(q => q.student_response);
      if (answeredQuestions.length === 0) {
        assignmentModal.value?.hide();
        return;
      }

      // Show saving toast
      toast.info('Saving your progress...', {
        timeout: false,
        closeOnClick: false,
        closeButton: false
      });

      // Get current UTC timestamp
      const now = new Date().toISOString();

      // Prepare responses for saving
      const responses = answeredQuestions.map(question => ({
        student_id: studentId,
        question_id: question.id,
        selected_option_id: question.student_response?.selected_option_id,
        created_at: now,
        updated_at: now
      }));

      // Save responses
      const { error: submissionError } = await supabase
        .from('student_responses')
        .upsert(responses, {
          onConflict: 'student_id,question_id'
        });

      if (submissionError) throw submissionError;

      // Only update assignment status if there are answered questions
      // but don't mark it as completed
      const { error: statusError } = await supabase
        .from('assignment_status')
        .upsert({
          assignment_id: selectedAssignment.value.id,
          student_id: studentId,
          status: 'pending' as const,
          submitted_at: null,
          created_at: now,
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

    // Close the modal and refresh assignments
    assignmentModal.value?.hide();
    if (selectedAssignment.value?.student_status === 'pending') {
      await fetchStudentData();
    }

  } catch (error) {
    console.error('Error saving progress:', error);
    toast.error('Failed to save progress. Please try again.');
  }
}

// Add a simple close function for the X button
const handleModalClose = () => {
  assignmentModal.value?.hide();
}

// Update fetchStudentData function
const fetchStudentData = async () => {
  try {
    loading.value = true;
    const schoolId = authStore.userRole?.school_id;
    const studentId = authStore.userRole?.id;

    if (!schoolId || !studentId) {
      toast.error('Unable to fetch student data');
      return;
    }

    // Add a small delay to ensure database updates are complete
    await new Promise(resolve => setTimeout(resolve, 1000));

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

// Initialize
onMounted(async () => {
  // Initialize Bootstrap modal
  const modalElement = document.getElementById('assignmentModal')
  if (modalElement) {
    assignmentModal.value = new Modal(modalElement, {
      backdrop: 'static',
      keyboard: false
    })
  }

  await fetchStudentData()
})

// Add cleanup in onUnmounted
onUnmounted(() => {
  if (assignmentModal.value) {
    assignmentModal.value.dispose()
    assignmentModal.value = null
  }
})

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
</script>

<style lang="scss" scoped>
.students-view {
  background-color: #f8f9fa;
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
      background: linear-gradient(135deg, #42b883 0%, #3aa876 100%);
      border-radius: 1.5rem;
      padding: 2.5rem;
      color: white;
      box-shadow: 0 10px 30px rgba(66, 184, 131, 0.15);

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
      min-height: 600px;

      .card-body {
        max-height: calc(3 * 160px + 1.5rem); // Height for 3 items plus padding
        overflow-y: auto;
        
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
    }

    &.mb-4 {
      min-height: 400px;
    }

    .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      background: white;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
        color: #1a1a1a;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        i {
          color: #42b883;
        }
      }

      .header-actions {
        .btn {
          border-radius: 2rem;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          border-color: #e5e7eb;
          color: #42b883;

          &:hover {
            background-color: #42b883;
            border-color: #42b883;
            color: white;
          }
        }
      }
    }

    .card-body {
      padding: 1.5rem;
    }
  }

  .assignments-section {
    .assignments-list {
      .assignment-item {
        height: 160px; // Fixed height for each assignment item
        background: #f8f9fa;
        border-radius: 1rem;
        margin-bottom: 1rem;
        border: 1px solid #e5e7eb;

        &.completed {
          background: #f0fdf4;
          border-color: #42b883;
          
          .status-indicator {
            background: #42b883;
          }
        }

        .assignment-content {
          padding: 1.5rem;
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;

          .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #42b883;
            margin-top: 0.5rem;
            flex-shrink: 0;
          }

          .assignment-details {
            flex: 1;
            min-width: 0; // Prevent flex item from overflowing

            h3 {
              font-size: 1.125rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
              color: #1a1a1a;
            }

            p {
              color: #4b5563;
              font-size: 0.875rem;
              margin-bottom: 1rem;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              line-clamp: 2;
              -webkit-box-orient: vertical;
            }

            .meta-info {
              display: flex;
              flex-wrap: wrap;
              gap: 1rem;
              font-size: 0.75rem;
              color: #6b7280;

              span {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                padding: 0.25rem 0.5rem;
                background: white;
                border-radius: 1rem;
                border: 1px solid #e5e7eb;

                i {
                  color: #42b883;
                }
              }

              .points {
                color: #42b883;
                font-weight: 500;
                border-color: #42b883;
                background: #f0fdf4;
              }
            }
          }

          .assignment-actions {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-left: auto;
            padding-left: 1rem;
            border-left: 1px solid #e5e7eb;

            @media (max-width: 768px) {
              flex-direction: row;
              padding-left: 0;
              border-left: none;
              margin-top: 1rem;
            }

            .btn-action {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
              padding: 0.5rem 1rem;
              border-radius: 0.5rem;
              font-size: 0.875rem;
              font-weight: 500;
              border: none;
              cursor: pointer;
              transition: transform 0.15s ease;
              min-width: 100px;

              &:active {
                transform: scale(0.95);
              }

              i {
                font-size: 0.875rem;
              }

              &.btn-view {
                background: white;
                color: #42b883;
                border: 1px solid #42b883;

                &:hover {
                  background: #f0fdf4;
                }
              }

              &.btn-submit {
                background: #42b883;
                color: white;

                &:hover {
                  background: #3aa876;
                }
              }
            }
          }

          @media (max-width: 768px) {
            flex-direction: column;
            
            .assignment-actions {
              width: 100%;
              flex-direction: row;
              justify-content: flex-end;
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
      background: #f8f9fa;
      border-radius: 1rem;
      margin-bottom: 1rem;

      .test-date {
        background: #42b883;
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
          color: #1a1a1a;
        }

        p {
          font-size: 0.875rem;
          color: #4b5563;
                margin-bottom: 0.5rem;
              }

        .time {
          font-size: 0.75rem;
          color: #6b7280;
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
    color: #6b7280;

    i {
      color: #e5e7eb;
      margin-bottom: 1rem;
    }

    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #1a1a1a;
    }

    p {
      font-size: 0.875rem;
    }
  }

  .loading-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #6b7280;

    .spinner-border {
      color: #42b883;
      margin-bottom: 1rem;
      width: 3rem;
      height: 3rem;
    }

    p {
      font-size: 0.875rem;
      color: #6b7280;
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

      .modal-title-wrapper {
        .subject-badge, .due-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #f0fdf4;
          color: #42b883;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;

          @media (max-width: 768px) {
            font-size: 0.75rem;
            padding: 0.2rem 0.6rem;
          }
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
    margin: 0;

          @media (max-width: 768px) {
            font-size: 1.25rem;
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
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                color: #4b5563;

                &:hover {
                  background: #f1f5f9;
                  border-color: #d1d5db;
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
</style> 