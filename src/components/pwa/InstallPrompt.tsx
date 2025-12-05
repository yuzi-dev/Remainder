'use client'

import { useState, useEffect } from 'react'
import { X, Download, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone
    if (isStandalone) return

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS, show it if not standalone
    if (isIOSDevice && !isStandalone) {
        setShowPrompt(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
      setShowPrompt(false)
    }
  }

  if (!showPrompt) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:hidden">
       <div className="bg-background border rounded-lg shadow-lg p-4 flex flex-col gap-3 animate-in slide-in-from-top-10 fade-in">
         <div className="flex justify-between items-start">
            <div>
                <h3 className="font-semibold">Install Remainder</h3>
                <p className="text-sm text-muted-foreground">Install the app for a better experience</p>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-2" onClick={() => setShowPrompt(false)}>
                <X className="h-4 w-4" />
            </Button>
         </div>
         
         {isIOS ? (
             <div className="text-sm bg-secondary/50 p-2 rounded text-muted-foreground">
                 Tap <Share className="h-4 w-4 inline mx-1" /> then "Add to Home Screen"
             </div>
         ) : (
             <Button className="w-full gap-2" onClick={handleInstall}>
                <Download className="h-4 w-4" />
                Install App
             </Button>
         )}
       </div>
    </div>
  )
}
