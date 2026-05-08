import { useEffect, useRef, useState } from 'react'

const AMBIENT_AUDIO_SRC = '/assets/audio/edo-ambience.mp3'

export function AmbientAudioControl() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const audio = new Audio(AMBIENT_AUDIO_SRC)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0.36
    audioRef.current = audio

    const handleEnded = () => setIsPlaying(false)
    const handleError = () => {
      setIsPlaying(false)
      setHasError(true)
    }

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.pause()
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audioRef.current = null
    }
  }, [])

  const toggleAudio = async () => {
    const audio = audioRef.current

    if (!audio || hasError) {
      return
    }

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    try {
      await audio.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }

  return (
    <button
      className="ambient-audio"
      type="button"
      aria-pressed={isPlaying}
      aria-label={isPlaying ? 'Pause ambient audio' : 'Play ambient audio'}
      disabled={hasError}
      onClick={toggleAudio}
    >
      <span className="ambient-audio__mark" aria-hidden="true">
        {isPlaying ? '||' : '>'}
      </span>
      <span className="ambient-audio__label">
        {hasError ? 'Audio missing' : isPlaying ? 'Audio on' : 'Audio off'}
      </span>
    </button>
  )
}
