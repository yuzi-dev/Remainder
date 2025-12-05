// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
//
// This Edge Function requires the following environment variables:
// - SUPABASE_URL
// - SERVICE_ROLE_KEY
// - VAPID_SUBJECT (mailto:your-email@example.com)
// - VAPID_PUBLIC_KEY
// - VAPID_PRIVATE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import webpush from 'https://esm.sh/web-push@3.6.7'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!
const vapidSubject = Deno.env.get('VAPID_SUBJECT')!
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

webpush.setVapidDetails(
  vapidSubject,
  vapidPublicKey,
  vapidPrivateKey
)

Deno.serve(async (req) => {
  try {
    const now = new Date().toISOString()
    
    // Find reminders that are due, pending, and haven't been notified yet
    const { data: reminders, error: remindersError } = await supabase
      .from('reminders')
      .select('*, profiles:user_id (notification_sound)')
      .eq('is_completed', false)
      .eq('notified', false)
      .lte('due_date', now)
    
    if (remindersError) throw remindersError
    
    console.log(`Found ${reminders.length} due reminders to notify`)

    const results = []

    for (const reminder of reminders) {
       // Get subscriptions for the user
       const { data: subscriptions } = await supabase
         .from('push_subscriptions')
         .select('*')
         .eq('user_id', reminder.user_id)
         
       if (subscriptions && subscriptions.length > 0) {
         // Determine sound URL
         let soundUrl = 'https://remainder-app.vercel.app/sounds/default.mp3'
         if (reminder.profiles?.notification_sound) {
           const sound = reminder.profiles.notification_sound
           if (sound.startsWith('http')) {
             soundUrl = sound
           } else {
             soundUrl = `https://remainder-app.vercel.app/sounds/${sound}.mp3`
           }
         }

         for (const sub of subscriptions) {
           try {
             const payload = JSON.stringify({
               title: reminder.title,
               body: `Due: ${new Date(reminder.due_date).toLocaleString()}`,
               icon: '/icon-192x192.png',
               url: `https://remainder-app.vercel.app/dashboard`,
               sound: soundUrl
             })
             
             await webpush.sendNotification({
               endpoint: sub.endpoint,
               keys: {
                 p256dh: sub.p256dh,
                 auth: sub.auth
               }
             }, payload)
             
             results.push({ reminderId: reminder.id, status: 'sent', endpoint: sub.endpoint })
             
           } catch (err) {
             console.error('Failed to send notification', err)
             if (err.statusCode === 410) {
               // Subscription expired, delete it
               await supabase.from('push_subscriptions').delete().eq('id', sub.id)
             }
             results.push({ reminderId: reminder.id, status: 'failed', error: err.message })
           }
         }
       }
       
       // Mark reminder as notified
       await supabase
         .from('reminders')
         .update({ notified: true })
         .eq('id', reminder.id)
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, details: results }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
