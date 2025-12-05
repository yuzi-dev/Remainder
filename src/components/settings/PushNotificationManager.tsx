'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { saveSubscription, deleteSubscription } from '@/app/actions/notifications'
import { urlBase64ToUint8Array } from '@/lib/utils'
import { toast } from 'sonner'
import { Bell, BellOff } from 'lucide-react'

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)
  }

  async function subscribe() {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      
      if (!vapidPublicKey) {
        throw new Error('VAPID Public Key is missing in environment variables')
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      await saveSubscription(sub.toJSON())
      setSubscription(sub)
      toast.success('Notifications enabled!')
    } catch (error) {
      console.error('Failed to subscribe:', error)
      toast.error('Failed to enable notifications. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe() {
    setLoading(true)
    try {
      if (subscription) {
        await deleteSubscription(subscription.endpoint)
        await subscription.unsubscribe()
        setSubscription(null)
        toast.success('Notifications disabled')
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error)
      toast.error('Failed to disable notifications')
    } finally {
      setLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Push notifications are not supported in this browser.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription>
          Receive notifications for your scheduled reminders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {subscription ? 'Notifications are enabled' : 'Notifications are disabled'}
            </p>
            <p className="text-sm text-muted-foreground">
              {subscription 
                ? 'You will receive alerts for your reminders.' 
                : 'Enable notifications to stay updated.'}
            </p>
          </div>
          <Button
            variant={subscription ? "outline" : "default"}
            onClick={subscription ? unsubscribe : subscribe}
            disabled={loading}
          >
            {subscription ? (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                Disable
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Enable
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
