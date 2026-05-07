import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import type { Group, Texture } from 'three'
import {
  ClampToEdgeWrapping,
  DoubleSide,
  MeshBasicMaterial,
  NearestFilter,
  SRGBColorSpace,
  TextureLoader,
} from 'three'

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
    position: [-1.42, -0.8, 0.25],
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
    id: 'merchant-walker',
    src: '/assets/ukiyo-e/edo-sprites/walkers/merchant-walker.png',
    frameColumns: 8,
    frameCount: 16,
    frameRate: 7.5,
    frameRows: 2,
    position: [-5.8, -2.22, 0.52],
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
    position: [5.8, -2.02, 0.48],
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
    position: [-5.8, -2.36, 0.62],
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
    position: [5.8, -2.3, 0.66],
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
    position: [-5.8, -2.12, 0.5],
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
    position: [5.8, -2.28, 0.58],
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
    position: [-5.9, -2.68, 0.56],
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
    position: [5.9, -2.5, 0.49],
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
    position: [-5.9, -2.34, 0.44],
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
    position: [5.9, -2.78, 0.6],
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
    position: [-5.9, -2.92, 0.64],
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
    position: [5.9, -2.18, 0.4],
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
]

const spriteFrameInset = 0.00125
const backdropPlaneWidth = 13.8
const backdropPlaneHeight = 7.76
const backdropPlaneY = -1.02
const backdropPlaneZ = -5.4

function EdoBackdrop() {
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

  return (
    <mesh position={[0, backdropPlaneY, backdropPlaneZ]} renderOrder={0}>
      <planeGeometry args={[backdropPlaneWidth, backdropPlaneHeight]} />
      <meshBasicMaterial
        depthWrite={false}
        map={backdropTexture}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  )
}

function EdoSprite({ performer }: { performer: Performer }) {
  const groupRef = useRef<Group>(null)
  const spriteGroupRef = useRef<Group>(null)
  const materialRef = useRef<MeshBasicMaterial>(null)
  const textureRef = useRef<Texture | null>(null)
  const frameIndexRef = useRef(-1)
  const sourceTexture = useLoader(TextureLoader, performer.src)
  const frameInset = performer.frameInset ?? spriteFrameInset
  const spriteTexture = useMemo(() => {
    const texture = sourceTexture.clone()
    texture.colorSpace = SRGBColorSpace
    texture.generateMipmaps = false
    texture.magFilter = NearestFilter
    texture.minFilter = NearestFilter
    texture.wrapS = ClampToEdgeWrapping
    texture.wrapT = ClampToEdgeWrapping
    texture.repeat.set(
      1 / performer.frameColumns - frameInset * 2,
      1 / performer.frameRows - frameInset * 2,
    )
    texture.offset.set(frameInset, 1 - 1 / performer.frameRows + frameInset)
    texture.needsUpdate = true

    return texture
  }, [frameInset, performer.frameColumns, performer.frameRows, sourceTexture])

  useEffect(() => {
    textureRef.current = spriteTexture

    return () => {
      textureRef.current = null
      spriteTexture.dispose()
    }
  }, [spriteTexture])

  useFrame((_, delta) => {
    const now = performance.now() / 1000
    const frameIndex =
      Math.floor(now * performer.frameRate + performer.phase) % performer.frameCount

    if (frameIndexRef.current !== frameIndex) {
      const texture = textureRef.current

      if (texture) {
        const frameColumn = frameIndex % performer.frameColumns
        const frameRow = Math.floor(frameIndex / performer.frameColumns)

        texture.offset.x = frameColumn / performer.frameColumns + frameInset
        texture.offset.y = 1 - (frameRow + 1) / performer.frameRows + frameInset
        texture.needsUpdate = true
      }

      frameIndexRef.current = frameIndex
    }

    const group = groupRef.current

    if (group) {
      if (performer.travel) {
        const travelProgress =
          ((now + performer.travel.offset) % performer.travel.duration) /
          performer.travel.duration

        group.position.x =
          performer.travel.fromX +
          (performer.travel.toX - performer.travel.fromX) * travelProgress
      }

      group.rotation.y = performer.flip ? Math.PI : 0
    }

    const spriteGroup = spriteGroupRef.current

    if (spriteGroup) {
      spriteGroup.position.y =
        Math.sin(now * performer.frameRate * 0.82 + performer.phase) * performer.bobAmount
      spriteGroup.rotation.z =
        Math.sin(now * performer.frameRate * 0.48 + performer.phase) * performer.swayAmount
    }

    const material = materialRef.current

    if (material) {
      material.opacity = Math.min(1, material.opacity + delta * 3.5)
    }
  })

  return (
    <group ref={groupRef} position={performer.position}>
      {performer.contact && (
        <mesh
          position={performer.contact.position}
          renderOrder={29}
          scale={[performer.contact.scale[0], performer.contact.scale[1], 1]}
        >
          <circleGeometry args={[1, 32]} />
          <meshBasicMaterial
            color="#111111"
            depthWrite={false}
            opacity={performer.contact.opacity}
            side={DoubleSide}
            toneMapped={false}
            transparent
          />
        </mesh>
      )}
      <group ref={spriteGroupRef}>
        <mesh renderOrder={30}>
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

function EdoPerformers() {
  return (
    <group>
      {performers.map((performer) => (
        <EdoSprite key={performer.id} performer={performer} />
      ))}
    </group>
  )
}

export function EdoScene() {
  const { camera, size } = useThree(({ camera, size }) => ({ camera, size }))
  const cameraFov = 'fov' in camera ? camera.fov : 38
  const cameraDistance = Math.abs(camera.position.z - backdropPlaneZ)
  const visibleHeight =
    Math.tan((cameraFov * Math.PI) / 360) * cameraDistance * 2
  const visibleWidth = visibleHeight * (size.width / size.height)
  const sceneScale = Math.max(
    visibleWidth / backdropPlaneWidth,
    visibleHeight / backdropPlaneHeight,
  ) * 1.06
  const sceneY = camera.position.y - backdropPlaneY * sceneScale

  return (
    <>
      <color attach="background" args={['#f5f2ea']} />
      <group position={[0, sceneY, 0]} scale={[sceneScale, sceneScale, 1]}>
        <EdoBackdrop />
        <EdoPerformers />
      </group>
    </>
  )
}
