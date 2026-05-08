import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import { AmbientAudioControl } from './AmbientAudioControl'
import { startupAssetSrcs } from './assetManifest'
import { EdoScene } from './EdoScene'
import { FpsCounter } from './FpsCounter'
import { UkiyoELandscape } from './UkiyoELandscape'
import { useAssetPreloader } from './useAssetPreloader'
import './App.css'

type SceneRoute = 'landscape' | 'edo'

function StartupLoader({
  completed,
  failed,
  progress,
  total,
}: {
  completed: number
  failed: number
  progress: number
  total: number
}) {
  const progressPercent = Math.round(progress * 100)
  const loadedLabel = `${completed}/${total}`

  return (
    <div className="startup-loader" aria-live="polite">
      <div className="startup-loader__panel">
        <p className="startup-loader__eyebrow">浮世絵</p>
        <h1 className="startup-loader__title">Loading resources</h1>
        <div
          className="startup-loader__bar"
          role="progressbar"
          aria-label="Resource loading progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
        >
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
        <div className="startup-loader__meta">
          <span>{progressPercent}%</span>
          <span>{loadedLabel}</span>
        </div>
        {failed > 0 && (
          <p className="startup-loader__warning">
            {failed} resource{failed === 1 ? '' : 's'} could not be preloaded.
          </p>
        )}
      </div>
    </div>
  )
}

function App() {
  const [sceneRoute, setSceneRoute] = useState<SceneRoute>(() =>
    window.location.pathname === '/edo' ? 'edo' : 'landscape',
  )
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isKotoFocus, setIsKotoFocus] = useState(false)
  const preload = useAssetPreloader(startupAssetSrcs)
  const isReady = preload.status === 'ready'

  useEffect(() => {
    const handlePopState = () => {
      setSceneRoute(window.location.pathname === '/edo' ? 'edo' : 'landscape')
      setIsTransitioning(false)
      setIsKotoFocus(false)
    }

    window.addEventListener('popstate', handlePopState)

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleTravelToEdo = () => {
    if (isTransitioning || sceneRoute === 'edo') {
      return
    }

    setIsTransitioning(true)
  }

  const completeTransition = () => {
    window.history.pushState({}, '', '/edo')
    setSceneRoute('edo')
    setIsTransitioning(false)
    setIsKotoFocus(false)
  }

  return (
    <main
      className={`experience${isReady ? ' is-ready' : ' is-loading'}${isTransitioning ? ' is-transitioning' : ''}${isKotoFocus ? ' is-koto-focus' : ''}`}
      aria-label="Minimal black and white ukiyo-e landscape"
    >
      <div className="viewport-stage">
        {!isReady ? (
          <StartupLoader {...preload} />
        ) : sceneRoute === 'edo' ? (
          <Canvas
            camera={{ position: [0, 0.25, 9.5], fov: 38, near: 0.1, far: 80 }}
            dpr={[1, 1.25]}
            frameloop="always"
            gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
          >
            <Suspense fallback={null}>
              <EdoScene focusMode={isKotoFocus} />
            </Suspense>
          </Canvas>
        ) : (
          <Canvas
            camera={{ position: [0, 0.35, 9.5], fov: 38, near: 0.1, far: 80 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={['#f5f2ea']} />
            <Suspense fallback={null}>
              <UkiyoELandscape
                isTransitioning={isTransitioning}
                onTransitionComplete={completeTransition}
              />
            </Suspense>
          </Canvas>
        )}
        {isReady && (
          <>
            <FpsCounter />
            <AmbientAudioControl />
          </>
        )}
      </div>
      {isReady && sceneRoute === 'landscape' && (
        <div className="edo-button-wrap" aria-hidden={isTransitioning}>
          <button
            className="edo-button"
            disabled={isTransitioning}
            type="button"
            onClick={handleTravelToEdo}
          >
            Get me to Edo
          </button>
        </div>
      )}
      {isReady && sceneRoute === 'edo' && !isKotoFocus && (
        <div className="edo-button-wrap edo-button-wrap--mountains">
          <button
            className="edo-button edo-button--mountains"
            disabled={isKotoFocus}
            type="button"
            onClick={() => setIsKotoFocus(true)}
          >
            Take me to the montains
          </button>
        </div>
      )}
    </main>
  )
}

export default App
