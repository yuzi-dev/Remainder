import { getReminders } from '@/app/actions/reminders'
import { getCategories } from '@/app/actions/categories'
import { DashboardSummary } from '@/components/dashboard/DashboardSummary'
import { ReminderDialog } from '@/components/reminders/ReminderDialog'
import { ReminderList } from '@/components/reminders/ReminderList'
import { SearchFilter } from '@/components/reminders/SearchFilter'

interface DashboardPageProps {
  searchParams: Promise<{
    query?: string
    status?: string
    category?: string
  }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams
  const [reminders, categories] = await Promise.all([
    getReminders({
      query: params.query,
      status: params.status,
      categoryId: params.category,
    }),
    getCategories(),
  ])

  const stats = {
    total: reminders?.length || 0,
    completed: reminders?.filter(r => r.is_completed).length || 0,
    scheduled: reminders?.filter(r => r.due_date && !r.is_completed).length || 0,
    today: reminders?.filter(r => {
      if (!r.due_date || r.is_completed) return false
      const today = new Date()
      const due = new Date(r.due_date)
      return due.toDateString() === today.toDateString()
    }).length || 0,
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <ReminderDialog categories={categories || []} />
        </div>
      </div>

      <DashboardSummary {...stats} />

      <SearchFilter categories={categories || []} />

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Recent Reminders</h3>
        <ReminderList reminders={reminders || []} categories={categories || []} />
      </div>
    </div>
  )
}
