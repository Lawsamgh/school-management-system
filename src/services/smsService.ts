import { supabase } from '@/lib/supabase';

interface SMSConfig {
  clientSecret: string;
  clientId: string;
  sender: string;
}

interface SMSResponse {
  rate: number;
  messageId: string;
  status: number;
  statusDescription: string | null;
  networkId: string;
}

// Default configuration
const defaultConfig: SMSConfig = {
  clientSecret: 'mpdpztfc',
  clientId: 'wcaginsj',
  sender: 'LawsamGH'
};

/**
 * Formats a phone number to international format (233xxxxxxxxx)
 * @param phone - The phone number to format
 * @returns Formatted phone number
 */
const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\s+/g, ''); // Remove whitespace
  if (cleaned.startsWith('0')) {
    return '233' + cleaned.substring(1); // Convert 0xx to 233xx
  }
  if (cleaned.startsWith('+233')) {
    return cleaned.substring(1); // Remove + if present
  }
  if (!cleaned.startsWith('233')) {
    return '233' + cleaned; // Add 233 prefix if not present
  }
  return cleaned;
};

/**
 * Sends an SMS using the Hubtel SMS API
 * @param to - Recipient phone number
 * @param message - Message content
 * @param config - Optional SMS configuration
 * @returns Promise with SMS response
 * @throws Error if SMS sending fails
 */
export const sendSMS = async (
  to: string,
  message: string,
  config: Partial<SMSConfig> = {}
): Promise<SMSResponse> => {
  // Validate inputs
  if (!to || !message) {
    throw new Error('Phone number and message are required');
  }

  // Merge default config with provided config
  const finalConfig = { ...defaultConfig, ...config };
  
  // Format phone number
  const formattedPhone = formatPhoneNumber(to);
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Construct API URL
  const smsUrl = `https://smsc.hubtel.com/v1/messages/send?clientsecret=${finalConfig.clientSecret}&clientid=${finalConfig.clientId}&from=${finalConfig.sender}&to=${formattedPhone}&content=${encodedMessage}`;
  
  // Temporary debug logging
  console.log('SMS Debug Info:', {
    to: formattedPhone,
    message: message,
    messageLength: message.length,
    fullUrl: smsUrl
  });

  try {
    const response = await fetch(smsUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Log the API response
    console.log('SMS API Response:', result);
    
    return result as SMSResponse;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to send SMS');
  }
};

// Get school name from the database
const getSchoolName = async (schoolId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('name')
      .eq('id', schoolId)
      .single();
    
    if (error) throw error;
    return data?.name || 'School';
  } catch (error) {
    console.error('Error fetching school name:', error);
    return 'School';
  }
};

/**
 * Sends a payment confirmation SMS
 * @param paymentData - Payment data object
 * @returns Promise with SMS response
 * @throws Error if payment data is invalid or SMS sending fails
 */
export const sendPaymentConfirmationSMS = async (paymentData: {
  phone: string;
  amount: number;
  payment_for: string;
  payment_id: string;
  student_name: string;
  identification: string;
  school_id?: string;
}): Promise<SMSResponse> => {
  // Validate payment data
  if (!paymentData.phone || !paymentData.amount || !paymentData.payment_for || !paymentData.payment_id) {
    throw new Error('Invalid payment data: All fields are required');
  }

  // Get school name if school_id is provided
  const schoolName = paymentData.school_id ? 
    await getSchoolName(paymentData.school_id) : 
    'School';

  const formattedAmount = Number(paymentData.amount).toFixed(2);
  // Updated message format with school name, student info and thank you note
  const message = `[ ${schoolName} ] Payment: GHC${formattedAmount} received for ${paymentData.payment_for}. Student: ${paymentData.student_name}(${paymentData.identification}). Receipt:${paymentData.payment_id}. Thank you for choosing us!`;
  
  // Log message length for monitoring
  console.log('Message length:', message.length, 'characters');
  
  return sendSMS(paymentData.phone, message);
}; 