<template>
  <div class="modal fade" id="scheduleModal" tabindex="-1" data-bs-backdrop="static">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title d-flex align-items-center">
            <i class="fas fa-calendar-alt text-primary me-2"></i>
            {{ isEditing ? 'Edit Schedule' : 'Add New Schedule' }}
          </h5>
          <button 
            type="button" 
            class="btn-close"
            @click="closeModal"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <!-- Day Selection -->
            <div class="mb-4">
              <label class="form-label">Day of Week</label>
              <div class="day-selector d-flex gap-2 flex-wrap">
                <button
                  v-for="day in weekDays"
                  :key="day.value"
                  type="button"
                  class="btn"
                  :class="[
                    selectedDays.includes(day.value) 
                      ? 'btn-primary' 
                      : 'btn-outline-primary'
                  ]"
                  @click="toggleDay(day.value)"
                >
                  {{ day.label }}
                </button>
              </div>
            </div>

            <!-- Time Selection -->
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label">Start Time</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-clock"></i>
                  </span>
                  <input 
                    type="time" 
                    class="form-control" 
                    v-model="startTime"
                    required
                  >
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">End Time</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-clock"></i>
                  </span>
                  <input 
                    type="time" 
                    class="form-control" 
                    v-model="endTime"
                    required
                  >
                </div>
              </div>
            </div>

            <!-- Subject Selection -->
            <div class="mb-4">
              <label class="form-label">Subject</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-book"></i>
                </span>
                <select class="form-select" v-model="selectedSubject" required>
                  <option value="" disabled>Select a subject</option>
                  <option 
                    v-for="subject in subjects" 
                    :key="subject.id" 
                    :value="subject.id"
                  >
                    {{ subject.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Room/Location -->
            <div class="mb-4">
              <label class="form-label">Room/Location</label>
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-location-dot"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="room"
                  placeholder="Enter room or location"
                  required
                >
              </div>
            </div>

            <!-- Notes -->
            <div class="mb-4">
              <label class="form-label">Notes (Optional)</label>
              <textarea 
                class="form-control" 
                v-model="notes"
                rows="3"
                placeholder="Add any additional notes or instructions"
              ></textarea>
            </div>
          </form>
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
            @click="handleSubmit"
            :disabled="!isValid"
          >
            {{ isEditing ? 'Update Schedule' : 'Add Schedule' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScheduleModal',
  data() {
    return {
      weekDays: [
        { label: 'Mon', value: 'monday' },
        { label: 'Tue', value: 'tuesday' },
        { label: 'Wed', value: 'wednesday' },
        { label: 'Thu', value: 'thursday' },
        { label: 'Fri', value: 'friday' },
        { label: 'Sat', value: 'saturday' },
        { label: 'Sun', value: 'sunday' }
      ],
      selectedDays: [],
      startTime: '',
      endTime: '',
      selectedSubject: '',
      room: '',
      notes: '',
      isEditing: false,
      subjects: [] // This will be populated from props or API
    }
  },
  computed: {
    isValid() {
      return this.selectedDays.length > 0 && 
             this.startTime && 
             this.endTime && 
             this.selectedSubject && 
             this.room
    }
  },
  methods: {
    toggleDay(day) {
      const index = this.selectedDays.indexOf(day)
      if (index === -1) {
        this.selectedDays.push(day)
      } else {
        this.selectedDays.splice(index, 1)
      }
    },
    handleSubmit() {
      if (!this.isValid) return

      const scheduleData = {
        days: this.selectedDays,
        startTime: this.startTime,
        endTime: this.endTime,
        subjectId: this.selectedSubject,
        room: this.room,
        notes: this.notes
      }

      this.$emit('save', scheduleData)
      this.closeModal()
    },
    closeModal() {
      this.$emit('close')
      this.resetForm()
    },
    resetForm() {
      this.selectedDays = []
      this.startTime = ''
      this.endTime = ''
      this.selectedSubject = ''
      this.room = ''
      this.notes = ''
    }
  }
}
</script>

<style scoped>
.day-selector .btn {
  min-width: 60px;
  border-radius: 20px;
}

.modal-content {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.modal-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1.25rem 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1.25rem 1.5rem;
}

.form-control,
.form-select,
.input-group-text {
  border-radius: 8px;
  padding: 0.6rem 1rem;
}

.input-group > .form-control,
.input-group > .form-select {
  border-start-start-radius: 0;
  border-end-start-radius: 0;
}

.input-group-text {
  background-color: #f8f9fa;
  border-end-end-radius: 0;
  border-start-end-radius: 0;
}

textarea.form-control {
  resize: vertical;
}

.btn {
  padding: 0.6rem 1.2rem;
  font-weight: 500;
}

.btn-primary {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.btn-outline-primary {
  border-color: var(--bs-primary);
  color: var(--bs-primary);
}

.btn-outline-primary:hover {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: white;
}
</style> 