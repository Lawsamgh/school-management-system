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
              <div class="header-actions">
                <button class="btn btn-success btn-lg" @click="openAddScheduleModal">
                  <i class="fas fa-plus me-2"></i>
                  Add Schedule
                </button>
              </div>
            </div>
          </div>

          <!-- Schedule Grid with Shadow and Modern Design -->
          <div class="schedule-container">
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
                <div 
                  v-for="hour in timeSlots" 
                  :key="hour"
                  class="schedule-cell"
                  :class="{ 
                    'has-class': hasClass(day, hour),
                    'current-time': isCurrentTimeSlot(day, hour)
                  }"
                  @click="openAddScheduleModal"
                >
                  <template v-if="hasClass(day, hour)">
                    <div class="class-info">
                      <div class="subject-badge" :style="{ backgroundColor: getSubjectColor(getClassInfo(day, hour).subject) }">
                        {{ getClassInfo(day, hour).subject }}
                      </div>
                      <div class="class-details">
                        <strong>{{ getClassInfo(day, hour).subject }}</strong>
                        <small>
                          <i class="far fa-clock me-1"></i>
                          {{ getClassInfo(day, hour).duration }}
                        </small>
                      </div>
                    </div>
                  </template>
                  <div v-else class="empty-cell-hint">
                    <i class="fas fa-plus-circle"></i>
                  </div>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const weekDays = ref(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
const timeSlots = ref([
  '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
])

// Sample class schedule data
const classSchedule = ref([
  {
    day: 'Monday',
    time: '8:00 AM',
    subject: 'Mathematics',
    duration: '1 hour'
  },
  {
    day: 'Monday',
    time: '10:00 AM',
    subject: 'Physics',
    duration: '2 hours'
  },
  {
    day: 'Wednesday',
    time: '1:00 PM',
    subject: 'Chemistry',
    duration: '1.5 hours'
  }
])

// Subject colors for visual distinction
const subjectColors = {
  Mathematics: '#1976d2',
  Physics: '#388e3c',
  Chemistry: '#d32f2f',
  default: '#7b1fa2'
}

const getSubjectColor = (subject: string) => {
  return subjectColors[subject as keyof typeof subjectColors] || subjectColors.default
}

const hasClass = (day: string, time: string) => {
  return classSchedule.value.some(cls => cls.day === day && cls.time === time)
}

const getClassInfo = (day: string, time: string) => {
  return classSchedule.value.find(cls => cls.day === day && cls.time === time) || { subject: '', duration: '' }
}

const isCurrentTimeSlot = (day: string, time: string) => {
  const now = new Date()
  const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()]
  const currentHour = now.getHours()
  const timeHour = parseInt(time.split(':')[0]) + (time.includes('PM') && !time.startsWith('12') ? 12 : 0)
  
  return day === currentDay && currentHour === timeHour
}

const openAddScheduleModal = () => {
  // TODO: Implement add schedule modal
  console.log('Opening add schedule modal')
}

const goBack = () => {
  router.push({ name: 'Teachers' })
}
</script>

<style scoped>
.schedule-view {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header-card {
  background-color: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.header-card h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #1a237e;
}

.schedule-container {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  padding: 1.5rem;
}

.schedule-grid {
  display: grid;
  grid-template-columns: 80px repeat(5, minmax(160px, 1fr));
  gap: 2px;
  background-color: #f1f3f4;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto;
}

.time-slots, .day-column {
  background-color: white;
}

.time-slot-header, .day-header {
  padding: 0.75rem;
  text-align: center;
  font-weight: 600;
  background-color: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
  color: #1a237e;
  font-size: 0.95rem;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-header {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  background-color: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
  color: #1a237e;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-header i {
  font-size: 0.9rem;
  opacity: 0.7;
}

.time-slot {
  padding: 0.5rem;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
  min-height: 60px;
  font-size: 0.875rem;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.schedule-cell {
  padding: 0.5rem;
  border-bottom: 1px solid #e9ecef;
  min-height: 60px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
}

.schedule-cell:hover {
  background-color: #f8f9fa;
}

.schedule-cell.has-class {
  background-color: #fff;
}

.schedule-cell.current-time {
  background-color: #fff8e1;
}

.class-info {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;
}

.subject-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
}

.class-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.class-details strong {
  color: #1a237e;
  font-size: 0.9rem;
}

.class-details small {
  color: #666;
  font-size: 0.8rem;
}

.empty-cell-hint {
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ccc;
  font-size: 1.25rem;
}

.schedule-cell:hover .empty-cell-hint {
  display: block;
}

.btn-success {
  background-color: #2e7d32;
  border: none;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  color: white;
}

.btn-success:hover {
  background-color: #388e3c;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(46, 125, 50, 0.2);
  color: white;
}

.btn-outline-secondary {
  border: 1px solid #dee2e6;
  padding: 0.5rem 1rem;
  font-weight: 500;
  background-color: white;
  color: #6c757d;
}

.btn-outline-secondary:hover {
  background-color: white;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

@media (max-width: 768px) {
  .schedule-container {
    padding: 0.75rem;
  }
  
  .schedule-grid {
    grid-template-columns: 60px repeat(5, minmax(120px, 1fr));
  }
  
  .time-slot-header, .day-header {
    padding: 0.5rem;
    height: 40px;
    font-size: 0.85rem;
  }
  
  .time-slot, .schedule-cell {
    min-height: 50px;
    padding: 0.35rem;
  }
  
  .subject-badge {
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
  }
  
  .class-details strong {
    font-size: 0.75rem;
  }
  
  .class-details small {
    font-size: 0.65rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .time-slot-header, .day-header {
    height: 44px;
  }
  
  .time-slot, .schedule-cell {
    min-height: 55px;
  }
}
</style> 