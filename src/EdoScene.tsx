import { PerspectiveCamera } from '@react-three/drei'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import type { Group, MeshBasicMaterial, PerspectiveCamera as ThreePerspectiveCamera, Texture } from 'three'
import {
  ClampToEdgeWrapping,
  DoubleSide,
  LinearFilter,
  MathUtils,
  NearestFilter,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
} from 'three'

type EdoSceneProps = {
  focusMode?: boolean
}

type Performer = {
  id: string
  src: string
  frameColumns: number
  frameCount: number
  frameRate: number
  frameRows: number
  position: [x: number, y: number, z: number]
  planeSize: [width: number, height: number]
  bobAmount: number
  frameInset?: number
  contact?: {
    opacity: number
    position: [x: number, y: number, z: number]
    scale: [x: number, y: number]
  }
  swayAmount: number
  phase: number
  flip?: boolean
  travel?: {
    duration: number
    fromX: number
    offset: number
    toX: number
  }
}

const performers: Performer[] = [
  {
    id: 'koto-girl',
    src: '/assets/ukiyo-e/edo-sprites/koto-girl.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 3,
    frameRows: 2,
    position: [-1.3, -0.8, 0.25],
    planeSize: [0.525, 1.4],
    bobAmount: 0,
    contact: {
      opacity: 0.22,
      position: [-0.01, -0.485, -0.01],
      scale: [0.29, 0.05],
    },
    swayAmount: 0,
    phase: 0,
  },
  {
    id: 'shamoji-girl',
    src: '/assets/ukiyo-e/edo-sprites/shamoji-girl.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 3.25,
    frameRows: 2,
    position: [0, -0.76, 0.18],
    planeSize: [0.47, 1.25],
    bobAmount: 0,
    contact: {
      opacity: 0.18,
      position: [0, -0.55, -0.01],
      scale: [0.13, 0.0275],
    },
    swayAmount: 0,
    phase: 0,
  },
  {
    id: 'dance-girl',
    src: '/assets/ukiyo-e/edo-sprites/dance-girl.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 3.1,
    frameRows: 2,
    position: [1.6, -0.82, 0.2],
    planeSize: [0.43, 1.36],
    bobAmount: 0,
    contact: {
      opacity: 0.18,
      position: [0, -0.57, -0.01],
      scale: [0.125, 0.0275],
    },
    frameInset: 0.0015,
    swayAmount: 0,
    phase: 0,
    flip: true,
  },
  {
    id: 'spectator-kimono-woman',
    src: '/assets/ukiyo-e/edo-sprites/spectators/spectator-kimono-woman.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 2.1,
    frameRows: 2,
    position: [-1.88, -1.54, 0.74],
    planeSize: [0.46, 0.92],
    bobAmount: 0.003,
    contact: {
      opacity: 0.1,
      position: [0, -0.39, -0.01],
      scale: [0.14, 0.026],
    },
    frameInset: 0.0015,
    swayAmount: 0.004,
    phase: 0.3,
  },
  {
    id: 'spectator-merchant',
    src: '/assets/ukiyo-e/edo-sprites/spectators/spectator-merchant.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 1.95,
    frameRows: 2,
    position: [-1.28, -1.5, 0.79],
    planeSize: [0.5, 0.98],
    bobAmount: 0.002,
    contact: {
      opacity: 0.11,
      position: [0, -0.41, -0.01],
      scale: [0.15, 0.028],
    },
    frameInset: 0.0015,
    swayAmount: 0.003,
    phase: 2.4,
  },
  {
    id: 'spectator-child',
    src: '/assets/ukiyo-e/edo-sprites/spectators/spectator-child.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 2.35,
    frameRows: 2,
    position: [-0.46, -1.66, 0.84],
    planeSize: [0.38, 0.76],
    bobAmount: 0.004,
    contact: {
      opacity: 0.09,
      position: [0, -0.32, -0.01],
      scale: [0.11, 0.022],
    },
    frameInset: 0.0015,
    swayAmount: 0.005,
    phase: 4.1,
  },
  {
    id: 'spectator-retainer',
    src: '/assets/ukiyo-e/edo-sprites/spectators/spectator-retainer.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 1.8,
    frameRows: 2,
    position: [0.28, -1.49, 0.76],
    planeSize: [0.54, 1.02],
    bobAmount: 0.002,
    contact: {
      opacity: 0.11,
      position: [0, -0.43, -0.01],
      scale: [0.17, 0.029],
    },
    frameInset: 0.0015,
    swayAmount: 0.003,
    phase: 6.2,
  },
  {
    id: 'spectator-artisan',
    src: '/assets/ukiyo-e/edo-sprites/spectators/spectator-artisan.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 2.05,
    frameRows: 2,
    position: [1.18, -1.61, 0.81],
    planeSize: [0.46, 0.9],
    bobAmount: 0.003,
    contact: {
      opacity: 0.1,
      position: [0, -0.38, -0.01],
      scale: [0.14, 0.026],
    },
    frameInset: 0.0015,
    swayAmount: 0.004,
    phase: 8.8,
  },
  {
    id: 'spectator-elder',
    src: '/assets/ukiyo-e/edo-sprites/spectators/spectator-elder.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 1.7,
    frameRows: 2,
    position: [1.64, -1.55, 0.73],
    planeSize: [0.44, 0.88],
    bobAmount: 0.002,
    contact: {
      opacity: 0.09,
      position: [0, -0.37, -0.01],
      scale: [0.13, 0.024],
    },
    frameInset: 0.0015,
    swayAmount: 0.003,
    phase: 11.5,
  },
  {
    id: 'merchant-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/merchant-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 7.5,
    frameRows: 2,
    position: [-5.8, -2.06, 0.52],
    planeSize: [0.72, 1.22],
    bobAmount: 0.015,
    contact: {
      opacity: 0.16,
      position: [0, -0.5, -0.01],
      scale: [0.2, 0.045],
    },
    frameInset: 0.0015,
    swayAmount: 0.012,
    phase: 1.2,
    travel: { duration: 34, fromX: -5.8, offset: 0, toX: 5.8 },
  },
  {
    id: 'shopper-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/shopper-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 6.8,
    frameRows: 2,
    position: [5.8, -1.86, 0.48],
    planeSize: [0.66, 1.12],
    bobAmount: 0.012,
    contact: {
      opacity: 0.14,
      position: [0, -0.46, -0.01],
      scale: [0.18, 0.04],
    },
    frameInset: 0.0015,
    swayAmount: 0.01,
    phase: 4.7,
    flip: true,
    travel: { duration: 39, fromX: 5.8, offset: 10, toX: -5.8 },
  },
  {
    id: 'elder-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/elder-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 5.6,
    frameRows: 2,
    position: [-5.8, -2.2, 0.62],
    planeSize: [0.7, 1.18],
    bobAmount: 0.008,
    contact: {
      opacity: 0.18,
      position: [0, -0.48, -0.01],
      scale: [0.22, 0.045],
    },
    frameInset: 0.0015,
    swayAmount: 0.008,
    phase: 7.9,
    travel: { duration: 48, fromX: -5.8, offset: 22, toX: 5.8 },
  },
  {
    id: 'messenger-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/messenger-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 8.8,
    frameRows: 2,
    position: [5.8, -2.14, 0.66],
    planeSize: [0.74, 1.25],
    bobAmount: 0.018,
    contact: {
      opacity: 0.13,
      position: [0, -0.52, -0.01],
      scale: [0.16, 0.035],
    },
    frameInset: 0.0015,
    swayAmount: 0.014,
    phase: 2.4,
    flip: true,
    travel: { duration: 26, fromX: 5.8, offset: 5, toX: -5.8 },
  },
  {
    id: 'vendor-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/vendor-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 6.2,
    frameRows: 2,
    position: [-5.8, -1.96, 0.5],
    planeSize: [0.68, 1.15],
    bobAmount: 0.01,
    contact: {
      opacity: 0.15,
      position: [0, -0.47, -0.01],
      scale: [0.19, 0.04],
    },
    frameInset: 0.0015,
    swayAmount: 0.008,
    phase: 6.1,
    travel: { duration: 41, fromX: -5.8, offset: 17, toX: 5.8 },
  },
  {
    id: 'artisan-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/artisan-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 7.1,
    frameRows: 2,
    position: [5.8, -2.12, 0.58],
    planeSize: [0.68, 1.15],
    bobAmount: 0.012,
    contact: {
      opacity: 0.16,
      position: [0, -0.47, -0.01],
      scale: [0.2, 0.04],
    },
    frameInset: 0.0015,
    swayAmount: 0.01,
    phase: 9.4,
    flip: true,
    travel: { duration: 36, fromX: 5.8, offset: 27, toX: -5.8 },
  },
  {
    id: 'fishmonger-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/fishmonger-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 7.9,
    frameRows: 2,
    position: [-5.9, -2.52, 0.56],
    planeSize: [0.76, 1.28],
    bobAmount: 0.014,
    contact: {
      opacity: 0.16,
      position: [0, -0.72, -0.01],
      scale: [0.2, 0.04],
    },
    frameInset: 0.0015,
    swayAmount: 0.01,
    phase: 11.3,
    travel: { duration: 31, fromX: -5.9, offset: 13, toX: 5.9 },
  },
  {
    id: 'umbrella-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/umbrella-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 6.4,
    frameRows: 2,
    position: [5.9, -2.34, 0.49],
    planeSize: [0.72, 1.32],
    bobAmount: 0.01,
    contact: {
      opacity: 0.14,
      position: [0, -0.74, -0.01],
      scale: [0.18, 0.04],
    },
    frameInset: 0.0015,
    swayAmount: 0.008,
    phase: 14.1,
    flip: true,
    travel: { duration: 43, fromX: 5.9, offset: 31, toX: -5.9 },
  },
  {
    id: 'monk-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/monk-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 5.9,
    frameRows: 2,
    position: [-5.9, -2.18, 0.44],
    planeSize: [0.66, 1.12],
    bobAmount: 0.007,
    contact: {
      opacity: 0.13,
      position: [0, -0.66, -0.01],
      scale: [0.17, 0.035],
    },
    frameInset: 0.0015,
    swayAmount: 0.006,
    phase: 16.8,
    travel: { duration: 52, fromX: -5.9, offset: 36, toX: 5.9 },
  },
  {
    id: 'farmer-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/farmer-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 6.6,
    frameRows: 2,
    position: [5.9, -2.62, 0.6],
    planeSize: [0.72, 1.22],
    bobAmount: 0.011,
    contact: {
      opacity: 0.15,
      position: [0, -0.7, -0.01],
      scale: [0.19, 0.04],
    },
    frameInset: 0.0015,
    swayAmount: 0.009,
    phase: 19.6,
    flip: true,
    travel: { duration: 38, fromX: 5.9, offset: 18, toX: -5.9 },
  },
  {
    id: 'carpenter-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/carpenter-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 7.3,
    frameRows: 2,
    position: [-5.9, -2.76, 0.64],
    planeSize: [0.9, 1.24],
    bobAmount: 0.013,
    contact: {
      opacity: 0.16,
      position: [0, -0.7, -0.01],
      scale: [0.24, 0.045],
    },
    frameInset: 0.0015,
    swayAmount: 0.01,
    phase: 22.2,
    travel: { duration: 33, fromX: -5.9, offset: 24, toX: 5.9 },
  },
  {
    id: 'apprentice-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/apprentice-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 8.4,
    frameRows: 2,
    position: [5.9, -2.02, 0.4],
    planeSize: [0.56, 1.02],
    bobAmount: 0.016,
    contact: {
      opacity: 0.12,
      position: [0, -0.59, -0.01],
      scale: [0.14, 0.032],
    },
    frameInset: 0.0015,
    swayAmount: 0.012,
    phase: 25.7,
    flip: true,
    travel: { duration: 29, fromX: 5.9, offset: 3, toX: -5.9 },
  },
  {
    id: 'lantern-lighter-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/lantern-lighter-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 6.9,
    frameRows: 2,
    position: [-6.1, -2.24, 0.46],
    planeSize: [0.82, 1.18],
    bobAmount: 0.011,
    contact: {
      opacity: 0.13,
      position: [0, -0.55, -0.01],
      scale: [0.18, 0.036],
    },
    frameInset: 0.0015,
    swayAmount: 0.009,
    phase: 28.4,
    travel: { duration: 45, fromX: -6.1, offset: 8, toX: 6.1 },
  },
  {
    id: 'book-peddler-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/book-peddler-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 6.7,
    frameRows: 2,
    position: [6.1, -2.56, 0.57],
    planeSize: [0.66, 1.12],
    bobAmount: 0.012,
    contact: {
      opacity: 0.15,
      position: [0, -0.5, -0.01],
      scale: [0.18, 0.038],
    },
    frameInset: 0.0015,
    swayAmount: 0.01,
    phase: 31.2,
    flip: true,
    travel: { duration: 37, fromX: 6.1, offset: 15, toX: -6.1 },
  },
  {
    id: 'pilgrim-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/pilgrim-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 5.7,
    frameRows: 2,
    position: [-6.1, -2.06, 0.42],
    planeSize: [0.72, 1.2],
    bobAmount: 0.008,
    contact: {
      opacity: 0.13,
      position: [0, -0.56, -0.01],
      scale: [0.17, 0.035],
    },
    frameInset: 0.0015,
    swayAmount: 0.006,
    phase: 34,
    travel: { duration: 56, fromX: -6.1, offset: 42, toX: 6.1 },
  },
  {
    id: 'tea-server-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/tea-server-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 6.1,
    frameRows: 2,
    position: [6.1, -1.9, 0.38],
    planeSize: [0.6, 1.06],
    bobAmount: 0.008,
    contact: {
      opacity: 0.12,
      position: [0, -0.47, -0.01],
      scale: [0.15, 0.032],
    },
    frameInset: 0.0015,
    swayAmount: 0.006,
    phase: 37.5,
    flip: true,
    travel: { duration: 49, fromX: 6.1, offset: 29, toX: -6.1 },
  },
  {
    id: 'basket-porter-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/basket-porter-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 7.2,
    frameRows: 2,
    position: [-6.1, -2.7, 0.66],
    planeSize: [1, 1.24],
    bobAmount: 0.014,
    contact: {
      opacity: 0.16,
      position: [0, -0.56, -0.01],
      scale: [0.28, 0.045],
    },
    frameInset: 0.0015,
    swayAmount: 0.011,
    phase: 40.3,
    travel: { duration: 35, fromX: -6.1, offset: 22, toX: 6.1 },
  },
  {
    id: 'tofu-seller-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/tofu-seller-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 6.5,
    frameRows: 2,
    position: [6.1, -2.36, 0.51],
    planeSize: [0.66, 1.1],
    bobAmount: 0.01,
    contact: {
      opacity: 0.14,
      position: [0, -0.49, -0.01],
      scale: [0.17, 0.036],
    },
    frameInset: 0.0015,
    swayAmount: 0.008,
    phase: 43.1,
    flip: true,
    travel: { duration: 40, fromX: 6.1, offset: 34, toX: -6.1 },
  },
]

const spriteFrameInset = 0.00125
const walkerFrameRateMultiplier = 1.2
const backdropPlaneWidth = 13.8
const backdropPlaneHeight = 7.76
const backdropPlaneY = -1.02
const backdropPlaneZ = -5.4
const spriteRenderOrderBase = 30
const spriteRenderOrderDepthScale = 10
const kotoFocusTarget = performers[0]
const cinematicFocusDamping = 0.62
const cinematicFadeDamping = 1.1
const baseCameraX = 0
const baseCameraY = 0.25
const baseCameraZ = 9.5
const baseCameraFov = 38

function getPerformerRenderOrder(performer: Performer) {
  return spriteRenderOrderBase - performer.position[1] * spriteRenderOrderDepthScale
}

function EdoBackdrop({ focusMode }: { focusMode: boolean }) {
  const materialRef = useRef<MeshBasicMaterial | null>(null)
  const sourceTexture = useLoader(TextureLoader, '/assets/ukiyo-e/edo-street-stage.png')
  const backdropTexture = useMemo(() => {
    const texture = sourceTexture.clone()

    texture.colorSpace = SRGBColorSpace
    texture.generateMipmaps = false
    texture.magFilter = NearestFilter
    texture.minFilter = NearestFilter
    texture.wrapS = ClampToEdgeWrapping
    texture.wrapT = ClampToEdgeWrapping
    texture.needsUpdate = true

    return texture
  }, [sourceTexture])

  useEffect(() => () => backdropTexture.dispose(), [backdropTexture])

  useFrame((_, delta) => {
    const material = materialRef.current

    if (!material) {
      return
    }

    const targetOpacity = focusMode ? 0.1 : 1
    material.opacity = MathUtils.damp(material.opacity, targetOpacity, cinematicFadeDamping, delta)
  })

  return (
    <mesh position={[0, backdropPlaneY, backdropPlaneZ]} renderOrder={0}>
      <planeGeometry args={[backdropPlaneWidth, backdropPlaneHeight]} />
      <meshBasicMaterial
        ref={materialRef}
        depthWrite={false}
        map={backdropTexture}
        opacity={1}
        side={DoubleSide}
        toneMapped={false}
        transparent
      />
    </mesh>
  )
}

function PastelWash({ focusMode }: { focusMode: boolean }) {
  const materialRef = useRef<MeshBasicMaterial | null>(null)

  useFrame((_, delta) => {
    const material = materialRef.current

    if (!material) {
      return
    }

    const targetOpacity = focusMode ? 1 : 0
    material.opacity = MathUtils.damp(material.opacity, targetOpacity, cinematicFadeDamping, delta)
  })

  return (
    <mesh position={[0, backdropPlaneY, backdropPlaneZ + 0.08]} renderOrder={20}>
      <planeGeometry args={[backdropPlaneWidth, backdropPlaneHeight]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#f1d9cd"
        depthWrite={false}
        opacity={0}
        side={DoubleSide}
        toneMapped={false}
        transparent
      />
    </mesh>
  )
}

function EdoSprite({
  performer,
  focusMode,
  isFocusTarget,
}: {
  performer: Performer
  focusMode: boolean
  isFocusTarget: boolean
}) {
  const rootRef = useRef<Group | null>(null)
  const bodyRef = useRef<Group | null>(null)
  const materialRef = useRef<MeshBasicMaterial | null>(null)
  const contactMaterialRef = useRef<MeshBasicMaterial | null>(null)
  const spriteTextureRef = useRef<Texture | null>(null)
  const lastFrameRef = useRef(-1)
  const focusProgressRef = useRef(0)
  const sourceTexture = useLoader(TextureLoader, performer.src)
  const frameInset = performer.frameInset ?? spriteFrameInset
  const animationFrameRate = performer.travel
    ? performer.frameRate * walkerFrameRateMultiplier
    : performer.frameRate
  const renderOrder = getPerformerRenderOrder(performer)
  const spriteTexture = useMemo(() => {
    const texture = sourceTexture.clone()
    const spriteFilter = performer.travel ? LinearFilter : NearestFilter

    texture.colorSpace = SRGBColorSpace
    texture.generateMipmaps = false
    texture.magFilter = spriteFilter
    texture.minFilter = spriteFilter
    texture.wrapS = ClampToEdgeWrapping
    texture.wrapT = ClampToEdgeWrapping
    texture.repeat.set(
      1 / performer.frameColumns - frameInset * 2,
      1 / performer.frameRows - frameInset * 2,
    )
    texture.offset.set(frameInset, 1 - 1 / performer.frameRows + frameInset)
    texture.needsUpdate = true

    return texture
  }, [frameInset, performer.frameColumns, performer.frameRows, performer.travel, sourceTexture])

  useEffect(() => {
    spriteTextureRef.current = spriteTexture

    return () => {
      spriteTextureRef.current = null
      spriteTexture.dispose()
    }
  }, [spriteTexture])

  useFrame(({ clock }, delta) => {
    const sceneTime = clock.getElapsedTime()
    const root = rootRef.current
    const body = bodyRef.current
    const material = materialRef.current
    const texture = spriteTextureRef.current

    if (!root || !body || !material || !texture) {
      return
    }

    const frameIndex =
      Math.floor(sceneTime * animationFrameRate + performer.phase) % performer.frameCount

    if (frameIndex !== lastFrameRef.current) {
      const frameColumn = frameIndex % performer.frameColumns
      const frameRow = Math.floor(frameIndex / performer.frameColumns)

      texture.offset.x = frameColumn / performer.frameColumns + frameInset
      texture.offset.y = 1 - (frameRow + 1) / performer.frameRows + frameInset
      lastFrameRef.current = frameIndex
    }

    if (performer.travel) {
      const travelProgress =
        ((sceneTime + performer.travel.offset) % performer.travel.duration) /
        performer.travel.duration

      root.position.x =
        performer.travel.fromX +
        (performer.travel.toX - performer.travel.fromX) * travelProgress
    }

    body.position.y =
      Math.sin(sceneTime * animationFrameRate * 0.82 + performer.phase) * performer.bobAmount
    body.rotation.z =
      Math.sin(sceneTime * animationFrameRate * 0.48 + performer.phase) * performer.swayAmount

    focusProgressRef.current = MathUtils.damp(
      focusProgressRef.current,
      focusMode ? 1 : 0,
      1.05,
      delta,
    )
    const nonTargetVisibility = 1 - focusProgressRef.current
    const visibility = isFocusTarget ? 1 : nonTargetVisibility
    material.opacity = Math.min(1, sceneTime * 3.5) * visibility

    const contactMaterial = contactMaterialRef.current

    if (contactMaterial && performer.contact) {
      contactMaterial.opacity = performer.contact.opacity * visibility
    }
  })

  return (
    <group
      ref={rootRef}
      position={performer.position}
      rotation-y={performer.flip ? Math.PI : 0}
    >
      {performer.contact && !performer.travel && (
        <mesh
          position={performer.contact.position}
          renderOrder={renderOrder - 0.1}
          scale={[performer.contact.scale[0], performer.contact.scale[1], 1]}
        >
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial
            ref={contactMaterialRef}
            color="#111111"
            depthWrite={false}
            opacity={performer.contact.opacity}
            side={DoubleSide}
            toneMapped={false}
            transparent
          />
        </mesh>
      )}
      <group ref={bodyRef}>
        <mesh renderOrder={renderOrder}>
          <planeGeometry args={performer.planeSize} />
          <meshBasicMaterial
            ref={materialRef}
            alphaTest={0.02}
            depthWrite={false}
            map={spriteTexture}
            opacity={0}
            side={DoubleSide}
            toneMapped={false}
            transparent
          />
        </mesh>
      </group>
    </group>
  )
}

function EdoPerformers({ focusMode }: { focusMode: boolean }) {
  return (
    <group>
      {performers.map((performer) => (
        <EdoSprite
          key={performer.id}
          performer={performer}
          focusMode={focusMode}
          isFocusTarget={performer.id === kotoFocusTarget.id}
        />
      ))}
    </group>
  )
}

export function EdoScene({ focusMode = false }: EdoSceneProps) {
  const { size } = useThree(({ size }) => ({ size }))
  const cameraRef = useRef<ThreePerspectiveCamera | null>(null)
  const sceneGroupRef = useRef<Group | null>(null)
  const focusProgressRef = useRef(0)
  const cameraTargetRef = useRef(new Vector3(0, baseCameraY - 0.12, -1.2))
  const cameraFov = baseCameraFov
  const cameraDistance = Math.abs(baseCameraZ - backdropPlaneZ)
  const visibleHeight =
    Math.tan((cameraFov * Math.PI) / 360) * cameraDistance * 2
  const visibleWidth = visibleHeight * (size.width / size.height)
  const sceneScale = Math.max(
    visibleWidth / backdropPlaneWidth,
    visibleHeight / backdropPlaneHeight,
  ) * 1.06
  const sceneY = baseCameraY - backdropPlaneY * sceneScale
  const focusScale = sceneScale * 2.36
  const focusX = -kotoFocusTarget.position[0] * focusScale
  const focusY = baseCameraY - kotoFocusTarget.position[1] * focusScale

  useFrame((_, delta) => {
    const sceneGroup = sceneGroupRef.current
    const sceneCamera = cameraRef.current

    if (!sceneGroup || !sceneCamera) {
      return
    }

    focusProgressRef.current = MathUtils.damp(
      focusProgressRef.current,
      focusMode ? 1 : 0,
      cinematicFocusDamping,
      delta,
    )

    const focusProgress = MathUtils.smoothstep(focusProgressRef.current, 0, 1)
    const currentScale = MathUtils.lerp(sceneScale, focusScale, focusProgress)
    const orbitProgress = Math.sin(focusProgress * Math.PI) * 0.42

    sceneGroup.position.x = MathUtils.lerp(0, focusX, focusProgress)
    sceneGroup.position.y = MathUtils.lerp(sceneY, focusY, focusProgress)
    sceneGroup.scale.set(currentScale, currentScale, 1)

    sceneCamera.position.x = MathUtils.lerp(baseCameraX, 0.58, focusProgress) + orbitProgress
    sceneCamera.position.y = MathUtils.lerp(baseCameraY, 0.55, focusProgress)
    sceneCamera.position.z = MathUtils.lerp(baseCameraZ, 7.45, focusProgress)

    cameraTargetRef.current.set(
      MathUtils.lerp(0, 0.18, focusProgress),
      MathUtils.lerp(baseCameraY - 0.12, 0.42, focusProgress),
      MathUtils.lerp(-1.2, -2.55, focusProgress),
    )
    sceneCamera.lookAt(cameraTargetRef.current)
  })

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[baseCameraX, baseCameraY, baseCameraZ]}
        fov={baseCameraFov}
        near={0.1}
        far={80}
      />
      <color attach="background" args={['#f5f2ea']} />
      <group ref={sceneGroupRef} position={[0, sceneY, 0]} scale={[sceneScale, sceneScale, 1]}>
        <EdoBackdrop focusMode={focusMode} />
        <PastelWash focusMode={focusMode} />
        <EdoPerformers focusMode={focusMode} />
      </group>
    </>
  )
}
