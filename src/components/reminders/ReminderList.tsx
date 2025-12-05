'use client'

import { Reminder, Category } from '@/lib/types'
import { ReminderItem } from './ReminderItem'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface ReminderListProps {
  reminders: (Reminder & { categories?: Category | null })[]
  categories: Category[]
}

export function ReminderList({ reminders, categories }: ReminderListProps) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('realtime-reminders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
        },
        () => {
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  if (reminders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <p>No reminders yet.</p>
        <p className="text-sm">Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {reminders.map((reminder) => (
          <ReminderItem key={reminder.id} reminder={reminder} categories={categories} />
        ))}
      </AnimatePresence>
    </div>
  )
}
