import { supabaseAdmin } from '@/lib/supabase'

// Verify admin client is available
if (!supabaseAdmin) {
  throw new Error('Admin client not available. Missing service role key.')
}

// After this point, TypeScript knows supabaseAdmin is not null
const admin = supabaseAdmin

// Fetch payments with admin privileges (bypassing RLS)
export const getPayments = async () => {
  try {
    const { data, error } = await admin
      .from('payments')
      .select('payment_id, payment_type, payment_by, phone, student_name, identification, payment_for, amount, payment_date, expected_amount, amount_remaining, reference_payment, payment_mode')
      .order('payment_id', { ascending: false })
      
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error in getPayments:', error)
    throw error
  }
}

// Get payments by date range and optional filters
export const getPaymentsByDateRange = async (
  startDate: string,
  endDate: string,
  paymentType?: string,
  paymentPurpose?: string
) => {
  try {
    // Start building the query
    let query = admin
      .from('payments')
      .select('*')
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
    
    // Add payment type filter if specified
    if (paymentType) {
      query = query.eq('payment_type', paymentType)
    }
    
    // Add payment purpose filter if specified
    if (paymentPurpose) {
      query = query.eq('payment_for', paymentPurpose)
    }
    
    // Order by payment date descending
    query = query.order('payment_date', { ascending: false })
    
    // Execute the query
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error in getPaymentsByDateRange:', error)
    throw error
  }
}

// Get payment options (like fees types and amounts)
export const getPaymentOptions = async () => {
  try {
    const { data, error } = await admin
      .from('payments_setup')
      .select('id, payment_for, amount, currency, created_at')
      .order('payment_for', { ascending: true })
      
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error in getPaymentOptions:', error)
    throw error
  }
}

// Add a new payment record
export const addPayment = async (payment: {
  payment_id: string
  payment_type: string
  payment_by: string
  phone: string
  payment_for: string
  student_name: string
  identification: string
  amount: number
  expected_amount: number
  payment_date: string
  amount_remaining: number
  reference_payment?: string | null
  payment_mode: string
}) => {
  try {
    const { data, error } = await admin
      .from('payments')
      .insert([payment])
      .select()
    
    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    console.error('Error in addPayment:', error)
    throw error
  }
}

// Get a specific payment by payment_id
export const getPaymentById = async (paymentId: string) => {
  try {
    const { data, error } = await admin
      .from('payments')
      .select('*')
      .eq('payment_id', paymentId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error in getPaymentById:', error)
    throw error
  }
}

// Delete a payment by payment_id
export const deletePayment = async (paymentId: string) => {
  try {
    const { error } = await admin
      .from('payments')
      .delete()
      .eq('payment_id', paymentId)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error in deletePayment:', error)
    throw error
  }
}

// Update the remaining amount of a payment
export const updatePaymentRemaining = async (paymentId: string, newRemainingAmount: number, followUpPaymentId?: string) => {
  try {
    const updateData: any = {
      amount_remaining: newRemainingAmount
    };

    // If amount is fully paid and we have a follow-up payment ID
    if (newRemainingAmount === 0 && followUpPaymentId) {
      // Get the follow-up payment to get its reference_payment value
      const { data: followUpPayment, error: followUpError } = await admin
        .from('payments')
        .select('reference_payment')
        .eq('payment_id', followUpPaymentId)
        .single();

      if (followUpError) throw followUpError;

      // Set the original payment's reference_payment to match the follow-up payment's reference_payment
      updateData.reference_payment = followUpPayment.reference_payment;
    }

    const { data, error } = await admin
      .from('payments')
      .update(updateData)
      .eq('payment_id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating payment remaining amount:', error);
    throw error;
  }
};

// Update the reference_payment field of a payment 
export const updatePaymentReference = async (paymentId: string, referencePaymentId: string) => {
  try {
    const { data, error } = await admin
      .from('payments')
      .update({ reference_payment: referencePaymentId })
      .eq('payment_id', paymentId)
      .select()
    
    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    console.error('Error in updatePaymentReference:', error)
    throw error
  }
}

// Get related payments for a payment ID (original payment and its follow-ups)
export const getRelatedPayments = async (paymentId: string) => {
  try {
    // First get the original payment if this is a follow-up payment
    const { data: payment, error: paymentError } = await admin
      .from('payments')
      .select('*')
      .eq('payment_id', paymentId)
      .single();
    
    if (paymentError) throw paymentError;
    
    // If this is a follow-up payment, get the original payment
    const originalPaymentId = payment.reference_payment || payment.payment_id;
    
    // Get all related payments (original and follow-ups)
    const { data: relatedPayments, error: relatedError } = await admin
      .from('payments')
      .select('*')
      .or(`payment_id.eq.${originalPaymentId},reference_payment.eq.${originalPaymentId}`)
      .order('payment_date', { ascending: true });
    
    if (relatedError) throw relatedError;
    return relatedPayments || [];
  } catch (error) {
    console.error('Error in getRelatedPayments:', error);
    throw error;
  }
}

// Get payment history by reference payment ID
export const getPaymentHistoryByReference = async (referencePaymentId: string) => {
  try {
    const { data, error } = await admin
      .from('payments')
      .select('*')
      .eq('reference_payment', referencePaymentId)
      .order('payment_date', { ascending: true })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error in getPaymentHistoryByReference:', error)
    throw error
  }
} 