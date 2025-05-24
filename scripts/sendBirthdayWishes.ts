import { processBirthdayNotifications } from '../src/services/birthdayService'

/**
 * Script to send birthday wishes
 * This script is meant to be run by a cron job once per day
 */
async function main() {
  try {
    await processBirthdayNotifications()
    process.exit(0)
  } catch (error) {
    console.error('Error in birthday notifications script:', error)
    process.exit(1)
  }
}

main() 