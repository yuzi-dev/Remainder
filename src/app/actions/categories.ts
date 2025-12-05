'use server'

import { createClient } from '@/utils/supabase/server'
import { categorySchema, type CategoryInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createCategory(input: CategoryInput) {
  const result = categorySchema.safeParse(input)
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('categories')
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

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
