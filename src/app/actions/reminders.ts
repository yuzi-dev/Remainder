'use server'

import { createClient } from '@/utils/supabase/server'
import { reminderSchema, type ReminderInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getReminders(options: {
  query?: string
  status?: string
  categoryId?: string
} = {}) {
  const supabase = await createClient()
  let query = supabase
    .from('reminders')
    .select('*, categories(*)')
    .order('created_at', { ascending: false })

  if (options.query) {
    query = query.ilike('title', `%${options.query}%`)
  }

  if (options.status === 'completed') {
    query = query.eq('is_completed', true)
  } else if (options.status === 'pending') {
    query = query.eq('is_completed', false)
  } else if (options.status === 'scheduled') {
    query = query.eq('is_completed', false).not('due_date', 'is', null)
  }

  if (options.categoryId) {
    query = query.eq('category_id', options.categoryId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createReminder(input: ReminderInput) {
  const result = reminderSchema.safeParse(input)
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('reminders')
    .insert({
      ...result.data,
      user_id: user.id,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateReminder(id: string, input: Partial<ReminderInput>) {
  // Partial validation could be added here if strict checking is needed
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('reminders')
    .update(input)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleReminderCompletion(id: string, is_completed: boolean) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('reminders')
    .update({ is_completed })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteReminder(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
