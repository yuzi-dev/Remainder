'use client'

import { useState, useRef, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NOTIFICATION_SOUNDS } from '@/lib/constants'
import { Upload, Play, Loader2, Pause, Square, Pencil, Check, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { updateNotificationSound } from '@/app/actions/profile'

interface SoundSelectorProps {
  defaultValue?: string
  defaultName?: string
  onValueChange?: (value: string) => void
}

export function SoundSelector({ defaultValue = 'default', defaultName = 'Custom Sound', onValueChange }: SoundSelectorProps) {
  const [uploading, setUploading] = useState(false)
  const [customSound, setCustomSound] = useState<string | null>(
    defaultValue.startsWith('http') ? defaultValue : null
  )
  const [customName, setCustomName] = useState(defaultName)
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState(defaultName)
  
  const [selectedValue, setSelectedValue] = useState(defaultValue)
  const [isPlaying, setIsPlaying] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file')
      return
    }

    try {
      setUploading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Unauthorized')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('notification-sounds')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('notification-sounds')
        .getPublicUrl(fileName)

      const name = file.name.replace(/\.[^/.]+$/, "") // Remove extension
      setCustomSound(publicUrl)
      setCustomName(name)
      setTempName(name)
      
      // Update both sound and name
      await updateNotificationSound(publicUrl, name)
      handleSelectChange(publicUrl)
      
      toast.success('Sound uploaded successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to upload sound')
    } finally {
      setUploading(false)
    }
  }

  const handleRename = async () => {
    if (!tempName.trim()) return
    
    setCustomName(tempName)
    setIsEditingName(false)
    
    if (customSound && selectedValue === customSound) {
      try {
        const result = await updateNotificationSound(customSound, tempName)
        if (result.error) {
          toast.error('Failed to update sound name')
        } else {
          toast.success('Sound name updated')
        }
      } catch (error) {
        console.error(error)
        toast.error('Failed to update sound name')
      }
    }
  }

  const handleSelectChange = async (value: string) => {
    setSelectedValue(value)
    
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }

    // Call optional prop
    if (onValueChange) {
      onValueChange(value)
    }

    // Update profile (just sound if not uploading)
    try {
      const result = await updateNotificationSound(value)
      if (result.error) {
        toast.error('Failed to save sound preference')
      } else {
        toast.success('Sound preference saved')
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to save sound preference')
    }
  }

  const togglePreview = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    // Stop any existing audio before starting new one
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    let src = ''
    if (selectedValue.startsWith('http')) {
      src = selectedValue
    } else {
      src = `/sounds/${selectedValue}.mp3`
    }
    
    const audio = new Audio(src)
    audioRef.current = audio
    
    audio.onended = () => {
      setIsPlaying(false)
    }

    audio.play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.error(err)
        toast.error('Could not play sound preview')
        setIsPlaying(false)
      })
  }

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1 space-y-2">
          <Label>Notification Sound</Label>
          <Select value={selectedValue} onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a sound" />
            </SelectTrigger>
            <SelectContent>
              {NOTIFICATION_SOUNDS.map((sound) => (
                <SelectItem key={sound.value} value={sound.value}>
                  {sound.label}
                </SelectItem>
              ))}
              {customSound && (
                <SelectItem value={customSound}>
                  {customName} (Custom)
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
            <Button 
              type="button" 
              variant={isPlaying ? "default" : "outline"}
              size="icon"
              onClick={togglePreview}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            {isPlaying && (
                <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={stopPreview}
                >
                <Square className="h-4 w-4" />
                </Button>
            )}
        </div>
      </div>

      {customSound && selectedValue === customSound && (
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <>
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="h-8 w-[200px]"
              />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleRename}>
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8" 
                onClick={() => {
                  setTempName(customName)
                  setIsEditingName(false)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Custom name: <span className="font-medium text-foreground">{customName}</span></span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setTempName(customName)
                  setIsEditingName(true)
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">Or upload custom sound:</div>
        <Input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Upload MP3/WAV
        </Button>
      </div>
    </div>
  )
}