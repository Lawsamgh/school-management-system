<!-- AppearanceSettings.vue -->
<template>
  <div class="settings-card position-relative">
    <SettingsCardLoader :visible="loading" />
    <div class="settings-card-header d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex align-items-center">
        <i class="fas fa-paint-brush text-primary me-3"></i>
        <h2 class="mb-0">Appearance Settings</h2>
      </div>
      <button 
        class="btn btn-primary save-btn"
        @click="saveThemeSettings"
        :disabled="saving"
      >
        <i class="fas fa-save me-2"></i>
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>

    <div class="settings-card-body">
      <div class="alert alert-info mb-4 d-flex align-items-center">
        <i class="fas fa-info-circle fs-4 me-3"></i>
        <div>
          <strong>Theme Customization</strong>
          <p class="mb-0">Customize your school's appearance by selecting colors for different elements. Changes will be applied immediately after saving.</p>
        </div>
      </div>

      <div class="theme-settings-container">
        <!-- Color Settings -->
        <div class="color-settings">
          <h3 class="settings-section-title mb-4">Color Scheme</h3>
          <div class="row g-4">
            <div class="col-md-6">
              <div class="color-picker-card">
                <div class="color-picker-header">
                  <label class="modern-label">Primary Color</label>
                  <small class="color-hint">Used for primary buttons, links, and highlights</small>
                </div>
                <div class="color-picker-wrapper">
                  <input 
                    type="color" 
                    v-model="themeSettings.primary_color"
                    class="color-picker-input"
                  >
                  <input 
                    type="text" 
                    v-model="themeSettings.primary_color"
                    class="color-text-input"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    @input="validateHexColor($event, 'primary_color')"
                  >
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="color-picker-card">
                <div class="color-picker-header">
                  <label class="modern-label">Secondary Color</label>
                  <small class="color-hint">Used for secondary elements and backgrounds</small>
                </div>
                <div class="color-picker-wrapper">
                  <input 
                    type="color" 
                    v-model="themeSettings.secondary_color"
                    class="color-picker-input"
                  >
                  <input 
                    type="text" 
                    v-model="themeSettings.secondary_color"
                    class="color-text-input"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    @input="validateHexColor($event, 'secondary_color')"
                  >
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="color-picker-card">
                <div class="color-picker-header">
                  <label class="modern-label">Accent Color</label>
                  <small class="color-hint">Used for special highlights and interactive elements</small>
                </div>
                <div class="color-picker-wrapper">
                  <input 
                    type="color" 
                    v-model="themeSettings.accent_color"
                    class="color-picker-input"
                  >
                  <input 
                    type="text" 
                    v-model="themeSettings.accent_color"
                    class="color-text-input"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    @input="validateHexColor($event, 'accent_color')"
                  >
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="color-picker-card">
                <div class="color-picker-header">
                  <label class="modern-label">Text Color</label>
                  <small class="color-hint">Main text color throughout the application</small>
                </div>
                <div class="color-picker-wrapper">
                  <input 
                    type="color" 
                    v-model="themeSettings.text_color"
                    class="color-picker-input"
                  >
                  <input 
                    type="text" 
                    v-model="themeSettings.text_color"
                    class="color-text-input"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    @input="validateHexColor($event, 'text_color')"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <div class="theme-preview-section mt-5">
          <h3 class="settings-section-title mb-4">Live Preview</h3>
          <div class="theme-preview" :style="previewStyles">
            <div class="preview-header">
              <h4>Sample Dashboard</h4>
              <p>Preview your color scheme in action</p>
            </div>
            <div class="preview-body">
              <div class="preview-card">
                <h5>Interactive Elements</h5>
                <div class="button-group mb-4">
                  <button class="btn btn-primary me-2">Primary Action</button>
                  <button class="btn btn-secondary me-2">Secondary Action</button>
                  <button class="btn btn-outline-primary">Outlined Button</button>
                </div>
                <div class="preview-content">
                  <p>This is how your regular text will appear throughout the application. Links will appear in your <a href="#" @click.prevent>accent color</a>.</p>
                  <div class="alert alert-primary">
                    This is how alerts and notifications will look.
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
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import SettingsCardLoader from '@/components/SettingsCardLoader.vue'

const toast = useToast()
const authStore = useAuthStore()

const loading = ref(false)
const saving = ref(false)

const themeSettings = ref({
  primary_color: '#42b883',
  secondary_color: '#35495e',
  accent_color: '#42b883',
  text_color: '#2c3e50',
  background_color: '#ffffff'
})

const previewStyles = computed(() => ({
  '--primary-color': themeSettings.value.primary_color,
  '--secondary-color': themeSettings.value.secondary_color,
  '--accent-color': themeSettings.value.accent_color,
  '--text-color': themeSettings.value.text_color,
  '--background-color': themeSettings.value.background_color,
}))

const fetchThemeSettings = async () => {
  loading.value = true
  try {
    const schoolId = authStore.userRole?.school_id || authStore.getSelectedSchoolId
    if (!schoolId) return

    const { data, error } = await supabase
      .from('school_themes')
      .select('*')
      .eq('school_id', schoolId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    if (data) {
      themeSettings.value = {
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        accent_color: data.accent_color,
        text_color: data.text_color,
        background_color: data.background_color
      }
      // Apply theme immediately after fetching
      applyThemeChanges()
    }
  } catch (error: any) {
    console.error('Error fetching theme settings:', error)
    toast.error('Failed to load theme settings')
  } finally {
    loading.value = false
  }
}

const validateHexColor = (event: Event, field: keyof typeof themeSettings.value) => {
  const input = event.target as HTMLInputElement
  const value = input.value
  
  // Ensure the value is a valid hex color
  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
    themeSettings.value[field] = '#000000'
  }
}

const saveThemeSettings = async () => {
  saving.value = true
  try {
    const schoolId = authStore.userRole?.school_id || authStore.getSelectedSchoolId
    if (!schoolId) throw new Error('No school ID found')

    const { data: existingTheme } = await supabase
      .from('school_themes')
      .select('id')
      .eq('school_id', schoolId)
      .single()

    let result
    if (existingTheme) {
      result = await supabase
        .from('school_themes')
        .update({
          ...themeSettings.value,
          updated_at: new Date().toISOString()
        })
        .eq('school_id', schoolId)
    } else {
      result = await supabase
        .from('school_themes')
        .insert([{
          school_id: schoolId,
          ...themeSettings.value
        }])
    }

    if (result.error) throw result.error

    // Apply theme changes
    applyThemeChanges()
    
    toast.success('Theme settings saved successfully')
  } catch (error: any) {
    console.error('Error saving theme settings:', error)
    toast.error('Failed to save theme settings')
  } finally {
    saving.value = false
  }
}

const applyThemeChanges = () => {
  const root = document.documentElement
  
  // Set main CSS variables
  root.style.setProperty('--primary', themeSettings.value.primary_color)
  root.style.setProperty('--secondary', themeSettings.value.secondary_color)
  root.style.setProperty('--accent', themeSettings.value.accent_color)
  root.style.setProperty('--text', themeSettings.value.text_color)
  root.style.setProperty('--background', themeSettings.value.background_color)
  
  // Convert hex to RGB for rgba() usage
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Set RGB variables for rgba() usage
  const primaryRgb = hexToRgb(themeSettings.value.primary_color)
  if (primaryRgb) {
    root.style.setProperty('--primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`)
  }

  const secondaryRgb = hexToRgb(themeSettings.value.secondary_color)
  if (secondaryRgb) {
    root.style.setProperty('--secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`)
  }
}

onMounted(() => {
  fetchThemeSettings()
})
</script>

<style scoped lang="scss">
.settings-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  padding: 2rem;

  .settings-card-header {
    h2 {
      font-size: 1.5rem;
      font-weight: 600;
    }

    .save-btn {
      padding: 0.75rem 1.5rem;
      font-weight: 500;
    }
  }
}

.settings-section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.theme-settings-container {
  max-width: 1200px;
  margin: 0 auto;
}

.color-picker-card {
  background: #f8fafc;
  border-radius: 1rem;
  padding: 1.5rem;
  height: 100%;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .color-picker-header {
    margin-bottom: 1rem;

    .modern-label {
      display: block;
      font-size: 1rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.5rem;
    }

    .color-hint {
      display: block;
      color: #64748b;
      font-size: 0.875rem;
    }
  }
}

.color-picker-wrapper {
  display: flex;
  gap: 1rem;
  align-items: center;

  .color-picker-input {
    width: 60px;
    height: 60px;
    padding: 0;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
    
    &::-webkit-color-swatch-wrapper {
      padding: 0;
    }
    
    &::-webkit-color-swatch {
      border: none;
      border-radius: 12px;
    }

    &:hover {
      transform: scale(1.05);
    }
  }

  .color-text-input {
    flex: 1;
    padding: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-family: 'Monaco', monospace;
    font-size: 1rem;
    text-align: center;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
    }

    &:hover {
      border-color: #cbd5e1;
    }
  }
}

.theme-preview-section {
  .theme-preview {
    background: white;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    .preview-header {
      background: var(--secondary);
      padding: 2rem;
      color: white;

      h4 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
      }

      p {
        margin: 0.5rem 0 0;
        opacity: 0.8;
      }
    }

    .preview-body {
      padding: 2rem;

      .preview-card {
        background: white;
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

        h5 {
          color: var(--text);
          margin-bottom: 1.5rem;
          font-weight: 600;
        }

        .button-group {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .preview-content {
          color: var(--text);

          p {
            margin-bottom: 1rem;
            line-height: 1.6;
          }

          a {
            color: var(--accent);
            text-decoration: none;
            font-weight: 500;

            &:hover {
              text-decoration: underline;
            }
          }

          .alert {
            background-color: var(--primary);
            color: white;
            border: none;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
          }
        }
      }
    }
  }
}
</style> 