'use client'

import { useEffect } from 'react'

export function NotificationSoundListener() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'PLAY_SOUND' && event.data.url) {
          const audio = new Audio(event.data.url)
          audio.play().catch(err => console.error('Failed to play notification sound:', err))
        }
      }

      navigator.serviceWorker.addEventListener('message', handler)
      return () => navigator.serviceWorker.removeEventListener('message', handler)
    }
  }, [])

  return null
}
