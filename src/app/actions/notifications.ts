'use server'

import { createClient } from '@/utils/supabase/server'

export async function saveSubscription(subscription: PushSubscriptionJSON) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    throw new Error('Invalid subscription object')
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    }, {
        onConflict: 'user_id, endpoint'
    })

  if (error) {
    console.error('Error saving subscription:', error)
    throw new Error('Failed to save subscription')
  }
}

export async function deleteSubscription(endpoint: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
  
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', endpoint)
        .eq('user_id', user.id)
    
    if (error) {
        throw new Error('Failed to delete subscription')
    }
}
