import { useEffect, useRef, useState } from 'react'

const sampleIntervalMs = 250

export function FpsCounter() {
  const animationFrameRef = useRef<number | null>(null)
  const lastSampleTimeRef = useRef<number | null>(null)
  const frameCountRef = useRef(0)
  const [fps, setFps] = useState(0)

  useEffect(() => {
    const update = (timestamp: number) => {
      const lastSampleTime = lastSampleTimeRef.current

      if (lastSampleTime === null) {
        lastSampleTimeRef.current = timestamp
      } else {
        frameCountRef.current += 1

        const elapsed = timestamp - lastSampleTime

        if (elapsed >= sampleIntervalMs) {
          setFps(Math.round((frameCountRef.current * 1000) / elapsed))
          frameCountRef.current = 0
          lastSampleTimeRef.current = timestamp
        }
      }

      animationFrameRef.current = window.requestAnimationFrame(update)
    }

    animationFrameRef.current = window.requestAnimationFrame(update)

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div className="fps-counter" aria-label={`Current frame rate: ${fps} frames per second`}>
      <span className="fps-counter__value">{fps}</span>
      <span className="fps-counter__label">fps</span>
    </div>
  )
}
