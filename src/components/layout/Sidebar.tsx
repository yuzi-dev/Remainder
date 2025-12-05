'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Settings,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState, useEffect } from 'react'
import { Profile } from '@/lib/types'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Scheduled',
    href: '/dashboard/scheduled',
    icon: Calendar,
  },
  {
    title: 'Completed',
    href: '/dashboard/completed',
    icon: CheckSquare,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }
    getProfile()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
      <SidebarContent
        pathname={pathname}
        profile={profile}
        onSignOut={handleSignOut}
      />
    </div>
  )
}

function SidebarContent({
  pathname,
  profile,
  onSignOut,
}: {
  pathname: string
  profile: Profile | null
  onSignOut: () => void
}) {
  return (
    <div className="flex h-full flex-col justify-between py-6">
      <div className="px-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
             <CheckSquare className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">RemindMe</span>
        </div>

        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* User Profile */}
        {profile && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-secondary/20">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback>{profile.display_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">
                {profile.display_name || 'User'}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {profile.email}
              </span>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
