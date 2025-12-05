import { getReminders } from '@/app/actions/reminders'
import { getCategories } from '@/app/actions/categories'
import { ReminderList } from '@/components/reminders/ReminderList'

export default async function ScheduledPage() {
  const [reminders, categories] = await Promise.all([
    getReminders({ status: 'scheduled' }),
    getCategories(),
  ])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Scheduled Reminders</h2>
      </div>

      <div className="space-y-4">
        <ReminderList reminders={reminders || []} categories={categories || []} />
      </div>
    </div>
  )
}
