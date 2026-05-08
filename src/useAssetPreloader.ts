import { useEffect, useMemo, useState } from 'react'

type PreloadStatus = 'loading' | 'ready'

export type AssetPreloadState = {
  completed: number
  failed: number
  progress: number
  status: PreloadStatus
  total: number
}

const imagePattern = /\.(avif|gif|jpe?g|png|svg|webp)(\?|#|$)/i
const fontPattern = /\.(otf|ttf|woff2?)(\?|#|$)/i

function preloadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image()

    image.decoding = 'async'
    image.onload = () => {
      if (!image.decode) {
        resolve()
        return
      }

      image.decode().then(resolve).catch(resolve)
    }
    image.onerror = () => reject(new Error(`Unable to preload image: ${src}`))
    image.src = src
  })
}

async function preloadByFetch(src: string) {
  const response = await fetch(src, { cache: 'force-cache' })

  if (!response.ok) {
    throw new Error(`Unable to preload resource: ${src}`)
  }

  await response.blob()
}

function preloadAsset(src: string) {
  if (imagePattern.test(src)) {
    return preloadImage(src)
  }

  if (fontPattern.test(src) && document.fonts) {
    return Promise.all([
      document.fonts.load('700 1rem "Cormorant Garamond"'),
      preloadByFetch(src),
    ]).then(() => undefined)
  }

  return preloadByFetch(src)
}

export function useAssetPreloader(assetSrcs: string[]): AssetPreloadState {
  const sources = useMemo(() => Array.from(new Set(assetSrcs)), [assetSrcs])
  const [state, setState] = useState<AssetPreloadState>({
    completed: 0,
    failed: 0,
    progress: 0,
    status: sources.length === 0 ? 'ready' : 'loading',
    total: sources.length,
  })

  useEffect(() => {
    let cancelled = false
    let completed = 0
    let failed = 0
    const total = sources.length

    if (total === 0) {
      return () => {
        cancelled = true
      }
    }

    const markComplete = (didFail: boolean) => {
      completed += 1

      if (didFail) {
        failed += 1
      }

      if (!cancelled) {
        setState({
          completed,
          failed,
          progress: completed / total,
          status: completed === total ? 'ready' : 'loading',
          total,
        })
      }
    }

    sources.forEach((src) => {
      preloadAsset(src)
        .then(() => markComplete(false))
        .catch((error: unknown) => {
          console.warn(error)
          markComplete(true)
        })
    })

    return () => {
      cancelled = true
    }
  }, [sources])

  return state
}
