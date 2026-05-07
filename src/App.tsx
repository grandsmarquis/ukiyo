import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import { EdoScene } from './EdoScene'
import { UkiyoELandscape } from './UkiyoELandscape'
import './App.css'

type SceneRoute = 'landscape' | 'edo'

function App() {
  const [sceneRoute, setSceneRoute] = useState<SceneRoute>(() =>
    window.location.pathname === '/edo' ? 'edo' : 'landscape',
  )
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const handlePopState = () => {
      setSceneRoute(window.location.pathname === '/edo' ? 'edo' : 'landscape')
      setIsTransitioning(false)
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
  }

  return (
    <main
      className={`experience${isTransitioning ? ' is-transitioning' : ''}`}
      aria-label="Minimal black and white ukiyo-e landscape"
    >
      <div className="viewport-stage">
        {sceneRoute === 'edo' ? (
          <Canvas
            camera={{ position: [0, 0.25, 9.5], fov: 38, near: 0.1, far: 80 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: false }}
          >
            <Suspense fallback={null}>
              <EdoScene />
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
      </div>
      {sceneRoute === 'landscape' && (
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
    </main>
  )
}

export default App
