<template>
  <div class="schedule-view">
    <div class="container-lg py-4">
      <div class="row justify-content-center">
        <div class="col-12" style="max-width: 1200px; margin: 0 auto;">
          <!-- Modern Header Card -->
          <div class="header-card mb-4">
            <div class="d-flex justify-content-between align-items-center flex-wrap">
              <div class="header-content">
                <div class="d-flex align-items-center mb-2">
                  <button class="btn btn-outline-secondary me-3" @click="goBack">
                    <i class="fas fa-arrow-left me-2"></i>
                    Back
                  </button>
                  <h2 class="mb-0">Class Schedule</h2>
                </div>
                <div class="d-flex align-items-center">
                  <span class="badge bg-primary me-2">
                    <i class="fas fa-calendar-week me-1"></i>
                    Weekly View
                  </span>
                  <p class="text-muted mb-0">Manage and organize your class timetable efficiently</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Loading schedule...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-circle me-2"></i>
            {{ error }}
          </div>

          <!-- Schedule Grid with Shadow and Modern Design -->
          <div v-else class="schedule-container">
            <div class="schedule-scroll-container">
              <div class="schedule-grid">
                <!-- Time slots column -->
                <div class="time-slots">
                  <div class="time-slot-header">
                    <i class="far fa-clock me-2"></i>Time
                  </div>
                  <div class="time-slot" v-for="hour in timeSlots" :key="hour">
                    {{ hour }}
                  </div>
                </div>
                <!-- Days columns -->
                <div v-for="day in weekDays" :key="day" class="day-column">
                  <div class="day-header">
                    <i class="fas fa-calendar-day me-2"></i>
                    {{ day }}
                  </div>
                  <template v-for="(hour, index) in timeSlots" :key="hour">
                    <div 
                      v-if="shouldShowClass(day, hour)"
                      class="schedule-cell"
                      :class="{ 
                        'has-class': hasClass(day, hour),
                        'current-time': isCurrentTimeSlot(day, hour)
                      }"
                      :style="{
                        height: hasClass(day, hour) ? 
                          `${calculateRowSpan(getClassInfo(day, hour).start_time, getClassInfo(day, hour).end_time) * 80}px` : 
                          '80px',
                        gridRow: hasClass(day, hour) ? 
                          `span ${calculateRowSpan(getClassInfo(day, hour).start_time, getClassInfo(day, hour).end_time)}` : 
                          'auto'
                      }"
                    >
                      <template v-if="hasClass(day, hour)">
                        <div class="class-info">
                          <div class="subject-badge" :style="getSubjectColor(getClassInfo(day, hour).subject_name)">
                            <div class="subject-name">{{ getClassInfo(day, hour).subject_name }}</div>
                            <div class="teacher-info">
                              <i class="fas fa-chalkboard-teacher"></i>
                              {{ getClassInfo(day, hour).teacher_name }}
                            </div>
                            <div class="schedule-actions" v-if="isCurrentTeacher(getClassInfo(day, hour).teacher_id)">
                              <button class="action-btn edit-btn" @click.stop="editSchedule(getClassInfo(day, hour))">
                                <i class="fas fa-edit"></i>
                              </button>
                              <button class="action-btn delete-btn" @click.stop="confirmDelete(getClassInfo(day, hour))">
                                <i class="fas fa-trash-alt"></i>
                              </button>
                            </div>
                            <div class="time-info">
                              {{ formatTime(getClassInfo(day, hour).start_time) }} - {{ formatTime(getClassInfo(day, hour).end_time) }}
                            </div>
                          </div>
                        </div>
                      </template>
                      <div v-else class="empty-cell-hint">
                        <i class="fas fa-plus-circle"></i>
                      </div>
                    </div>
                    <div 
                      v-else-if="!hasClass(day, hour)"
                      class="schedule-cell empty-cell"
                      @click="openAddScheduleModal(day, hour)"
                    >
                      <div class="empty-cell-hint">
                        <i class="fas fa-plus-circle"></i>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Modal -->
    <ScheduleModal 
      ref="scheduleModal"
      :class-id="getSelectedClassId()"
      :class-schedules="classSchedules"
      @schedule-added="fetchSchedules"
      @schedule-updated="fetchSchedules"
      @fetch-schedules="fetchSchedules"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import ScheduleModal from '@/components/ScheduleModal.vue'
import { Modal } from 'bootstrap'

const router = useRouter()
const authStore = useAuthStore()

const weekDays = ref(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
const timeSlots = ref([
  '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
])

interface ClassSchedule {
  id: string
  class_id: number
  subject_name: string
  teacher_name: string
  teacher_id: string | number
  day_of_week: string
  start_time: string
  end_time: string
  room_number: string | null
  is_active: boolean
  rowSpan?: number  // Add this for calculating time slots
}

const loading = ref(true)
const error = ref<string | null>(null)
const classSchedules = ref<ClassSchedule[]>([])

// Subject colors for visual distinction
const subjectColors: { [key: string]: string } = {}
const colors = [
  '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', 
  '#0288d1', '#00796b', '#ffa000', '#5d4037'
]

const getSubjectColor = (subject: string) => {
  if (!subjectColors[subject]) {
    const colorIndex = Object.keys(subjectColors).length % colors.length
    subjectColors[subject] = colors[colorIndex]
  }
  return { '--subject-color': subjectColors[subject] }
}

// Get the selected class ID from various sources
const getSelectedClassId = (): string | number | null => {
  // First try to get from route query
  const classId = router.currentRoute.value.query.classId
  if (classId) {
    // Handle case where classId could be an array
    if (Array.isArray(classId)) {
      return classId[0] || null
    }
    return classId
  }

  // Then try to get from local storage
  const storedClassId = localStorage.getItem('selectedClassId')
  if (storedClassId) return storedClassId

  // For teachers, get their assigned class_id from their role
  if (authStore.userRole?.role?.toLowerCase() === 'teacher') {
    return authStore.userRole.class_id ?? null
  }

  return null
}

const fetchSchedules = async () => {
  try {
    loading.value = true
    error.value = null

    const classId = getSelectedClassId()
    console.log('Selected Class ID:', classId)
    console.log('User Role:', authStore.userRole)

    // Get the appropriate school ID
    const schoolId = authStore.userRole?.role?.toLowerCase() === 'teacher'
      ? authStore.userRole.school_id  // Use teacher's assigned school
      : authStore.getSelectedSchoolId // Use selected school for other roles
    
    console.log('School ID:', schoolId)

    if (!classId) {
      error.value = 'No class selected. Please select a class first.'
      return
    }

    if (!schoolId) {
      error.value = 'No school assigned. Please contact your administrator.'
      return
    }

    const { data, error: err } = await supabase
      .from('class_schedules')
      .select(`
        *,
        classes (
          class_name
        )
      `)
      .eq('class_id', classId)
      .eq('school_id', schoolId)
      .eq('is_active', true)

    if (err) {
      console.error('Supabase error:', err)
      throw err
    }

    console.log('Fetched schedules:', data)
    classSchedules.value = data || []
  } catch (err) {
    console.error('Error fetching schedules:', err)
    error.value = 'Failed to load class schedules. Please try again later.'
  } finally {
    loading.value = false
  }
}

const formatTime = (time: string) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

// Add helper functions for time calculations
const convertTo24Hour = (timeStr: string) => {
  const [time, period] = timeStr.split(' ')
  const [hours, minutes] = time.split(':').map(Number)
  if (period === 'PM' && hours !== 12) {
    return hours + 12
  }
  if (period === 'AM' && hours === 12) {
    return 0
  }
  return hours
}

const getTimeSlotIndex = (timeStr: string) => {
  const hour24 = convertTo24Hour(timeStr)
  return timeSlots.value.findIndex(slot => convertTo24Hour(slot) === hour24)
}

const calculateRowSpan = (startTime: string, endTime: string) => {
  const startIndex = getTimeSlotIndex(formatTime(startTime))
  const endIndex = getTimeSlotIndex(formatTime(endTime))
  return endIndex - startIndex + 1  // Add 1 to include the end time slot
}

const hasClass = (day: string, timeSlot: string) => {
  return classSchedules.value.some(schedule => {
    const scheduleStartTime = formatTime(schedule.start_time)
    const startIndex = getTimeSlotIndex(scheduleStartTime)
    const currentIndex = getTimeSlotIndex(timeSlot)
    const rowSpan = calculateRowSpan(schedule.start_time, schedule.end_time)
    
    return schedule.day_of_week === day && 
           currentIndex >= startIndex && 
           currentIndex <= startIndex + rowSpan - 1  // Adjust the range check
  })
}

const getClassInfo = (day: string, timeSlot: string): ClassSchedule => {
  const schedule = classSchedules.value.find(schedule => {
    const scheduleStartTime = formatTime(schedule.start_time)
    const startIndex = getTimeSlotIndex(scheduleStartTime)
    const currentIndex = getTimeSlotIndex(timeSlot)
    const rowSpan = calculateRowSpan(schedule.start_time, schedule.end_time)
    
    return schedule.day_of_week === day && 
           currentIndex >= startIndex && 
           currentIndex <= startIndex + rowSpan - 1
  })
  
  if (!schedule) {
    // Return a default ClassSchedule object with required properties
    return {
      id: '',
      class_id: 0,
      subject_name: '',
      teacher_name: '',
      teacher_id: '',
      day_of_week: day,
      start_time: '',
      end_time: '',
      room_number: null,
      is_active: true
    }
  }
  
  return schedule
}

const shouldShowClass = (day: string, timeSlot: string) => {
  const schedule = classSchedules.value.find(schedule => {
    const scheduleStartTime = formatTime(schedule.start_time)
    return schedule.day_of_week === day && scheduleStartTime === timeSlot
  })
  
  return schedule !== undefined
}

const isCurrentTimeSlot = (day: string, time: string) => {
  const now = new Date()
  const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()]
  const currentHour = now.getHours()
  const timeHour = parseInt(time.split(':')[0]) + (time.includes('PM') && !time.startsWith('12') ? 12 : 0)
  
  return day === currentDay && currentHour === timeHour
}

const goBack = () => {
  router.push({ name: 'Teachers' })
}

const scheduleModal = ref()

const openAddScheduleModal = (selectedDay?: string, selectedTime?: string) => {
  const classId = getSelectedClassId()
  if (!classId) {
    error.value = 'Please select a class first'
    return
  }
  scheduleModal.value?.show(undefined, selectedDay, selectedTime)
}

const editSchedule = (schedule: ClassSchedule) => {
  // Prevent event propagation to parent
  event?.stopPropagation()
  // Pass the schedule data to the modal
  scheduleModal.value?.show({
    id: schedule.id,
    class_id: schedule.class_id,
    subject_name: schedule.subject_name,
    teacher_name: schedule.teacher_name,
    day_of_week: schedule.day_of_week,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    room_number: schedule.room_number,
    is_active: schedule.is_active
  })
}

const confirmDelete = async (schedule: ClassSchedule) => {
  // Prevent event propagation to parent
  event?.stopPropagation()
  try {
    const { error: deleteError } = await supabase
      .from('class_schedules')
      .delete()
      .eq('id', schedule.id)

    if (deleteError) throw deleteError

    // Refresh the schedules
    await fetchSchedules()
  } catch (err) {
    console.error('Error deleting schedule:', err)
    error.value = 'Failed to delete schedule. Please try again.'
  }
}

// Add this function in the script section after the interface definition
const isCurrentTeacher = (teacherId: string | number) => {
  return authStore.userRole?.id === teacherId
}

// Initialize data when component mounts
onMounted(async () => {
  try {
    // For teachers, ensure we have their class ID
    if (authStore.userRole?.role?.toLowerCase() === 'teacher' && !authStore.userRole.class_id) {
      // Fetch teacher's class assignment
      const { data: teacherData, error: teacherError } = await supabase
        .from('user_roles')
        .select('class_id')
        .eq('id', authStore.userRole.id)
        .eq('school_id', authStore.getSelectedSchoolId)
        .single()

      if (teacherError) throw teacherError

      if (teacherData?.class_id) {
        // Update local storage
        localStorage.setItem('selectedClassId', teacherData.class_id.toString())
      }
    }

    await fetchSchedules()
  } catch (err) {
    console.error('Error during initialization:', err)
    error.value = 'Failed to initialize class schedule. Please try again.'
  }
})
</script>

<style scoped>
.schedule-view {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.schedule-container {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  padding: 1.5rem;
}

.schedule-scroll-container {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* For smooth scrolling on iOS */
  scrollbar-width: thin; /* For Firefox */
  position: relative;
}

/* Custom scrollbar styles for Webkit browsers */
.schedule-scroll-container::-webkit-scrollbar {
  height: 8px;
}

.schedule-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.schedule-scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.schedule-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.schedule-grid {
  display: grid;
  grid-template-columns: 80px repeat(5, minmax(160px, 1fr));
  gap: 2px;
  background-color: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto;
  border: 1px solid #e9ecef;
  min-width: 900px; /* Ensure minimum width for scrolling */
}

.time-slots, .day-column {
  background-color: white;
}

.time-slot-header, .day-header {
  padding: 0.75rem;
  text-align: center;
  font-weight: 600;
  background: linear-gradient(to bottom, #f8f9fa, #ffffff);
  border-bottom: 2px solid #e9ecef;
  color: #1a237e;
  font-size: 0.95rem;
  height: 80px;  /* Updated height */
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-slot {
  padding: 0.5rem;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
  height: 80px;  /* Updated height */
  font-size: 0.875rem;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafbfc;
}

.schedule-cell {
  padding: 0.5rem;
  border-bottom: 1px solid #e9ecef;
  height: 80px;  /* Updated height */
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
}

.schedule-cell.has-class {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  margin: 2px;
  padding: 0.25rem;
  cursor: default;
}

.schedule-cell.has-class:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.class-info {
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  overflow: hidden;
  padding: 0.25rem;
  width: 100%;
}

.subject-badge {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 10px;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-image: linear-gradient(to right, var(--subject-color), color-mix(in srgb, var(--subject-color) 80%, white));
  text-align: center;
  width: 100%;
  height: 100%;
  overflow: visible;
  white-space: normal;
  word-break: break-word;
  line-height: 1.2;
  position: relative;
}

.subject-name {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.teacher-info {
  font-size: 0.75rem;
  opacity: 0.95;
  margin-bottom: 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.teacher-info i {
  font-size: 0.7rem;
}

.time-info {
  font-size: 0.7rem;
  opacity: 0.9;
  margin-bottom: 0.3rem;
  font-weight: normal;
}

.empty-cell-hint {
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ddd;
  font-size: 1.25rem;
  transition: all 0.3s ease;
}

.schedule-cell:not(.has-class):hover {
  background-color: rgba(66, 184, 131, 0.05);
}

.schedule-cell:not(.has-class):hover .empty-cell-hint {
  display: block;
  color: #42b883;
}

.schedule-cell.current-time {
  background: linear-gradient(135deg, #fff8e1 0%, #fffdf7 100%);
  border-left: 3px solid #ffc107;
}

/* Header Card Styles */
.header-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  border: 1px solid #e9ecef;
}

.header-card h2 {
  color: #1a237e;
  font-weight: 600;
  margin-bottom: 0;
}

.btn-success {
  background: linear-gradient(135deg, #42b883 0%, #3aa876 100%);
  border: none;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.2);
  transition: all 0.3s ease;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(66, 184, 131, 0.3);
}

.btn-outline-secondary {
  border: 1px solid #dee2e6;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.btn-outline-secondary:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .schedule-container {
    padding: 1rem;
  }

  .schedule-grid {
    grid-template-columns: 60px repeat(5, 160px); /* Fixed width columns for consistent mobile view */
  }

  .time-slot-header, .day-header {
    padding: 0.5rem;
    height: 60px;
    font-size: 0.85rem;
  }

  .schedule-cell {
    padding: 0.35rem;
  }

  .subject-name {
    font-size: 0.8rem;
  }

  .teacher-info {
    font-size: 0.7rem;
  }

  .time-info {
    font-size: 0.65rem;
  }
}

.schedule-actions {
  display: flex;
  gap: 0.35rem;
  justify-content: center;
  margin: 0.3rem 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.subject-badge:hover .schedule-actions {
  opacity: 1;
}

.action-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.edit-btn {
  color: #2196f3;
}

.edit-btn:hover {
  background: #2196f3;
  color: white;
}

.delete-btn {
  color: #f44336;
}

.delete-btn:hover {
  background: #f44336;
  color: white;
}

@media (max-width: 768px) {
  .schedule-actions {
    gap: 0.25rem;
  }

  .action-btn {
    width: 20px;
    height: 20px;
    font-size: 0.7rem;
  }
}
</style> 