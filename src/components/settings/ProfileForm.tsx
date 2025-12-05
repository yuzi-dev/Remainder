'use client'

import { updateProfile } from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Profile } from '@/lib/types'

interface ProfileFormProps {
  profile: Profile | null
}

export function ProfileForm({ profile }: ProfileFormProps) {
  async function clientAction(formData: FormData) {
    const result = await updateProfile(formData)
    if (result?.error) {
      if (typeof result.error === 'string') {
        toast.error(result.error)
      } else {
        // Handle validation errors object
        toast.error('Failed to update profile')
      }
    } else {
      toast.success('Profile updated successfully')
    }
  }

  return (
    <form action={clientAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          value={profile?.email || ''} 
          disabled 
          className="bg-muted"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="display_name">Display Name</Label>
        <Input 
          id="display_name" 
          name="display_name" 
          defaultValue={profile?.display_name || ''} 
          placeholder="Your Name"
        />
      </div>

      <Button type="submit">Save Changes</Button>
    </form>
  )
}
