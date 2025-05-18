import { computed, ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import { useAuthStore } from '@/store/auth'
import { getPayments, getPaymentsByDateRange } from '@/api/payments'
import { supabase } from '@/lib/supabase'
import { Chart } from 'chart.js/auto'
import type { ChartConfiguration, TooltipItem } from 'chart.js'
import { useToast } from 'vue-toastification'
import { useSchoolValidation } from '@/composables/useSchoolValidation'
import { getUserInitials, getDisplayName } from '@/utils/userUtils'

// Add this interface near the top of the file, after imports
interface ClassData {
  id?: number;
  name?: string;
  class_name?: string;
  className?: string;
  title?: string;
  class_title?: string;
  subject?: string;
  course?: string;
  subject_name?: string;
  course_name?: string;
  [key: string]: any; // Allow for other potential fields
}

// Add this helper function near the top of the file, before the useDashboard function
const findPropertyCaseInsensitive = (obj: any, propertyNames: string[]): string | null => {
  if (!obj || typeof obj !== 'object') return null;
  
  // First check exact matches
  for (const prop of propertyNames) {
    if (obj[prop] !== undefined) return obj[prop];
  }
  
  // Then check case-insensitive
  const objKeys = Object.keys(obj);
  for (const prop of propertyNames) {
    const matchingKey = objKeys.find(k => k.toLowerCase() === prop.toLowerCase());
    if (matchingKey && obj[matchingKey] !== undefined) return obj[matchingKey];
  }
  
  return null;
};

export function useDashboard() {
  // Initialize toast and validation
  const toast = useToast()
  const { withSchoolValidation } = useSchoolValidation()

  const authStore = useAuthStore()
  const loading = ref(true)
  const showAddUserModal = ref(false)
  const showChangePasswordModal = ref(false)
  const hasChangedPassword = ref(false)
  const recentPayments = ref<any[]>([])
  const teacherCount = ref(0)
  const studentCount = ref(0)
  const schoolCount = ref(0)
  const paymentChart = ref<HTMLCanvasElement | null>(null)
  const chartInstance = ref<Chart | null>(null)
  const selectedYear = ref(new Date().getFullYear())
  const availableYears = ref<number[]>([])
  const monthlyStats = ref<number[]>(Array(12).fill(0))
  const initChart = ref(false)
  const chartInitialized = ref(false)
  const hasPaymentData = ref(false)
  const teacherPortalEnabled = ref(false)
  const classCount = ref(0)
  const assignmentCount = ref(0)
  const attendanceCount = ref(0)
  const teacherClassName = ref('')
  const todayAttendance = ref<any[]>([])
  
  // Add new ref for password
  const passwordStatus = ref<string | null>(null)

  // Change parentCount to adminCount
  const adminCount = ref(0)

  // Add these refs for student dashboard
  const studentClassName = ref('')
  const studentClassId = ref<number | null>(null)
  // Add new ref for student assignments
  const studentAssignmentCount = ref(0)
  // Add new ref for teacher names
  const classTeachers = ref<string[]>([])

  // Computed properties for date
  const today = computed(() => new Date().toISOString().slice(0, 10))
  
  // Computed property for attendance percentage
  const attendancePercentage = computed(() => {
    if (!classCount.value || !todayAttendance.value.length) return 0
    const presentCount = todayAttendance.value.filter(record => record.status === 'present').length
    return Math.round((presentCount / classCount.value) * 100)
  })

  // Update the computed property for showing password change alert
  const showPasswordChangeAlert = computed(() => {
    const role = userRole.value?.toLowerCase()
    return ['student', 'parent'].includes(role) && passwordStatus.value !== 'changed'
  })

  // Function to fetch user's password status
  const fetchPasswordStatus = async () => {
    try {
      const { data: userRole, error } = await supabase
        .from('user_roles')
        .select('password_status')
        .eq('email', authStore.user?.email)
        .single()

      if (error) {
        console.error('Error fetching password status:', error)
        return
      }

      passwordStatus.value = userRole?.password_status
      console.log('Password status:', passwordStatus.value)
    } catch (error) {
      console.error('Error in fetchPasswordStatus:', error)
    }
  }

  // Computed property to control chart visibility
  const showChart = computed(() => {
    // Don't show chart while authentication is still loading
    if (loading.value || !authStore.isAuthenticated) {
      return false
    }

    return showFinanceContent.value
  })

  // Computed properties for display data
  // Get user display name and initials consistently across the app
  const userName = computed(() => getDisplayName(authStore))
  const userRole = computed(() => {
    const role = authStore.userRole?.role || 'No Role Assigned'
    return role
  })
  const userInitials = computed(() => getUserInitials(userName.value))

  // Get student initials using the same utility function
  const getStudentInitials = (name: string): string => {
    return getUserInitials(name)
  }

  // Function to format amount
  const formatAmount = (amount: any): string => {
    // Convert to number and handle any potential issues
    const num = Number(amount);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
  }

  // Computed properties for role-based checks
  const isStudentOrParent = computed(() => {
    const roleValue = userRole.value?.toLowerCase() || ''
    return ['student', 'parent'].includes(roleValue)
  })

  // Check if user is admin or higher
  const isAdminOrHigher = computed(() => {
    const roleValue = userRole.value?.toLowerCase() || '';
    return ['admin', 'registrar', 'superadmin'].includes(roleValue);
  })

  const isRegistrarOrHigher = computed(() => {
    const roleValue = userRole.value?.toLowerCase() || ''
    return ['registrar', 'superadmin', 'admin'].includes(roleValue)
  })

  const isTeacherOrHigher = computed(() => {
    const roleValue = userRole.value?.toLowerCase() || ''
    return ['teacher', 'superadmin', 'admin'].includes(roleValue)
  })

  // Computed property for showing finance content
  const showFinanceContent = computed(() => {
    if (!authStore.isAuthenticated) return false;
    
    const role = userRole.value?.toLowerCase() || '';
    
    // Superadmin always sees finance content
    if (role === 'superadmin') return true;
    
    // Admin/registrar sees finance content if the module is enabled
    if (['admin', 'registrar'].includes(role)) {
      return authStore.financeModuleEnabled;
    }
    
    return false;
  })

  // Additional computed properties for view permissions
  const canViewPayments = computed(() => {
    const roleValue = userRole.value?.toLowerCase() || ''
    // Only include accountant if finance module is enabled
    if (roleValue === 'accountant') {
      return authStore.financeModuleEnabled
    }
    return ['admin', 'superadmin'].includes(roleValue)
  })

  const canViewFinancials = computed(() => {
    const roleValue = userRole.value?.toLowerCase() || ''
    // Only include accountant if finance module is enabled
    if (roleValue === 'accountant') {
      return authStore.financeModuleEnabled
    }
    return ['admin', 'superadmin'].includes(roleValue)
  })

  const canViewRegistration = computed(() => {
    const roleValue = userRole.value?.toLowerCase() || ''
    return ['registrar', 'superadmin', 'admin'].includes(roleValue)
  })

  const canViewTeaching = computed(() => {
    const roleValue = userRole.value?.toLowerCase() || ''
    return ['teacher', 'superadmin', 'admin'].includes(roleValue)
  })

  // Fetch recent payments if user is an accountant, admin, or superadmin
  const fetchRecentPayments = async () => {
    try {
      console.log('Checking role for payments:', {
        role: userRole.value,
        isAdmin: isAdminOrHigher.value,
        finance: authStore.financeModuleEnabled
      })
      
      // Only fetch for superadmin or admin/accountant with finance module enabled
      if (userRole.value?.toLowerCase() === 'superadmin' || 
          (isAdminOrHigher.value && authStore.financeModuleEnabled)) {
        console.log('Fetching payments...')
        
        // Get the school_id based on user role
        const schoolId = ['admin', 'registrar'].includes(userRole.value?.toLowerCase() || '') 
          ? authStore.userRole?.school_id 
          : userRole.value?.toLowerCase() === 'superadmin' ? authStore.getSelectedSchoolId : authStore.userRole?.school_id;
        
        // For superadmin, only proceed if a school is selected
        if (userRole.value?.toLowerCase() === 'superadmin' && !schoolId) {
          console.log('Superadmin has no school selected, skipping payment fetch')
          recentPayments.value = [];
          hasPaymentData.value = false;
          return;
        }
        
        console.log('Fetching payments with school ID:', schoolId)
        
        const data = await getPayments(schoolId);
        console.log('Received payments data:', data)
        
        // Take only the most recent 5 payments
        recentPayments.value = data?.slice(0, 5) || [];
        hasPaymentData.value = !!(recentPayments.value && recentPayments.value.length > 0);
        console.log('Set recent payments:', recentPayments.value)
      } else {
        console.log('User does not have permission to view payments or finance module is disabled')
        recentPayments.value = [];
        hasPaymentData.value = false;
      }
    } catch (error) {
      console.error('Error fetching recent payments:', error);
      toast.error('Failed to load recent payments')
      hasPaymentData.value = false;
    }
  }

  // Fetch teacher count from user_roles table
  const fetchTeacherCount = async () => {
    try {
      // Get the school_id based on user role
      const schoolId = ['admin', 'registrar'].includes(userRole.value?.toLowerCase() || '') 
        ? authStore.userRole?.school_id 
        : userRole.value?.toLowerCase() === 'superadmin' ? authStore.getSelectedSchoolId : authStore.userRole?.school_id;

      // Base query to get teachers
      let query = supabase
        .from('user_roles')
        .select('*', { count: 'exact' })
        .eq('role', 'teacher');
      
      // Add school_id filter if available
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching teacher count:', error);
        return;
      }
      
      teacherCount.value = count || 0;
      console.log('Teacher count:', teacherCount.value);
    } catch (error) {
      console.error('Error fetching teacher count:', error);
    }
  }

  // Fetch student count from user_roles table
  const fetchStudentCount = async () => {
    try {
      // Get the school_id based on user role
      const schoolId = ['admin', 'registrar'].includes(userRole.value?.toLowerCase() || '') 
        ? authStore.userRole?.school_id 
        : userRole.value?.toLowerCase() === 'superadmin' ? authStore.getSelectedSchoolId : authStore.userRole?.school_id;

      // Base query to get students
      let query = supabase
        .from('user_roles')
        .select('*', { count: 'exact' })
        .eq('role', 'student');
      
      // Add school_id filter if available
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching student count:', error);
        return;
      }
      
      studentCount.value = count || 0;
      console.log('Student count:', studentCount.value);
    } catch (error) {
      console.error('Error fetching student count:', error);
    }
  }

  // Fetch school info to check for teacher portal
  const fetchSchoolInfo = async () => {
    try {
      // Get the school_id based on user role
      const schoolId = ['admin', 'registrar'].includes(userRole.value?.toLowerCase() || '') 
        ? authStore.userRole?.school_id 
        : userRole.value?.toLowerCase() === 'superadmin' ? authStore.getSelectedSchoolId : authStore.userRole?.school_id;
      
      if (!schoolId) {
        console.log('No school_id found');
        return;
      }
      
      const { data: setupData, error: setupError } = await supabase
        .from('setup')
        .select('*')
        .eq('school_id', schoolId)
        .single();
        
      if (!setupError && setupData) {
        // Look for teacher_portal field (case insensitive)
        const setupDataKeys = Object.keys(setupData);
        const teacherPortalField = setupDataKeys.find(key => 
          key.toLowerCase() === 'teacher_portal'
        );
        
        // Update the teacher portal enabled state
        if (teacherPortalField) {
          const value = setupData[teacherPortalField];
          teacherPortalEnabled.value = String(value).toUpperCase() === 'YES';
        } else {
          teacherPortalEnabled.value = false;
        }
        
        console.log('Teacher portal enabled:', teacherPortalEnabled.value);
      }
    } catch (error) {
      console.error('Error fetching school setup:', error);
      teacherPortalEnabled.value = false;
    }
  }

  // Fetch school count for superadmin
  const fetchSchoolCount = async () => {
    try {
      const { data, error, count } = await supabase
        .from('schools')
        .select('*', { count: 'exact' });
      
      if (error) {
        console.error('Error fetching school count:', error);
        return;
      }
      
      schoolCount.value = count || 0;
      console.log('School count:', schoolCount.value);
    } catch (error) {
      console.error('Error fetching school count:', error);
    }
  }

  // Fetch teacher dashboard data
  const fetchTeacherDashboardData = async () => {
    try {
      console.log('=== Starting Teacher Dashboard Data Fetch ===');
      
      // 1. First, check if we have the necessary IDs
      const userId = authStore.user?.id;
      const teacherRoleId = authStore.userRole?.id;
      const schoolId = authStore.userRole?.school_id;
      
      console.log('Initial Teacher Data:', { 
        userId, 
        teacherRoleId, 
        schoolId,
        userRole: userRole.value,
        authStore: {
          user: authStore.user ? 'exists' : 'missing',
          userRole: authStore.userRole ? 'exists' : 'missing',
          isAuthenticated: authStore.isAuthenticated
        }  
      });
      
      // Exit if we're missing critical info
      if (!userId || !schoolId) {
        console.error('❌ Missing critical data - userId or schoolId');
        return;
      }

      // First get the teacher's class_id from user_roles
      console.log('🔍 Fetching teacher role data...');
      const { data: teacherData, error: teacherError } = await supabase
        .from('user_roles')
        .select('class_id, id, school_id')
        .eq('id', teacherRoleId)
        .eq('school_id', schoolId)
        .single();

      console.log('Teacher Role Query Result:', {
        success: !teacherError,
        data: teacherData,
        error: teacherError,
        teacherRoleId,
        schoolId
      });

      if (teacherError) {
        console.error('❌ Error fetching teacher class_id:', teacherError);
        return;
      }

      if (teacherData?.class_id) {
        console.log('✅ Found class_id in user_roles:', teacherData.class_id);

        // Count students in this class with detailed logging
        console.log('🔍 Counting students with params:', {
          class_id: teacherData.class_id,
          school_id: schoolId,
          role: 'student'
        });

        const { data: studentsData, error: countError } = await supabase
          .from('user_roles')
          .select('id')
          .eq('class_id', teacherData.class_id)
          .eq('school_id', schoolId)
          .eq('role', 'student');

        if (countError) {
          console.error('❌ Error counting students:', countError);
          classCount.value = 0;
        } else {
          const studentCount = studentsData?.length || 0;
          classCount.value = studentCount;
          console.log('✅ Student count results:', {
            totalStudents: studentCount,
            rawData: studentsData,
            queryParams: {
              class_id: teacherData.class_id,
              school_id: schoolId
            }
          });
        }

        // Count assignments for this class
        console.log('🔍 Counting assignments for class:', teacherData.class_id);
        const { count: assignmentsCount, error: assignmentError } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', teacherData.class_id)
          .eq('school_id', schoolId);

        if (assignmentError) {
          console.error('❌ Error counting assignments:', assignmentError);
          assignmentCount.value = 0;
        } else {
          assignmentCount.value = assignmentsCount || 0;
          console.log('✅ Assignment count results:', {
            totalAssignments: assignmentCount.value,
            queryParams: {
              class_id: teacherData.class_id,
              school_id: schoolId
            }
          });
        }

        // Get today's attendance for this class
        console.log('🔍 Fetching today\'s attendance for class:', teacherData.class_id);
        
        // Try different possible table names for attendance
        const attendanceTables = ['attendances', 'attendance', 'class_attendance', 'daily_attendance'];
        let foundAttendance = false;

        for (const table of attendanceTables) {
          try {
            console.log(`Trying to fetch attendance from "${table}" table...`);
            const dateField = table === 'class_attendance' ? 'attendance_date' : 'date';
            
            const { data: attendanceData, error: attendanceError } = await supabase
              .from(table)
              .select('*')
              .eq('class_id', teacherData.class_id)
              .eq('school_id', schoolId)
              .eq(dateField, today.value);

            if (!attendanceError) {
              console.log(`✅ Successfully found attendance in "${table}" table`);
              todayAttendance.value = attendanceData || [];
              // Count students marked as present
              const presentCount = todayAttendance.value.filter(
                record => record.status?.toLowerCase() === 'present'
              ).length;
              attendanceCount.value = presentCount;
              console.log('✅ Attendance results:', {
                table,
                totalPresent: presentCount,
                totalRecords: todayAttendance.value.length,
                date: today.value,
                queryParams: {
                  class_id: teacherData.class_id,
                  school_id: schoolId,
                  dateField,
                  date: today.value
                }
              });
              foundAttendance = true;
              break;
            } else {
              console.log(`Table "${table}" not found or error:`, attendanceError);
            }
          } catch (e) {
            console.log(`Error checking "${table}" table:`, e);
          }
        }

        if (!foundAttendance) {
          console.log('⚠️ No attendance records found in any table');
          attendanceCount.value = 0;
          todayAttendance.value = [];
        }

        // Now fetch the class name
        console.log('🔍 Fetching class name...');
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('class_id, class_name, school_id')
          .eq('class_id', teacherData.class_id)
          .eq('school_id', schoolId)
          .single();

        console.log('Class Name Query Result:', {
          success: !classError,
          data: classData,
          error: classError
        });

        if (classError) {
          console.error('❌ Error fetching class name:', classError);
        } else if (classData) {
          teacherClassName.value = classData.class_name || 'Unnamed Class';
          console.log('✅ Set class name to:', teacherClassName.value);
        }
      } else {
        console.log('⚠️ No class_id found in user_roles, trying classes table...');
        // If no class_id in user_roles, try getting from classes table directly
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('class_id, class_name, school_id')
          .eq('teacher_id', userId)
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        console.log('Direct Class Query Result:', {
          success: !classesError,
          data: classesData,
          error: classesError,
          queriedTeacherId: userId,
          queriedSchoolId: schoolId
        });

        if (classesError) {
          console.error('❌ Error fetching teacher classes:', classesError);
          teacherClassName.value = 'Unassigned Class';
          classCount.value = 0;
          assignmentCount.value = 0;
        } else if (classesData) {
          teacherClassName.value = classesData.class_name || 'Unnamed Class';
          console.log('✅ Set class name to:', teacherClassName.value);

          // Count students in this class
          console.log('🔍 Counting students for found class:', {
            class_id: classesData.class_id,
            school_id: schoolId
          });

          const { data: studentsData, error: countError } = await supabase
            .from('user_roles')
            .select('id')
            .eq('class_id', classesData.class_id)
            .eq('school_id', schoolId)
            .eq('role', 'student');

          if (countError) {
            console.error('❌ Error counting students:', countError);
            classCount.value = 0;
          } else {
            const studentCount = studentsData?.length || 0;
            classCount.value = studentCount;
            console.log('✅ Student count results:', {
              totalStudents: studentCount,
              rawData: studentsData,
              queryParams: {
                class_id: classesData.class_id,
                school_id: schoolId
              }
            });
          }

          // Count assignments for this class
          console.log('🔍 Counting assignments for class:', classesData.class_id);
          const { count: assignmentsCount, error: assignmentError } = await supabase
            .from('assignments')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', classesData.class_id)
            .eq('school_id', schoolId);

          if (assignmentError) {
            console.error('❌ Error counting assignments:', assignmentError);
            assignmentCount.value = 0;
          } else {
            assignmentCount.value = assignmentsCount || 0;
            console.log('✅ Assignment count results:', {
              totalAssignments: assignmentCount.value,
              queryParams: {
                class_id: classesData.class_id,
                school_id: schoolId
              }
            });
          }

          // Get today's attendance for this class
          console.log('🔍 Fetching today\'s attendance for class:', classesData.class_id);
          
          // Try different possible table names for attendance
          const attendanceTables = ['attendances', 'attendance', 'class_attendance', 'daily_attendance'];
          let foundAttendance = false;

          for (const table of attendanceTables) {
            try {
              console.log(`Trying to fetch attendance from "${table}" table...`);
              const dateField = table === 'class_attendance' ? 'attendance_date' : 'date';
              
              const { data: attendanceData, error: attendanceError } = await supabase
                .from(table)
                .select('*')
                .eq('class_id', classesData.class_id)
                .eq('school_id', schoolId)
                .eq(dateField, today.value);

              if (!attendanceError) {
                console.log(`✅ Successfully found attendance in "${table}" table`);
                todayAttendance.value = attendanceData || [];
                // Count students marked as present
                const presentCount = todayAttendance.value.filter(
                  record => record.status?.toLowerCase() === 'present'
                ).length;
                attendanceCount.value = presentCount;
                console.log('✅ Attendance results:', {
                  table,
                  totalPresent: presentCount,
                  totalRecords: todayAttendance.value.length,
                  date: today.value,
                  queryParams: {
                    class_id: classesData.class_id,
                    school_id: schoolId,
                    dateField,
                    date: today.value
                  }
                });
                foundAttendance = true;
                break;
              } else {
                console.log(`Table "${table}" not found or error:`, attendanceError);
              }
            } catch (e) {
              console.log(`Error checking "${table}" table:`, e);
            }
          }

          if (!foundAttendance) {
            console.log('⚠️ No attendance records found in any table');
            attendanceCount.value = 0;
            todayAttendance.value = [];
          }
        } else {
          teacherClassName.value = 'Unassigned Class';
          classCount.value = 0;
          assignmentCount.value = 0;
          console.log('⚠️ No class found for teacher');
        }
      }

      console.log('=== Final Teacher Dashboard State ===', {
        className: teacherClassName.value,
        studentCount: classCount.value,
        assignmentCount: assignmentCount.value,
        attendanceCount: attendanceCount.value,
        totalAttendanceRecords: todayAttendance.value.length
      });
      
    } catch (error) {
      console.error('❌ Error in fetchTeacherDashboardData:', error);
    }
  }

  // Fetch today's attendance for teacher
  const fetchTodayAttendance = async () => {
    try {
      if (userRole.value?.toLowerCase() === 'teacher') {
        console.log('Fetching today\'s attendance...');
        const userId = authStore.user?.id;
        const schoolId = authStore.userRole?.school_id;
        
        if (!userId || !schoolId) {
          console.error('Missing user ID or school ID');
          return;
        }
        
        // Get the teacher's classes first - try multiple approaches
        let classIds: any[] = [];
        
        // 1. Try getting class_id from user_roles table
        const { data: teacherData, error: teacherError } = await supabase
          .from('user_roles')
          .select('class_id, assigned_classes')
          .eq('id', authStore.userRole?.id)
          .single();

        if (!teacherError && teacherData) {
          // Add class_id if available
          if (teacherData.class_id) {
            classIds.push(teacherData.class_id);
          }
          
          // Check for assigned_classes field (could be array or JSON string)
          if (teacherData.assigned_classes) {
            let assignedClasses = teacherData.assigned_classes;
            
            if (typeof assignedClasses === 'string') {
              try {
                assignedClasses = JSON.parse(assignedClasses);
              } catch (e) {
                console.error('Error parsing assigned classes:', e);
              }
            }
            
            if (Array.isArray(assignedClasses)) {
              classIds = [...classIds, ...assignedClasses];
            }
          }
        }
        
        // 2. Try getting classes where teacher_id matches user ID
        if (classIds.length === 0) {
          const { data: classesData, error: classesError } = await supabase
            .from('classes')
            .select('id')
            .eq('teacher_id', userId)
            .eq('school_id', schoolId);
            
          if (!classesError && classesData && classesData.length > 0) {
            classIds = classesData.map(c => c.id);
          }
        }
        
        console.log('Found class IDs for teacher:', classIds);
        
        if (classIds.length === 0) {
          console.log('No classes found for teacher');
          return;
        }
        
        // Try different table names for attendance
        const attendanceTables = ['attendance', 'attendances', 'class_attendance'];
        let foundAttendance = false;
        
        for (const table of attendanceTables) {
          try {
            const dateField = table === 'class_attendance' ? 'attendance_date' : 'date';
            
            // Get today's attendance records
            const { data: attendanceRecords, error: attendanceError } = await supabase
              .from(table)
              .select('id, status, student_id')
              .in('class_id', classIds)
              .eq('school_id', schoolId)
              .eq(dateField, today.value);
            
            if (!attendanceError && attendanceRecords) {
              console.log(`Found ${attendanceRecords.length} attendance records for today in table ${table}`);
              todayAttendance.value = attendanceRecords || [];
              
              // Update attendance count based on 'present' status
              attendanceCount.value = todayAttendance.value.filter(
                record => record.status?.toLowerCase() === 'present'
              ).length;
              
              // Get total students in classes for percentage calculation
              const { data: students, error: studentsError } = await supabase
                .from('user_roles')
                .select('id')
                .in('class_id', classIds)
                .eq('school_id', schoolId)
                .eq('role', 'student');
              
              if (!studentsError && students) {
                classCount.value = students.length || 0;
                console.log(`Found ${classCount.value} students in teacher's classes`);
              }
              
              foundAttendance = true;
              break;
            }
          } catch (error) {
            console.log(`Table ${table} might not exist:`, error);
          }
        }
        
        if (!foundAttendance) {
          console.log('No attendance records found for today');
        }
      }
    } catch (error) {
      console.error('Error fetching today\'s attendance:', error);
    }
  }

  // Add this function to fetch student class information
  const fetchStudentClassInfo = async () => {
    try {
      if (userRole.value?.toLowerCase() === 'student') {
        console.log('Fetching student class information...')
        
        // Get the school_id from authStore
        const schoolId = authStore.userRole?.school_id
        if (!schoolId) {
          console.error('No school_id found for student')
          return
        }
        
        // First get the student's class_id from user_roles
        const { data: userData, error: userError } = await supabase
          .from('user_roles')
          .select('class_id')
          .eq('id', authStore.userRole?.id)
          .eq('school_id', schoolId)
          .single()

        if (userError) {
          console.error('Error fetching student class_id:', userError)
          return
        }

        if (userData?.class_id) {
          studentClassId.value = userData.class_id
          console.log('Student class_id:', studentClassId.value)

          // Now fetch the class name using the class_id and school_id
          const { data: classData, error: classError } = await supabase
            .from('classes')
            .select('class_name')
            .eq('class_id', userData.class_id)
            .eq('school_id', schoolId)
            .single()

          if (classError) {
            console.error('Error fetching class name:', classError)
            return
          }

          if (classData) {
            studentClassName.value = classData.class_name
            console.log('Student class name:', studentClassName.value)
          }

          // Fetch teachers for this class
          console.log('Fetching teachers for class:', studentClassId.value)
          const { data: teachersData, error: teachersError } = await supabase
            .from('user_roles')
            .select('username')
            .eq('class_id', studentClassId.value)
            .eq('school_id', schoolId)
            .eq('role', 'teacher')

          if (teachersError) {
            console.error('Error fetching teachers:', teachersError)
            classTeachers.value = []
          } else if (teachersData && teachersData.length > 0) {
            // Extract teacher names and filter out any null/undefined values
            classTeachers.value = teachersData
              .map(teacher => teacher.username)
              .filter(name => name) // Remove any null/undefined values
            console.log('Found teachers:', classTeachers.value)
          } else {
            console.log('No teachers found for this class')
            classTeachers.value = []
          }

          // Fetch assignment count for the student's class
          // Try different possible table names for assignments
          const assignmentTables = ['assignments', 'assignment', 'class_assignments']
          let foundAssignments = false

          for (const table of assignmentTables) {
            try {
              console.log(`Trying to find assignments in ${table} for class_id:`, studentClassId.value)
              const { data: assignments, error: assignmentError, count } = await supabase
                .from(table)
                .select('*', { count: 'exact' })
                .eq('class_id', studentClassId.value)
                .eq('school_id', schoolId)
                .gt('due_date', new Date().toISOString())

              if (!assignmentError && count !== null) {
                studentAssignmentCount.value = count
                console.log(`Found ${count} active assignments in table ${table} for school ${schoolId}`)
                foundAssignments = true
                break
              } else {
                console.log(`No assignments found in ${table} or error:`, assignmentError)
              }
            } catch (e) {
              console.log(`Error checking ${table}:`, e)
            }
          }

          if (!foundAssignments) {
            console.log('No assignments found in any table')
            studentAssignmentCount.value = 0
          }
        } else {
          console.log('Student has no assigned class')
          studentClassName.value = 'Unassigned'
          studentAssignmentCount.value = 0
          classTeachers.value = []
        }
      }
    } catch (error) {
      console.error('Error in fetchStudentClassInfo:', error)
      studentClassName.value = 'Error fetching class'
      studentAssignmentCount.value = 0
      classTeachers.value = []
    }
  }

  // Modify the fetchStudentDashboardData function
  const fetchStudentDashboardData = async () => {
    try {
      console.log('Starting fetchStudentDashboardData...')
      console.log('Current user role:', userRole.value)
      
      if (userRole.value?.toLowerCase() === 'student') {
        console.log('User is a student, fetching class info...')
        await fetchStudentClassInfo()
        console.log('Student dashboard data:', {
          className: studentClassName.value,
          classId: studentClassId.value
        })
      } else {
        console.log('User is not a student, skipping class info fetch')
      }
    } catch (error) {
      console.error('Error fetching student dashboard data:', error)
    }
  }

  // Fetch admin count from user_roles table
  const fetchAdminCount = async () => {
    try {
      console.log('Fetching admin count');
      // Get the school_id based on user role
      const schoolId = ['admin', 'registrar'].includes(userRole.value?.toLowerCase() || '') 
        ? authStore.userRole?.school_id 
        : userRole.value?.toLowerCase() === 'superadmin' ? authStore.getSelectedSchoolId : authStore.userRole?.school_id;

      // Base query to get admins
      let query = supabase
        .from('user_roles')
        .select('*', { count: 'exact' })
        .eq('role', 'admin');
      
      // Add school_id filter if available
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching admin count:', error);
        return;
      }
      
      adminCount.value = count || 0;
      console.log('Admin count:', adminCount.value);
    } catch (error) {
      console.error('Error fetching admin count:', error);
    }
  }

  // Initialize chart
  const initializeChart = () => {
    if (!paymentChart.value) return;
    
    if (chartInstance.value) {
      chartInstance.value.destroy();
    }
    
    const ctx = paymentChart.value.getContext('2d');
    if (!ctx) return;
    
    // Prepare chart data
    const chartData = {
      labels: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ],
      datasets: [{
        label: 'Payments',
        data: monthlyStats.value,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 5,
        barThickness: 12
      }]
    };
    
    // Chart configuration
    const config: ChartConfiguration = {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₦' + value;
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context: TooltipItem<'bar'>) {
                return '₦' + context.formattedValue;
              }
            }
          },
          legend: {
            display: false
          }
        }
      }
    };
    
    // Create and store the chart instance
    chartInstance.value = new Chart(ctx, config);
    chartInitialized.value = true;
  }

  // Show change password modal
  const handleChangePassword = () => {
    showChangePasswordModal.value = true
  }

  // Function to initialize the dashboard
  const initializeDashboard = async () => {
    loading.value = true
    
    try {
      console.log('=== Starting Dashboard Initialization ===')
      console.log('Current user role:', userRole.value)
      
      // Fetch data based on user role
      await fetchPasswordStatus()
      await fetchSchoolInfo() // Fetch school info for all roles
      
      const role = userRole.value?.toLowerCase() || '';
      console.log('Processing role:', role)
      
      if (role === 'student') {
        console.log('Initializing student dashboard...')
        await fetchStudentDashboardData()
        console.log('Student dashboard initialization complete:', {
          className: studentClassName.value,
          classId: studentClassId.value
        })
      } else if (role === 'superadmin') {
        // For superadmin, fetch school count
        console.log('Initializing dashboard for superadmin');
        await fetchSchoolCount()
      } else if (role === 'admin' || role === 'registrar') {
        // For admin/registrar, fetch teacher and student counts
        console.log('Initializing dashboard for admin/registrar');
        await Promise.all([
          fetchTeacherCount(),
          fetchStudentCount(),
          fetchAdminCount(),
          fetchRecentPayments()
        ])
      } else if (role === 'teacher') {
        // For teachers, fetch classroom data
        console.log('Initializing dashboard for teacher - fetching teacher data');
        await fetchTeacherDashboardData()
        console.log('Teacher dashboard data completed:', {
          className: teacherClassName.value,
          classCount: classCount.value,
          assignmentCount: assignmentCount.value,
          attendanceCount: attendanceCount.value
        });
      } else {
        console.log('Unknown role - no specific data fetched:', role);
      }
      
      // Initialize chart if needed
      if (showChart.value) {
        initChart.value = true
        nextTick(() => {
          if (paymentChart.value) {
            initializeChart()
          }
        })
      }
    } catch (error) {
      console.error('Error initializing dashboard:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      loading.value = false
      console.log('=== Dashboard Initialization Complete ===')
    }
  }

  // Clean up on component unmounting
  const cleanUp = () => {
    if (chartInstance.value) {
      chartInstance.value.destroy()
      chartInstance.value = null
    }
  }

  // Return everything needed in the component
  return {
    loading,
    showAddUserModal,
    showChangePasswordModal,
    hasChangedPassword,
    recentPayments,
    teacherCount,
    studentCount,
    schoolCount,
    paymentChart,
    selectedYear,
    availableYears,
    monthlyStats,
    hasPaymentData,
    teacherPortalEnabled,
    classCount,
    assignmentCount,
    attendanceCount,
    teacherClassName,
    todayAttendance,
    showPasswordChangeAlert,
    userName,
    userRole,
    userInitials,
    today,
    attendancePercentage,
    getStudentInitials,
    formatAmount,
    isStudentOrParent,
    isAdminOrHigher,
    isRegistrarOrHigher,
    isTeacherOrHigher,
    showFinanceContent,
    canViewPayments,
    canViewFinancials,
    canViewRegistration,
    canViewTeaching,
    showChart,
    fetchRecentPayments,
    fetchTeacherCount,
    fetchStudentCount,
    fetchSchoolCount,
    fetchTeacherDashboardData,
    fetchStudentDashboardData,
    fetchSchoolInfo,
    fetchAdminCount,
    handleChangePassword,
    initializeDashboard,
    initializeChart,
    cleanUp,
    // Expose authStore for template usage
    authStore,
    adminCount,
    studentClassName,
    studentClassId,
    studentAssignmentCount,
    classTeachers,
    fetchStudentClassInfo
  }
} 