'use client'

import { Reminder, Category } from '@/lib/types'
import { format } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toggleReminderCompletion, deleteReminder } from '@/app/actions/reminders'
import { toast } from 'sonner'
import { Trash2, Calendar, Flag, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { ReminderDialog } from './ReminderDialog'

interface ReminderItemProps {
  reminder: Reminder & { categories?: Category | null }
  categories: Category[]
}

export function ReminderItem({ reminder, categories }: ReminderItemProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleToggle = async () => {
    const newState = !reminder.is_completed
    try {
      await toggleReminderCompletion(reminder.id, newState)
    } catch (error) {
      toast.error('Failed to update reminder')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteReminder(reminder.id)
      toast.success('Reminder deleted')
    } catch (error) {
      toast.error('Failed to delete reminder')
    }
  }

  const priorityColors = {
    low: 'text-blue-500',
    medium: 'text-yellow-500',
    high: 'text-red-500',
    none: 'text-muted-foreground',
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={cn(
          'group flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md',
          reminder.is_completed && 'opacity-60'
        )}
      >
        <Checkbox
          checked={reminder.is_completed}
          onCheckedChange={handleToggle}
          className="h-5 w-5 rounded-full border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />

        <div className="flex-1 space-y-1">
          <h4 className={cn('font-medium leading-none', reminder.is_completed && 'line-through text-muted-foreground')}>
            {reminder.title}
          </h4>
          
          {(reminder.description || reminder.due_date || reminder.categories) && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {reminder.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(reminder.due_date), 'MMM d, h:mm a')}
                </div>
              )}
              
              {reminder.categories && (
                <div className="flex items-center gap-1">
                  <div 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: reminder.categories.color }}
                  />
                  {reminder.categories.name}
                </div>
              )}

              {reminder.priority !== 'none' && (
                  <div className={cn('flex items-center gap-1 font-medium', priorityColors[reminder.priority])}>
                      <Flag className="h-3 w-3" />
                      {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
                  </div>
              )}
            </div>
          )}
          
          {reminder.audio_url && (
            <div className="mt-2">
              <audio controls className="h-8 w-full max-w-[200px]">
                <source src={reminder.audio_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>

        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="text-muted-foreground hover:text-primary"
            >
                <Pencil className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
      </motion.div>

      <ReminderDialog 
        open={isEditing} 
        onOpenChange={setIsEditing} 
        categories={categories} 
        reminder={reminder} 
      />
    </>
  )
}
