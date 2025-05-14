import { supabaseAdmin } from '@/lib/supabase'

// Verify admin client is available
if (!supabaseAdmin) {
  throw new Error('Admin client not available. Missing service role key.')
}

// After this point, TypeScript knows supabaseAdmin is not null
const admin = supabaseAdmin

export const getUsers = async () => {
  try {
    const { data, error } = await admin.auth.admin.listUsers()
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('Error in getUsers:', error)
    throw error
  }
}

export const deleteUser = async (userId: string) => {
  try {
    // 1. Get the user's email from Auth
    const { data: userData, error: getUserError } = await admin.auth.admin.getUserById(userId)
    if (getUserError) throw getUserError
    const email = userData?.user?.email
    // 2. Delete user from Auth
    const { error: authError } = await admin.auth.admin.deleteUser(userId)
    if (authError) throw authError
    // 3. Delete from user_roles if email exists
    if (email) {
      const { error: roleError } = await admin
        .from('user_roles')
        .delete()
        .eq('email', email)
      if (roleError) throw roleError
    }
    return true
  } catch (error) {
    console.error('Error in deleteUser:', error)
    throw error
  }
}

export const getUsersWithRoles = async (requestingRole?: string, schoolId?: string | null) => {
  try {
    // Fetch users from Auth
    const { data: usersData, error: usersError } = await admin.auth.admin.listUsers();
    if (usersError) throw usersError;

    // Build the query for roles data
    let query = admin
      .from('user_roles')
      .select('email, role, username, identification, grade_level, dob, age, gender, class_id, nationality, religion, classes(class_name), school_id');

    // Add school_id filter if provided
    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }

    // Execute the query
    const { data: rolesData, error: rolesError } = await query;
    if (rolesError) throw rolesError;

    // Map roles to users by email
    let usersWithRoles = usersData.users.map(user => {
      const userRole = rolesData?.find(r => r.email && user.email && r.email.toLowerCase() === user.email.toLowerCase());
      return {
        ...user,
        custom_role: userRole ? userRole.role : 'user',
        username: userRole ? userRole.username : '',
        identification: userRole ? userRole.identification : null,
        grade_level: userRole ? userRole.grade_level : null,
        dob: userRole ? userRole.dob : null,
        age: userRole ? userRole.age : null,
        gender: userRole ? userRole.gender : null,
        class_id: userRole ? userRole.class_id : null,
        class_name: (() => {
          if (!userRole || !userRole.classes) return null;
          if (Array.isArray(userRole.classes)) {
            return userRole.classes[0]?.class_name ?? null;
          }
          if (typeof userRole.classes === 'object' && 'class_name' in userRole.classes) {
            return (userRole.classes as { class_name?: string }).class_name ?? null;
          }
          return null;
        })(),
        nationality: userRole ? userRole.nationality : null,
        religion: userRole ? userRole.religion : null,
        school_id: userRole ? userRole.school_id : null
      };
    });

    // Filter out users that don't have a role in the specified school
    if (schoolId) {
      usersWithRoles = usersWithRoles.filter(user => {
        const userRole = rolesData?.find(r => r.email && user.email && r.email.toLowerCase() === user.email.toLowerCase());
        return userRole && userRole.school_id === schoolId;
      });
    }

    // If requestingRole is admin, filter out superadmin users
    if (requestingRole === 'admin') {
      usersWithRoles = usersWithRoles.filter(u => u.custom_role !== 'superadmin');
    }

    return { users: usersWithRoles };
  } catch (error) {
    console.error('Error in getUsersWithRoles:', error);
    throw error;
  }
};

export const addUserWithRole = async ({ 
  email, 
  username, 
  role,
  identification,
  gradeLevel,
  dob,
  age,
  gender,
  class_id,
  nationality,
  religion,
  school_id
}: { 
  email: string
  username: string
  role: string
  identification?: string
  gradeLevel?: string
  dob?: string
  age?: number
  gender?: string
  class_id?: string
  nationality?: string
  religion?: string
  school_id?: string | null
}) => {
  try {
    const DEFAULT_PASSWORD = '12345678'

    // 1. Create user in Supabase Auth with default password
    const { data: userData, error: userError } = await admin.auth.admin.createUser({
      email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: username }
    })
    if (userError) throw userError

    // 2. Insert into user_roles with additional fields
    const { error: roleError } = await admin
      .from('user_roles')
      .insert([{ 
        email, 
        username, 
        role,
        identification: identification || null,
        grade_level: gradeLevel || null,
        dob: dob || null,
        age: age || null,
        gender: gender || null,
        class_id: class_id || null,
        nationality: nationality || null,
        religion: religion || null,
        school_id: school_id || null
      }])
    if (roleError) throw roleError
    return userData
  } catch (error) {
    console.error('Error in addUserWithRole:', error)
    throw error
  }
}

export const updateUserWithRole = async ({ 
  email, 
  username, 
  role,
  identification,
  gradeLevel,
  dob,
  age,
  gender,
  class_id,
  nationality,
  religion 
}: { 
  email: string, 
  username: string, 
  role: string,
  identification?: string,
  gradeLevel?: string,
  dob?: string,
  age?: number,
  gender?: string,
  class_id?: string,
  nationality?: string,
  religion?: string 
}) => {
  try {
    // 1. Find the user by email in Auth
    const { data: listData, error: listError } = await admin.auth.admin.listUsers()
    if (listError) throw listError
    const user = listData?.users?.find((u: any) => u.email && u.email.toLowerCase() === email.toLowerCase())
    if (!user) throw new Error('User not found in Auth')

    // 2. Update user metadata in Auth
    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { full_name: username }
    })
    if (updateError) throw updateError

    // 3. Update user_roles table with additional fields
    const { error: roleError } = await admin
      .from('user_roles')
      .update({ 
        username, 
        role,
        identification: identification || null,
        grade_level: gradeLevel || null,
        dob: dob || null,
        age: age || null,
        gender: gender || null,
        class_id: class_id || null,
        nationality: nationality || null,
        religion: religion || null
      })
      .eq('email', email)
    if (roleError) throw roleError
    return true
  } catch (error) {
    console.error('Error in updateUserWithRole:', error)
    throw error
  }
}

// Add interface for Grade
interface Grade {
  id: number
  grade_level: string
}

// Add function to fetch grades
export const getGrades = async (): Promise<Grade[]> => {
  try {
    const { data, error } = await admin
      .from('grade')
      .select('id, grade_level')
      .order('grade_level', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching grades:', error)
    throw error
  }
}

export const getClasses = async () => {
  const { data, error } = await admin
    .from('classes')
    .select('class_id, class_name')
    .order('class_name', { ascending: true })
  if (error) throw error
  return data || []
} 