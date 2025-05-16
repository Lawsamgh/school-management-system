<!-- PaymentChart.vue -->
<template>
  <div class="payment-chart">
    <div class="chart-header">
      <h2>Monthly Payment Statistics</h2>
      <div class="year-selector">
        <select v-model="selectedYear" class="form-select" @change="fetchData">
          <option v-for="year in availableYears" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </div>
    </div>
    
    <div class="chart-wrapper">
      <div v-if="loading" class="chart-loader">
        <div class="spinner"></div>
        <p>Loading data...</p>
      </div>
      <div class="chart-container">
        <canvas ref="chart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { Chart } from 'chart.js/auto'
import type { ChartConfiguration } from 'chart.js'
import { getPaymentsByDateRange } from '@/api/payments'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/store/auth'

const toast = useToast()
const authStore = useAuthStore()
const chart = ref<HTMLCanvasElement | null>(null)
const chartInstance = ref<Chart | null>(null)
const loading = ref(true)
const selectedYear = ref(new Date().getFullYear())

// Get the user role for permission checks
const userRole = computed(() => authStore.userRole?.role?.toLowerCase() || '')

// Determine the appropriate school_id based on user role
const schoolId = computed(() => {
  if (userRole.value === 'admin') {
    return authStore.userRole?.school_id
  } else if (userRole.value === 'superadmin') {
    return authStore.getSelectedSchoolId
  }
  return authStore.userRole?.school_id
})

// Available years (current year and 4 years back)
const availableYears = ref(
  Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
)

const initChart = (data: number[]) => {
  const canvas = chart.value
  if (!canvas) {
    console.log('Canvas element not found')
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    console.log('Failed to get canvas context')
    return
  }

  // Destroy existing chart if it exists
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const chartConfig: ChartConfiguration<'bar', number[], string> = {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Monthly Payments (GHC)',
        data: data,
        backgroundColor: '#42b88340',
        borderColor: '#42b883',
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: '#42b883'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => `GHC ${context.raw?.toLocaleString() || '0'}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `GHC ${value.toLocaleString()}`
          }
        }
      }
    }
  }

  chartInstance.value = new Chart(ctx, chartConfig)
}

const fetchData = async () => {
  try {
    loading.value = true
    console.log('Fetching data for year:', selectedYear.value)
    console.log('Using school ID:', schoolId.value)

    const startDate = `${selectedYear.value}-01-01`
    const endDate = `${selectedYear.value}-12-31`
    
    // Pass the school_id to filter payments by school
    const data = await getPaymentsByDateRange(startDate, endDate, schoolId.value)
    console.log('Received data:', data)

    // Process data into monthly totals
    const monthlyTotals = Array(12).fill(0)
    
    if (data?.length) {
      data.forEach(payment => {
        const month = new Date(payment.payment_date).getMonth()
        monthlyTotals[month] += Number(payment.amount || 0)
      })
    }

    console.log('Monthly totals:', monthlyTotals)
    initChart(monthlyTotals)
  } catch (error) {
    console.error('Error fetching data:', error)
    toast.error('Failed to load payment statistics')
  } finally {
    loading.value = false
  }
}

// Watch for changes to the selected school (for superadmin)
watch(
  () => authStore.getSelectedSchoolId,
  () => {
    if (userRole.value === 'superadmin') {
      console.log('School changed, refreshing chart data...')
      fetchData()
    }
  }
)

onMounted(() => {
  console.log('PaymentChart mounted')
  fetchData()
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
})
</script>

<style scoped>
.payment-chart {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
}

.year-selector select {
  padding: 0.5rem 2rem 0.5rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  background-color: #f8f9fa;
  font-size: 0.9rem;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.2s;
}

.year-selector select:hover,
.year-selector select:focus {
  border-color: #42b883;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(66, 184, 131, 0.25);
}

.chart-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.chart-container {
  height: 400px;
  position: relative;
}

.chart-loader {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #42b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style> 