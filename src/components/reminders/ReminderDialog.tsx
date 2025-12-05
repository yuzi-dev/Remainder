'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { reminderSchema, type ReminderInput } from '@/lib/validations'
import { createReminder, updateReminder } from '@/app/actions/reminders'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Category, Reminder } from '@/lib/types'
import { AudioUpload } from './AudioUpload'
import { CategoryDialog } from './CategoryDialog'
import { useRouter } from 'next/navigation'

interface ReminderDialogProps {
  categories: Category[]
  reminder?: Reminder & { categories?: Category | null }
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// Helper to format Date to YYYY-MM-DDTHH:mm for datetime-local input
function formatToLocalDatetime(isoString: string | null | undefined) {
  if (!isoString) return ''
  const date = new Date(isoString)
  // The date object is already in local time of the browser
  // We need to format it as YYYY-MM-DDTHH:mm
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function ReminderDialog({ categories, reminder, trigger, open: controlledOpen, onOpenChange }: ReminderDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const router = useRouter()
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? onOpenChange! : setInternalOpen

  const form = useForm<ReminderInput>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'none',
      category_id: null,
      due_date: null,
      repeat_rule: null,
      audio_url: null,
    },
  })

  useEffect(() => {
    if (reminder) {
      form.reset({
        title: reminder.title,
        description: reminder.description || '',
        priority: reminder.priority,
        category_id: reminder.category_id,
        due_date: formatToLocalDatetime(reminder.due_date), // Convert UTC to local string for input
        repeat_rule: reminder.repeat_rule,
        audio_url: reminder.audio_url,
      })
    } else {
        form.reset({
            title: '',
            description: '',
            priority: 'none',
            category_id: null,
            due_date: null,
            repeat_rule: null,
            audio_url: null,
        })
    }
  }, [reminder, open, form])

  const onSubmit = async (data: ReminderInput) => {
    try {
      // Convert local datetime string back to UTC ISO string
      const submissionData = {
        ...data,
        due_date: data.due_date ? new Date(data.due_date).toISOString() : null
      }

      let result
      if (reminder) {
        result = await updateReminder(reminder.id, submissionData)
      } else {
        result = await createReminder(submissionData)
      }

      if (result.error) {
        toast.error(typeof result.error === 'string' ? result.error : `Failed to ${reminder ? 'update' : 'create'} reminder`)
      } else {
        toast.success(`Reminder ${reminder ? 'updated' : 'created'} successfully`)
        setOpen(false)
        if (!reminder) form.reset()
        router.refresh()
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Reminder
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{reminder ? 'Edit Reminder' : 'Create Reminder'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Buy groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Milk, Bread, Eggs..." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="audio_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audio Attachment</FormLabel>
                  <FormControl>
                    <AudioUpload 
                      onUploadComplete={(url) => field.onChange(url)} 
                      initialUrl={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <FormLabel>Category</FormLabel>
                    <CategoryDialog />
                </div>
                <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                    <FormItem>
                    <Select 
                        onValueChange={field.onChange} 
                        value={field.value || undefined}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                                <div 
                                className="h-2 w-2 rounded-full" 
                                style={{ backgroundColor: cat.color }}
                                />
                                {cat.name}
                            </div>
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{reminder ? 'Update' : 'Save'} Reminder</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
