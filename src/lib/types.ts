export type Priority = 'low' | 'medium' | 'high' | 'none'

export type Reminder = {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null
  is_completed: boolean
  category_id: string | null
  priority: Priority
  repeat_rule: string | null // JSON string
  audio_url: string | null
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export type Profile = {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}
