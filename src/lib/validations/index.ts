import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color code'),
})

export type CategoryInput = z.infer<typeof categorySchema>

export const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().optional(),
  due_date: z.string().nullable().optional(), // ISO date string
  category_id: z.string().uuid().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high', 'none']),
  repeat_rule: z.string().nullable().optional(),
  audio_url: z.string().nullable().optional(),
})

export type ReminderInput = z.infer<typeof reminderSchema>
