'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, X, Music } from 'lucide-react'
import { toast } from 'sonner'

interface AudioUploadProps {
  onUploadComplete: (url: string) => void
  initialUrl?: string | null
}

export function AudioUpload({ onUploadComplete, initialUrl }: AudioUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast.error('Please upload an audio file')
      return
    }

    // Validate size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    try {
      setUploading(true)
      setProgress(0)

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('User not found')

      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('audio-attachments')
        .upload(filePath, file, {
          upsert: true,
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('audio-attachments')
        .getPublicUrl(filePath)

      setPreviewUrl(publicUrl)
      onUploadComplete(publicUrl)
      toast.success('Audio uploaded successfully')
    } catch (error) {
      console.error(error)
      toast.error('Error uploading file')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onUploadComplete('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="audio/*"
        className="hidden"
      />

      {!previewUrl ? (
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Audio'}
        </Button>
      ) : (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-secondary/20">
          <Music className="h-4 w-4 text-primary" />
          <span className="text-sm truncate flex-1">Audio Attached</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {uploading && <Progress value={progress} className="h-2" />}
      
      {previewUrl && (
        <audio controls className="w-full mt-2 h-8">
          <source src={previewUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  )
}
