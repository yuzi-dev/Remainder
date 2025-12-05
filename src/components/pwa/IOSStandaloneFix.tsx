'use client'

import { useEffect } from 'react'

export function IOSStandaloneFix() {
  useEffect(() => {
    // This script prevents links from opening in Safari when in standalone mode on iOS
    if (
      typeof window !== 'undefined' &&
      'standalone' in window.navigator &&
      (window.navigator as any).standalone
    ) {
      const handler = (e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest('a')
        if (!target) return

        // Ignore links that are not internal or have target="_blank"
        if (
          target.getAttribute('target') === '_blank' ||
          target.getAttribute('rel')?.includes('external') ||
          !target.getAttribute('href')
        ) {
          return
        }

        const href = target.getAttribute('href')
        if (!href) return

        // If it's an internal link, prevent default and use location.href
        // This keeps it within the standalone app container
        if (href.startsWith('/') || href.includes(window.location.origin)) {
          e.preventDefault()
          window.location.href = href
        }
      }

      document.addEventListener('click', handler, false)

      return () => {
        document.removeEventListener('click', handler, false)
      }
    }
  }, [])

  return null
}
