import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'

/**
 * Log user activity to the audit_logs table
 * @param action The action being performed (create, update, delete, login, logout)
 * @param tableName The name of the table being affected
 * @param recordId The ID of the record being affected
 * @param oldValues The previous values (for updates/deletes)
 * @param newValues The new values (for creates/updates)
 */
export async function logActivity(
  action: 'create' | 'update' | 'delete' | 'login' | 'logout',
  tableName: string,
  recordId: string | number,
  oldValues?: any,
  newValues?: any
) {
  try {
    const authStore = useAuthStore()
    
    // Skip logging if user is a superadmin
    if (authStore.userRole?.role?.toLowerCase() === 'superadmin') {
      console.debug('Skipping audit log for superadmin action')
      return
    }
    
    // Get the user role ID from the auth store
    const userRoleId = authStore.userRole?.id
    
    // Get the appropriate school_id based on user role
    let schoolId = ['admin', 'registrar'].includes(authStore.userRole?.role?.toLowerCase() || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId
    
    // For login/logout actions, we need to handle the case where the user might not have a school selected yet
    if (!schoolId && (action === 'login' || action === 'logout')) {
      // Try to get school_id directly from user_role if available
      schoolId = authStore.userRole?.school_id || '00000000-0000-0000-0000-000000000000' // Use a default UUID for system-level actions
      console.log(`Using fallback school_id for ${action} action:`, schoolId)
    } else if (!schoolId) {
      console.error('No school ID found for audit log')
      return
    }
    
    // Get user information
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || 'unknown'
    
    // Attempt to get client IP address (this is a best-effort approach)
    let ipAddress = 'unknown'
    try {
      // Try to get IP from a public service
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      ipAddress = data.ip
    } catch (err) {
      console.warn('Could not determine IP address:', err)
    }
    
    // For login/logout actions, use 'auth' as the table name instead of 'users'
    const finalTableName = (action === 'login' || action === 'logout') ? 'auth' : tableName
    
    console.log(`Logging ${action} activity for table ${finalTableName}:`, {
      user_id: userId,
      user_role_id: userRoleId,
      school_id: schoolId,
      action,
      table_name: finalTableName,
      record_id: String(recordId)
    })
    
    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId,
      user_role_id: userRoleId,
      school_id: schoolId,
      action,
      table_name: finalTableName,
      record_id: String(recordId),
      old_values: oldValues || null,
      new_values: newValues || null,
      ip_address: ipAddress,
      user_agent: navigator.userAgent
    })
    
    if (error) {
      console.error('Error logging activity:', error)
    }
  } catch (err) {
    console.error('Failed to log activity:', err)
    // Don't throw error - audit logging should not break main functionality
  }
} 