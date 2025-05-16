/**
 * User-related utility functions
 */

/**
 * Extract initials from a username, preferably first and last name
 * @param name The name to extract initials from
 * @returns Uppercase initials (two characters)
 */
export function getUserInitials(name: string): string {
  if (!name) return '?';
  
  // Handle email addresses
  if (name.includes('@')) {
    return name.substring(0, 2).toUpperCase();
  }
  
  // Split by spaces and get initials
  const words = name.split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) return '?';
  
  // If at least two words, take first letter of first and last word
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  
  // If single word, take first two letters
  return words[0].substring(0, 2).toUpperCase();
}

/**
 * Format a display name from user data
 * @param user User object from auth store
 * @returns Formatted display name
 */
export function getDisplayName(user: any): string {
  // First try to get the name from user_metadata
  if (user?.user_metadata?.name) {
    return user.user_metadata.name;
  }
  
  // If username exists in user_metadata, use it
  if (user?.user_metadata?.username) {
    return user.user_metadata.username;
  }
  
  // Then check if user has a userRole with username
  if (user?.userRole?.username) {
    return user.userRole.username;
  }
  
  // Fallback to email if no name is set
  const email = user?.email || '';
  return email.split('@')[0];
} 