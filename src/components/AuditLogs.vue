<template>
  <div class="container py-4">
    <div class="audit-logs">
      <!-- Header Section -->
      <div class="audit-header">
        <h1 class="audit-title">
          <i class="fas fa-history"></i>
          System Audit Logs
        </h1>
        <div class="audit-filters">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search by username, action, table, or record ID..." 
              @input="handleSearch"
            >
          </div>
          <div class="filter-group">
            <select v-model="selectedAction" class="filter-select" @change="handleFilters">
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>
            <select 
              v-if="isSuperAdmin" 
              v-model="selectedSchool" 
              class="filter-select school-select user-select" 
              @change="handleFilters"
              :disabled="isLoadingSchools"
            >
              <option value="">{{ isLoadingSchools ? 'Loading schools...' : 'All Schools' }}</option>
              <option v-for="school in schools" :key="school.id" :value="school.id">
                {{ school.name }}
              </option>
            </select>
            <select v-else v-model="selectedUser" class="filter-select user-select" @change="handleFilters">
              <option value="">All Users</option>
              <option v-for="user in uniqueUsers" :key="user" :value="user">{{ user }}</option>
            </select>
            <div class="date-filter">
              <input 
                type="date" 
                v-model="dateRange.start"
                class="filter-date"
                @change="handleFilters"
              >
              <span>to</span>
              <input 
                type="date" 
                v-model="dateRange.end"
                class="filter-date"
                @change="handleFilters"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="audit-content" :class="{ loading: isLoading }">
        <div v-if="isLoading" class="loading-overlay">
          <LoadingSpinner :visible="isLoading" />
        </div>
        
        <div v-else-if="filteredLogs.length === 0" class="no-results">
          <i class="fas fa-search"></i>
          <p>No audit logs found matching your criteria</p>
          <button class="reset-btn" @click="resetFilters">
            <i class="fas fa-redo-alt"></i>
            Reset Filters
          </button>
        </div>
        
        <template v-else>
          <div class="audit-table">
            <table>
              <thead>
                <tr>
                  <th @click="sortBy('created_at')" class="sortable">
                    When
                    <i class="fas" :class="getSortIcon('created_at')"></i>
                  </th>
                  <th @click="sortBy('username')" class="sortable">
                    Who
                    <i class="fas" :class="getSortIcon('username')"></i>
                  </th>
                  <th @click="sortBy('role')" class="sortable">
                    Role
                    <i class="fas" :class="getSortIcon('role')"></i>
                  </th>
                  <th @click="sortBy('action')" class="sortable">
                    Action
                    <i class="fas" :class="getSortIcon('action')"></i>
                  </th>
                  <th>What Changed</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in paginatedLogs" :key="log.id">
                  <td>{{ formatDate(log.created_at) }}</td>
                  <td>{{ log.username }}</td>
                  <td>
                    <span class="role-badge" :class="(log.role || '').toLowerCase()">
                      {{ log.role || 'N/A' }}
                    </span>
                  </td>
                  <td>
                    <span class="action-badge" :class="log.action.toLowerCase()">
                      {{ log.action }}
                    </span>
                  </td>
                  <td class="changes-summary-cell">
                    <div class="changes-summary" v-if="log.action === 'update'">
                      <span class="changed-field" v-for="(change, index) in getChangeSummary(log).slice(0, 3)" :key="index">
                        {{ change }}
                      </span>
                      <button 
                        v-if="getChangeSummary(log).length > 3"
                        class="show-more-btn" 
                        @click="showDetails(log)"
                        :title="getChangeSummary(log).slice(3).join(', ')"
                      >
                        +{{ getChangeSummary(log).length - 3 }} more
                      </button>
                    </div>
                    <div class="changes-summary" v-else-if="log.action === 'create'">
                      Created new {{ log.table_name }} (ID: {{ log.record_id }})
                    </div>
                    <div class="changes-summary" v-else-if="log.action === 'delete'">
                      Deleted {{ log.table_name }} (ID: {{ log.record_id }})
                    </div>
                    <div class="changes-summary" v-else-if="['login', 'logout'].includes(log.action.toLowerCase())">
                      <span class="muted-text">—</span>
                    </div>
                    <div class="changes-summary" v-else>
                      {{ log.table_name }} (ID: {{ log.record_id }})
                    </div>
                  </td>
                  <td>
                    <button class="details-btn" @click="showDetails(log)">
                      <i class="fas fa-info-circle"></i>
                      View
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination">
            <div class="pagination-info">
              <select v-model="itemsPerPage" class="items-per-page">
                <option :value="10">10 per page</option>
                <option :value="25">25 per page</option>
                <option :value="50">50 per page</option>
                <option :value="100">100 per page</option>
              </select>
              <span class="page-info">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
            </div>
            <div class="pagination-controls">
              <button 
                class="page-btn" 
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <button 
                class="page-btn" 
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Details Modal -->
      <div class="modal" v-if="selectedLog">
        <div class="modal-content">
          <div class="modal-header">
            <div class="header-content">
              <div class="header-main">
                <div class="title-section">
                  <h2>Activity Details</h2>
                  <span class="action-badge large" :class="selectedLog.action.toLowerCase()">
                    {{ selectedLog.action }}
                  </span>
                </div>
                <div class="meta-info">
                  <span class="timestamp">
                    <i class="far fa-clock"></i>
                    {{ formatDate(selectedLog.created_at) }}
                  </span>
                  <span class="divider">•</span>
                  <span class="user-info">
                    <i class="far fa-user"></i>
                    {{ selectedLog.username }}
                  </span>
                  <span class="role-badge" :class="(selectedLog.role || '').toLowerCase()">
                    {{ selectedLog.role || 'N/A' }}
                  </span>
                </div>
              </div>
            </div>
            <button class="close-btn" @click="selectedLog = null" title="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="tabs">
              <button 
                class="tab-btn" 
                :class="{ active: activeTab === 'details' }"
                @click="activeTab = 'details'"
              >
                <i class="fas fa-info-circle"></i>
                Details
              </button>
              <button 
                class="tab-btn" 
                :class="{ active: activeTab === 'changes' }"
                @click="activeTab = 'changes'"
              >
                <i class="fas fa-code-branch"></i>
                Changes
              </button>
            </div>

            <div class="tab-content">
              <!-- Details Tab -->
              <div v-if="activeTab === 'details'" class="details-tab">
                <div class="info-grid">
                  <div class="info-section">
                    <h3>Record Information</h3>
                    <div class="info-item">
                      <span class="label">Table</span>
                      <span class="value highlight">{{ selectedLog.table_name }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">Record ID</span>
                      <span class="value highlight">{{ selectedLog.record_id }}</span>
                    </div>
                  </div>

                  <div class="info-section">
                    <h3>User Details</h3>
                    <div class="info-item">
                      <span class="label">User ID</span>
                      <span class="value highlight">{{ selectedLog.user_id || 'N/A' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">IP Address</span>
                      <span class="value highlight">{{ selectedLog.ip_address || 'N/A' }}</span>
                    </div>
                  </div>

                  <div class="info-section full-width">
                    <h3>System Information</h3>
                    <div class="info-item">
                      <span class="label">User Agent</span>
                      <span class="value system-info">{{ selectedLog.user_agent || 'N/A' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Changes Tab -->
              <div v-if="activeTab === 'changes'" class="changes-tab">
                <div class="changes-comparison" v-if="selectedLog.old_values || selectedLog.new_values">
                  <table class="changes-table">
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Previous Value</th>
                        <th>New Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="change in getChangedValues(selectedLog.old_values, selectedLog.new_values)"
                          :key="change.key"
                          :class="change.status">
                        <td class="field-name">
                          {{ change.key }}
                          <span class="change-indicator" :class="change.status">
                            <i class="fas" :class="{
                              'fa-plus': change.status === 'added',
                              'fa-minus': change.status === 'removed',
                              'fa-pen': change.status === 'modified'
                            }"></i>
                          </span>
                        </td>
                        <td class="old-value" :class="{ highlight: change.status !== 'unchanged' }">
                          <pre>{{ formatValue(change.old) }}</pre>
                        </td>
                        <td class="new-value" :class="{ highlight: change.status !== 'unchanged' }">
                          <pre>{{ formatValue(change.new) }}</pre>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="no-changes" v-else>
                  <i class="fas fa-info-circle"></i>
                  <span>No changes recorded</span>
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
import { ref, computed, onMounted, watch, defineComponent } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import type { AuditLog } from '@/types/audit'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

defineComponent({
  components: {
    LoadingSpinner
  }
})

const authStore = useAuthStore()
const logs = ref<AuditLog[]>([])
const isLoading = ref(true)
const isLoadingSchools = ref(false)
const searchQuery = ref('')
const selectedAction = ref('')
const selectedUser = ref('')
const dateRange = ref({ start: '', end: '' })
const currentPage = ref(1)
const itemsPerPage = ref(10)
const selectedLog = ref<AuditLog | null>(null)
const sortConfig = ref<{ key: keyof AuditLog; direction: 'asc' | 'desc' }>({ 
  key: 'created_at', 
  direction: 'desc' 
})
const activeTab = ref('details')
const selectedSchool = ref('')
const schools = ref<School[]>([])

// Add this interface near the top of the script section
interface School {
  id: string;
  name: string;
}

// Computed Properties
const uniqueUsers = computed(() => {
  const usernames = [...new Set(logs.value.map(log => log.username))]
  return usernames.filter(username => username !== null && username !== 'N/A').sort()
})

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const matchesSearch = !searchQuery.value || 
      log.action.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.table_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.record_id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (log.username || '').toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesAction = !selectedAction.value || 
      log.action.toLowerCase() === selectedAction.value.toLowerCase()

    const matchesUser = !selectedUser.value || 
      log.username === selectedUser.value

    return matchesSearch && matchesAction && matchesUser
  }).sort((a, b) => {
    const direction = sortConfig.value.direction === 'asc' ? 1 : -1
    const aValue = a[sortConfig.value.key]
    const bValue = b[sortConfig.value.key]
    
    // Handle undefined values
    if (aValue === undefined && bValue === undefined) return 0
    if (aValue === undefined) return 1
    if (bValue === undefined) return -1
    
    // Compare values
    if (aValue < bValue) return -1 * direction
    if (aValue > bValue) return 1 * direction
    return 0
  })
})

const totalPages = computed(() => {
  return Math.ceil(filteredLogs.value.length / itemsPerPage.value)
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredLogs.value.slice(start, end)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || 
         selectedAction.value !== '' || 
         selectedUser.value !== '' || 
         dateRange.value.start !== '' || 
         dateRange.value.end !== ''
})

const isSuperAdmin = computed(() => {
  return authStore.userRole?.role?.toLowerCase() === 'superadmin'
})

// Methods
const fetchAuditLogs = async () => {
  try {
    isLoading.value = true
    
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user_roles!inner (
          username,
          role
        )
      `)
      .order('created_at', { ascending: false })
      .not('user_roles.role', 'eq', 'superadmin')
    
    // If superadmin with selected school, filter by school
    if (isSuperAdmin.value && selectedSchool.value) {
      query = query.eq('school_id', selectedSchool.value)
    }
    // If not superadmin, filter by user's school_id
    else if (!isSuperAdmin.value && authStore.userRole?.school_id) {
      query = query.eq('school_id', authStore.userRole.school_id)
    }

    // Apply date range filters if set
    if (dateRange.value.start) {
      const startDate = new Date(dateRange.value.start + 'T00:00:00')
      query = query.gte('created_at', startDate.toISOString())
    }
    
    if (dateRange.value.end) {
      const endDate = new Date(dateRange.value.end + 'T23:59:59')
      query = query.lte('created_at', endDate.toISOString())
    }

    // Apply other filters at the database level if they exist
    if (selectedAction.value) {
      query = query.ilike('action', selectedAction.value)
    }

    if (selectedUser.value) {
      query = query.eq('user_roles.username', selectedUser.value)
    }

    if (searchQuery.value) {
      query = query.or(`
        action.ilike.%${searchQuery.value}%,
        table_name.ilike.%${searchQuery.value}%,
        record_id.ilike.%${searchQuery.value}%,
        user_roles.username.ilike.%${searchQuery.value}%
      `)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }
    
    // Transform the data to flatten the user_roles
    logs.value = (data || []).map(log => ({
      ...log,
      username: log.user_roles?.username || 'N/A',
      role: log.user_roles?.role || 'N/A'
    }))

    console.log('Fetched logs:', {
      dateRange: dateRange.value,
      totalLogs: logs.value.length,
      firstLog: logs.value[0]
    })
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
    // You might want to show a toast notification here
  } finally {
    isLoading.value = false
  }
}

// Watch for date range changes
watch([dateRange], () => {
  fetchAuditLogs()
}, { deep: true })

// Methods
const handleSearch = () => {
  currentPage.value = 1
  fetchAuditLogs()
}

const handleFilters = () => {
  currentPage.value = 1
  fetchAuditLogs()
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedAction.value = ''
  selectedUser.value = ''
  selectedSchool.value = ''
  dateRange.value = { start: '', end: '' }
  currentPage.value = 1
  fetchAuditLogs()
}

const sortBy = (key: keyof AuditLog) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc'
  } else {
    sortConfig.value.key = key
    sortConfig.value.direction = 'desc'
  }
}

const getSortIcon = (key: string) => {
  if (sortConfig.value.key !== key) return 'fa-sort'
  return sortConfig.value.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
}

const getActionClass = (action: string) => {
  return `action-${action.toLowerCase()}`
}

const formatDate = (timestamp: string) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
}

const showDetails = (log: AuditLog) => {
  selectedLog.value = log
}

// Function to compare and highlight changes
const getChangedValues = (oldValues: any, newValues: any) => {
  const allKeys = new Set([...Object.keys(oldValues || {}), ...Object.keys(newValues || {})])
  const changes: { key: string; old: any; new: any; status: 'added' | 'removed' | 'modified' | 'unchanged' }[] = []

  allKeys.forEach(key => {
    const oldValue = oldValues?.[key]
    const newValue = newValues?.[key]

    if (oldValue === undefined && newValue !== undefined) {
      changes.push({ key, old: null, new: newValue, status: 'added' })
    } else if (oldValue !== undefined && newValue === undefined) {
      changes.push({ key, old: oldValue, new: null, status: 'removed' })
    } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({ key, old: oldValue, new: newValue, status: 'modified' })
    } else {
      changes.push({ key, old: oldValue, new: newValue, status: 'unchanged' })
    }
  })

  return changes
}

// Function to format value for display
const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

// Add this method in the script section
const getChangeSummary = (log: AuditLog) => {
  if (!log.old_values || !log.new_values) return []
  
  const changes = []
  const oldVals = log.old_values || {}
  const newVals = log.new_values || {}
  
  // Get all unique keys
  const allKeys = [...new Set([...Object.keys(oldVals), ...Object.keys(newVals)])]
  
  for (const key of allKeys) {
    const oldVal = oldVals[key]
    const newVal = newVals[key]
    
    if (oldVal !== newVal) {
      changes.push(key)
    }
  }
  
  return changes.map(field => {
    // Convert snake_case to Title Case
    return field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  })
}

// Add fetchSchools method
const fetchSchools = async () => {
  try {
    isLoadingSchools.value = true
    const { data, error } = await supabase
      .from('schools')
      .select('id, name')
      .order('name')
    
    if (error) throw error
    schools.value = data || []
  } catch (error) {
    console.error('Error fetching schools:', error)
  } finally {
    isLoadingSchools.value = false
  }
}

// Add watch for selectedSchool
watch(selectedSchool, () => {
  currentPage.value = 1
  fetchAuditLogs()
})

// Lifecycle Hooks
onMounted(() => {
  if (isSuperAdmin.value) {
    fetchSchools()
  }
  fetchAuditLogs()
})
</script>

<style scoped lang="scss">
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.audit-logs {
  background: #ffffff;
  border-radius: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 
              0 10px 15px -3px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 260px;
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    z-index: 0;
  }

  .audit-header {
    position: relative;
    z-index: 1;
    padding: 2.5rem 2.5rem 1.75rem;

    .audit-title {
      font-size: 2.25rem;
      font-weight: 700;
      color: white;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      i {
        font-size: 2rem;
        background: rgba(255, 255, 255, 0.2);
        padding: 1rem;
        border-radius: 1.25rem;
        backdrop-filter: blur(8px);
      }
    }

    .audit-filters {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      padding: 1.75rem;
      border-radius: 1.5rem;
      box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  }

  .audit-content {
    position: relative;
    background: white;
    border-radius: 1.5rem;
    margin: 0.75rem 2.5rem 2.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }
}

.audit-filters {
  .search-box {
    position: relative;

    i {
      position: absolute;
      left: 1.5rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
      font-size: 1.125rem;
    }

    input {
      width: 100%;
      padding: 1.25rem 1.25rem 1.25rem 3.5rem;
      border: 2px solid #e5e7eb;
      border-radius: 1rem;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;

      &:focus {
        outline: none;
        border-color: #059669;
        box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1);
      }

      &::placeholder {
        color: #9ca3af;
      }
    }
  }

  .filter-group {
    display: flex;
    gap: 1rem;
    align-items: center;

    .filter-select {
      flex: 1;
      min-width: 160px;
      padding: 1.25rem;
      border: 2px solid #e5e7eb;
      border-radius: 1rem;
      font-size: 0.875rem;
      color: #1f2937;
      background-color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      background-size: 1.5rem;
      padding-right: 3rem;

      &:focus {
        outline: none;
        border-color: #059669;
        box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1);
      }

      &.user-select {
        min-width: 500px;
        flex: 1.5;
      }

      &.school-select {
        background-color: #ffffff;
        border-color: #059669;
        
        &:focus {
          border-color: #059669;
          box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1);
        }
      }
    }
  }

  .date-filter {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 1rem;
    width: 100%;

    input[type="date"] {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      color: #1f2937;
      background: white;
      transition: all 0.3s ease;
      min-width: 150px;

      &:focus {
        outline: none;
        border-color: #059669;
        box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1);
      }
    }

    span {
      color: #6b7280;
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
    }
  }
}

.audit-content {
  position: relative;
  background: white;
  margin: 0;
  overflow: hidden;

  .audit-table {
    overflow-x: auto;
    min-height: 200px;

    table {
      width: 100%;
      border-collapse: collapse;

      th {
        background: white;
        padding: 0.75rem 1rem;
        font-weight: 500;
        color: #6b7280;
        font-size: 0.875rem;
        text-align: left;
        border-bottom: 1px solid #e5e7eb;
        position: sticky;
        top: 0;
        z-index: 10;

        &.sortable {
          cursor: pointer;
          padding-right: 2rem;

          i {
            position: absolute;
            right: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
            font-size: 0.875rem;
          }
        }
      }

      td {
        padding: 0.75rem 1rem;
        color: #1f2937;
        font-size: 0.875rem;
        border-bottom: 1px solid #e5e7eb;
        background: white;
      }

      tr:hover td {
        background: #f9fafb;
      }
    }
  }

  .pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-top: 1px solid #e5e7eb;
    background: white;

    .pagination-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .items-per-page {
        padding: 0.375rem 0.75rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        color: #1f2937;
        background: white;
      }

      .page-info {
        color: #6b7280;
        font-size: 0.875rem;
      }
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.25rem;

      .page-btn {
        padding: 0.375rem;
        width: 1.75rem;
        height: 1.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #e5e7eb;
        border-radius: 0.375rem;
        background: white;
        color: #1f2937;

        &:disabled {
          color: #9ca3af;
          background: #f9fafb;
          cursor: not-allowed;
        }

        &:not(:disabled):hover {
          background: #f9fafb;
        }

        i {
          font-size: 0.75rem;
        }
      }
    }
  }
}

.action-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: capitalize;

  &.create {
    background: #ecfdf5;
    color: #059669;
  }

  &.update {
    background: #fef3c7;
    color: #d97706;
  }

  &.delete {
    background: #fee2e2;
    color: #dc2626;
  }

  &.login {
    background: #eff6ff;
    color: #2563eb;
  }

  &.logout {
    background: #f3f4f6;
    color: #4b5563;
  }
}

.details-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  color: #1f2937;
  font-size: 0.75rem;
  background: white;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;

  i {
    font-size: 0.875rem;
    color: #059669;
  }

  &:hover {
    background: #f9fafb;
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  animation: modalFade 0.3s ease;

  .modal-content {
    background: white;
    border-radius: 1.5rem;
    width: 100%;
    max-width: 1000px;
    max-height: 700px;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                0 10px 10px -5px rgba(0, 0, 0, 0.04);
    animation: modalSlide 0.3s ease;
    display: flex;
    flex-direction: column;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;

      &:hover {
        background: #94a3b8;
      }
    }

    .modal-header {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      padding: 1.5rem 2rem;
      border-radius: 1.5rem 1.5rem 0 0;
      position: relative;
      
      .header-content {
        padding-right: 3rem;
        
        .header-main {
          .title-section {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;

            h2 {
              color: white;
              font-size: 1.5rem;
              margin: 0;
              font-weight: 600;
            }

            .action-badge.large {
              font-size: 0.875rem;
              padding: 0.375rem 0.75rem;
            }
          }

          .meta-info {
            display: flex;
            align-items: center;
            gap: 1rem;
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.9375rem;

            i {
              margin-right: 0.375rem;
            }

            .divider {
              color: rgba(255, 255, 255, 0.5);
            }

            .role-badge {
              margin-left: auto;
            }
          }
        }
      }

      .close-btn {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        backdrop-filter: blur(8px);
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.75rem;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          font-size: 1.125rem;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }
      }
    }

    .modal-body {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: #f8fafc;

      .tabs {
        display: flex;
        gap: 0.5rem;
        padding: 1rem 2rem;
        background: white;
        border-bottom: 1px solid #e5e7eb;

        .tab-btn {
          padding: 0.75rem 1.25rem;
          border: none;
          background: none;
          color: #64748b;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;

          i {
            font-size: 1rem;
          }

          &:hover {
            background: #f1f5f9;
            color: #0f172a;
          }

          &.active {
            background: #ecfdf5;
            color: #059669;
          }
        }
      }

      .tab-content {
        flex: 1;
        overflow-y: auto;
        padding: 2rem 2.5rem;

        .details-tab {
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;

            .info-section {
              background: white;
              padding: 1.25rem;
              border-radius: 1rem;
              border: 1px solid #e5e7eb;

              &.full-width {
                grid-column: 1 / -1;
              }

              h3 {
                font-size: 1rem;
                font-weight: 600;
                color: #1e293b;
                margin: 0 0 1rem 0;
              }

              .info-item {
                display: flex;
                flex-direction: column;
                gap: 0.375rem;
                margin-bottom: 1rem;

                &:last-child {
                  margin-bottom: 0;
                }

                .label {
                  font-size: 0.8125rem;
                  font-weight: 500;
                  color: #64748b;
                }

                .value {
                  font-size: 0.9375rem;
                  color: #0f172a;

                  &.highlight {
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    background: #f1f5f9;
                    padding: 0.375rem 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                  }

                  &.system-info {
                    font-size: 0.875rem;
                    color: #475569;
                    line-height: 1.5;
                  }
                }
              }
            }
          }
        }

        .changes-tab {
          .changes-comparison {
            background: white;
            border-radius: 0.75rem;
            border: 1px solid #e5e7eb;
            overflow: hidden;

            .changes-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 0.875rem;

              th {
                background: #f8fafc;
                padding: 0.75rem 1rem;
                text-align: left;
                color: #64748b;
                font-weight: 500;
                border-bottom: 1px solid #e5e7eb;
              }

              td {
                padding: 1rem 1.5rem;
                border-bottom: 1px solid #e5e7eb;
                vertical-align: top;
                line-height: 1.5;

                &.field-name {
                  font-weight: 500;
                  color: #1e293b;
                  width: 25%;
                  display: flex;
                  align-items: flex-start;
                  justify-content: space-between;
                  gap: 0.5rem;
                }

                pre {
                  margin: 0;
                  white-space: pre-wrap;
                  word-break: break-word;
                  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                  color: #334155;
                }

                &.highlight {
                  background-color: #fafafa;
                }
              }

              tr {
                &.added {
                  td.new-value {
                    background-color: #f0fdf4;
                    .change-indicator { color: #059669; }
                  }
                }

                &.removed {
                  td.old-value {
                    background-color: #fef2f2;
                    .change-indicator { color: #dc2626; }
                  }
                }

                &.modified {
                  td.old-value { background-color: #fff7ed; }
                  td.new-value { background-color: #f0fdf4; }
                  .change-indicator { color: #0ea5e9; }
                }

                &:hover {
                  background-color: #f8fafc;
                }
              }

              .change-indicator {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 1.5rem;
                height: 1.5rem;
                border-radius: 0.375rem;
                background: #f1f5f9;
                
                i {
                  font-size: 0.75rem;
                }
              }
            }
          }

          .no-changes {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            padding: 3rem;
            background: white;
            border-radius: 0.75rem;
            border: 1px solid #e5e7eb;
            color: #64748b;

            i {
              font-size: 1.25rem;
              color: #94a3b8;
            }
          }
        }
      }
    }
  }
}

@keyframes modalFade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlide {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;

  i {
    font-size: 3.5rem;
    color: #e5e7eb;
    margin-bottom: 1.5rem;
  }

  p {
    font-size: 1.125rem;
    margin-bottom: 2rem;
    color: #4b5563;
  }

  .reset-btn {
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);
    color: white;
    border: none;
    border-radius: 1rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);

    i {
      font-size: 1.125rem;
      color: white;
      margin: 0;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.3);

      i {
        transform: rotate(180deg);
      }
    }

    &:active {
      transform: translateY(0);
    }
  }
}

@media (max-width: 1024px) {
  .audit-logs {
    .audit-header {
      padding: 2rem;

      .audit-filters {
        .search-and-filters {
          flex-direction: column;
          
          .search-box,
          .filter-group {
            width: 100%;
          }
          
          .filter-group {
            flex-wrap: wrap;
          }
        }

        .date-filter {
          flex-direction: column;
          align-items: stretch;
          
          .date-input-group {
            width: 100%;
          }
        }
      }
    }

    .audit-content {
      margin: 0.5rem 2rem 2rem;
    }
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .audit-logs {
    border-radius: 1.5rem;

    &::before {
      height: 200px;
    }

    .audit-header {
      padding: 1.5rem 1.5rem 1.25rem;

      .audit-title {
        font-size: 1.75rem;

        i {
          font-size: 1.5rem;
          padding: 0.75rem;
        }
      }

      .audit-filters {
        padding: 1.25rem;

        .search-box input {
          padding: 1rem 1rem 1rem 3rem;
        }

        .filter-group {
          flex-direction: column;
          width: 100%;

          .filter-select,
          .date-filter {
            width: 100%;
            min-width: 100%;
          }

          .date-filter {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }
        }
      }
    }

    .audit-content {
      margin: 0.5rem 1rem 1rem;

      .audit-table {
        table {
          th, td {
            padding: 1rem;
          }
        }
      }
    }
  }

  .modal {
    padding: 1rem;

    .modal-content {
      border-radius: 1.25rem;

      .modal-header {
        padding: 1.25rem;
      }

      .modal-body {
        padding: 1.5rem;
      }
    }
  }

  .pagination {
    padding: 0.5rem 1rem;
    
    .pagination-info {
      gap: 0.75rem;
    }
  }
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: capitalize;
  white-space: nowrap;

  &.superadmin {
    background: #fdf2f8;
    color: #be185d;
  }

  &.admin {
    background: #eff6ff;
    color: #1d4ed8;
  }

  &.teacher {
    background: #ecfdf5;
    color: #059669;
  }

  &.student {
    background: #f3f4f6;
    color: #4b5563;
  }
}

.changes-summary-cell {
  max-width: 300px;
  
  .changes-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #4b5563;
    align-items: center;
  }
  
  .changed-field {
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    color: #6b7280;
    border: 1px solid #e5e7eb;
    white-space: nowrap;
  }
  
  .show-more-btn {
    background: #e5e7eb;
    color: #4b5563;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    
    &:hover {
      background: #d1d5db;
      color: #374151;
    }
  }

  .muted-text {
    color: #9ca3af;
    font-style: italic;
  }
}

.user-info-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.school-select {
  min-width: 500px;
  flex: 1.5;
}

.filter-select {
  &.school-select {
    background-color: #ffffff;
    border-color: #059669;
    
    &:focus {
      border-color: #059669;
      box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1);
    }
  }
}
</style> 