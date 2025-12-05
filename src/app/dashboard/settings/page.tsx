import { getProfile } from '@/app/actions/profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PushNotificationManager } from '@/components/settings/PushNotificationManager'
import { SoundSelector } from '@/components/settings/SoundSelector'
import { ProfileForm } from '@/components/settings/ProfileForm'
import { SignOutButton } from '@/components/settings/SignOutButton'

export default async function SettingsPage() {
  const profile = await getProfile()

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

      <PushNotificationManager />

      <Card>
        <CardHeader>
          <CardTitle>Notification Sound</CardTitle>
          <CardDescription>
            Choose a sound for your reminders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SoundSelector 
            defaultValue={profile?.notification_sound || 'default'}
            defaultName={profile?.custom_sound_name || 'Custom Sound'} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>

      <SignOutButton />
    </div>
  )
}
