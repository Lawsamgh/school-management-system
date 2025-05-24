import { supabase } from '../lib/supabase'
import { sendSMS } from './smsService'

interface BirthdayPerson {
  id: string
  username: string
  phone: string
  role: string
  school_id: string
  dob: string
}

type DatabaseStudent = {
  identification: string
  username: string
  phone: string
  school_id: string
  dob: string
}

type DatabaseStaff = {
  id: string
  username: string
  phone: string
  school_id: string
  dob: string
}

/**
 * Checks if SMS notifications are enabled for a school
 */
const isSmsEnabled = async (schoolId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('setup')
      .select('sms')
      .eq('school_id', schoolId)
      .single()

    if (error) throw error
    return data?.sms === 'true'
  } catch (error) {
    console.error('Error checking SMS settings:', error)
    return false
  }
}

/**
 * Gets all people (staff and students) who have birthdays today
 */
const getTodaysBirthdays = async (): Promise<BirthdayPerson[]> => {
  const today = new Date()
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const day = today.getDate().toString().padStart(2, '0')
  const birthdayPattern = `%-${month}-${day}` // Matches any year

  try {
    // Get students with birthdays
    const { data: students, error: studentError } = await supabase
      .from('user_roles')
      .select('identification, username, phone, school_id, dob')
      .ilike('dob', birthdayPattern)
      .not('dob', 'is', null)

    if (studentError) throw studentError

    // Get staff with birthdays
    const { data: staff, error: staffError } = await supabase
      .from('user_roles')
      .select('id, username, phone, school_id, dob')
      .ilike('dob', birthdayPattern)
      .not('dob', 'is', null)
      .in('role', ['admin', 'teacher', 'registrar'])

    if (staffError) throw staffError

    // Combine and format results
    const studentBirthdays = (students || []).map((s: DatabaseStudent): BirthdayPerson => ({
      id: s.identification,
      username: s.username,
      phone: s.phone,
      role: 'student',
      school_id: s.school_id,
      dob: s.dob
    }))

    const staffBirthdays = (staff || []).map((s: DatabaseStaff): BirthdayPerson => ({
      id: s.id,
      username: s.username,
      phone: s.phone,
      role: 'staff',
      school_id: s.school_id,
      dob: s.dob
    }))

    return [...studentBirthdays, ...staffBirthdays]
  } catch (error) {
    console.error('Error fetching birthdays:', error)
    return []
  }
}

/**
 * Sends birthday wishes via SMS
 */
const sendBirthdayWishes = async (person: BirthdayPerson): Promise<void> => {
  try {
    // Check if SMS is enabled for this school
    const smsEnabled = await isSmsEnabled(person.school_id)
    if (!smsEnabled) {
      console.log(`SMS disabled for school ${person.school_id}, skipping birthday wish for ${person.username}`)
      return
    }

    // Skip if no phone number
    if (!person.phone) {
      console.log(`No phone number for ${person.username}, skipping birthday wish`)
      return
    }

    // Customize message based on role
    const message = person.role === 'student'
      ? `Happy Birthday ${person.username}! 🎉 Wishing you a fantastic day filled with joy and success in your studies. Best wishes from your school family! 🎂`
      : `Happy Birthday ${person.username}! 🎉 Thank you for your dedication and service. Wishing you a wonderful day filled with joy and happiness! 🎂`

    await sendSMS(person.phone, message)
    console.log(`Birthday wish sent to ${person.username} (${person.phone})`)
  } catch (error) {
    console.error(`Error sending birthday wish to ${person.username}:`, error)
  }
}

/**
 * Main function to process birthday notifications
 */
export const processBirthdayNotifications = async (): Promise<void> => {
  try {
    console.log('Starting birthday notifications process...')
    const birthdays = await getTodaysBirthdays()
    
    console.log(`Found ${birthdays.length} birthdays today`)
    
    for (const person of birthdays) {
      await sendBirthdayWishes(person)
    }
    
    console.log('Birthday notifications process completed')
  } catch (error) {
    console.error('Error processing birthday notifications:', error)
  }
} 