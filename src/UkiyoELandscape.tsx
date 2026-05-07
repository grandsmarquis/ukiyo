import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import type { Group, InstancedMesh, Mesh, PerspectiveCamera } from 'three'
import {
  DoubleSide,
  MeshBasicMaterial,
  Object3D,
  Plane,
  Quaternion,
  Raycaster,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  Vector3,
} from 'three'

export type LandscapeLayer = {
  id: string
  src: string
  srcs?: string[]
  z: number
  y?: number
  scale: [width: number, height: number]
  speed: number
  opacity: number
  repeat: number
}

const layers: LandscapeLayer[] = [
  {
    id: 'upper-clouds',
    src: '/assets/ukiyo-e/upper-clouds.png?v=2',
    z: -23,
    scale: [24, 13.5],
    speed: -0.045,
    opacity: 0.48,
    repeat: 5,
  },
  {
    id: 'distant-mountains',
    src: '/assets/ukiyo-e/distant-mountains.png?v=2',
    z: -19,
    scale: [25, 14.1],
    speed: -0.065,
    opacity: 1,
    repeat: 4,
  },
  {
    id: 'lower-mist',
    src: '/assets/ukiyo-e/lower-mist.png?v=2',
    z: -15,
    scale: [23, 12.9],
    speed: 0.085,
    opacity: 0.56,
    repeat: 5,
  },
  {
    id: 'midground-ridge',
    src: '/assets/ukiyo-e/midground-ridge.png?v=2',
    z: -10,
    scale: [22, 12.4],
    speed: -0.13,
    opacity: 1,
    repeat: 4,
  },
  {
    id: 'foreground-trees',
    src: '/assets/ukiyo-e/foreground-trees.png',
    z: -4.2,
    scale: [18.5, 10.4],
    speed: -0.24,
    opacity: 0.98,
    repeat: 5,
  },
]

const sceneTitle = {
  fadeDuration: 2.2,
  fadeStart: 5,
  font: '/assets/fonts/CormorantGaramond-wght.ttf',
  speed: -0.18,
  position: [0, 0.66, -9.2] as [x: number, y: number, z: number],
}

const foregroundLayerId = 'foreground-trees'

const skyTransition = {
  duration: 3.1,
  targetPosition: new Vector3(0, 5.25, -8.6),
  lookAt: new Vector3(0, 8.9, -24),
  targetFov: 22,
}

type FadingText = Object3D & {
  fillOpacity: number
  outlineOpacity: number
  sync: () => void
}

type BirdFlight = {
  id: string
  type: BirdType
  start: [x: number, y: number, z: number]
  scale: [width: number, height: number]
  speed: number
  bob: number
  bobAmount: number
  phase: number
  frameOffset: number
  opacity: number
  flip?: boolean
}

const birdTypes = ['sparrow', 'crane', 'crow'] as const
type BirdType = (typeof birdTypes)[number]
const framesPerBirdCycle = 8

const birdFlightFrameSrcs: Record<BirdType, string[]> = {
  sparrow: Array.from(
    { length: framesPerBirdCycle },
    (_, index) => `/assets/ukiyo-e/birds/flight-cycle/bird-flight-${String(index + 1).padStart(2, '0')}.png`,
  ),
  crane: Array.from(
    { length: framesPerBirdCycle },
    (_, index) => `/assets/ukiyo-e/birds/crane-cycle/crane-flight-${String(index + 1).padStart(2, '0')}.png`,
  ),
  crow: Array.from(
    { length: framesPerBirdCycle },
    (_, index) => `/assets/ukiyo-e/birds/crow-cycle/crow-flight-${String(index + 1).padStart(2, '0')}.png`,
  ),
}

const birdTextureSrcs = birdTypes.flatMap((type) => birdFlightFrameSrcs[type])

function getBirdTextureIndex(type: BirdType, frameIndex: number) {
  return birdTypes.indexOf(type) * framesPerBirdCycle + frameIndex
}

const birdFlights: BirdFlight[] = [
  {
    id: 'bird-01',
    type: 'sparrow',
    start: [-8.8, 3.1, -13.7],
    scale: [0.42, 0.54],
    speed: 0.78,
    bob: 0.72,
    bobAmount: 0.12,
    phase: 0.4,
    frameOffset: 0,
    opacity: 0.42,
  },
  {
    id: 'bird-02',
    type: 'crane',
    start: [-3.4, 4.65, -14.2],
    scale: [0.52, 0.65],
    speed: 0.66,
    bob: 0.58,
    bobAmount: 0.1,
    phase: 2.1,
    frameOffset: 3,
    opacity: 0.35,
  },
  {
    id: 'bird-03',
    type: 'crow',
    start: [2.2, 5.55, -15.8],
    scale: [0.36, 0.47],
    speed: 0.58,
    bob: 0.5,
    bobAmount: 0.09,
    phase: 1.3,
    frameOffset: 6,
    opacity: 0.3,
    flip: true,
  },
  {
    id: 'bird-04',
    type: 'sparrow',
    start: [7.6, 2.65, -13.1],
    scale: [0.46, 0.59],
    speed: 0.86,
    bob: 0.65,
    bobAmount: 0.13,
    phase: 3.2,
    frameOffset: 2,
    opacity: 0.39,
    flip: true,
  },
  {
    id: 'bird-05',
    type: 'crane',
    start: [10.2, 6.2, -16.4],
    scale: [0.38, 0.47],
    speed: 0.54,
    bob: 0.46,
    bobAmount: 0.08,
    phase: 4.1,
    frameOffset: 5,
    opacity: 0.28,
  },
  {
    id: 'bird-06',
    type: 'crow',
    start: [-11.6, 3.75, -12.9],
    scale: [0.32, 0.42],
    speed: 0.9,
    bob: 0.82,
    bobAmount: 0.14,
    phase: 5.3,
    frameOffset: 1,
    opacity: 0.34,
  },
  {
    id: 'bird-07',
    type: 'sparrow',
    start: [12.4, 5.05, -15.2],
    scale: [0.31, 0.4],
    speed: 0.64,
    bob: 0.52,
    bobAmount: 0.1,
    phase: 0.9,
    frameOffset: 7,
    opacity: 0.24,
    flip: true,
  },
]

function wrapPosition(value: number, width: number) {
  return ((((value + width / 2) % width) + width) % width) - width / 2
}

function getBirdCycleWidth({
  camera,
  height,
  width,
  z,
}: {
  camera: PerspectiveCamera
  height: number
  width: number
  z: number
}) {
  const distance = Math.abs(camera.position.z - z)
  const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * distance
  const visibleWidth = visibleHeight * (width / height)

  return visibleWidth + 14
}

function LandscapeStrip({
  layer,
  opacityMultiplier = 1,
  renderOrder,
}: {
  layer: LandscapeLayer
  opacityMultiplier?: number
  renderOrder: number
}) {
  const groupRef = useRef<Group>(null)
  const startTimeRef = useRef<number | null>(null)
  const textureSrcs = layer.srcs ?? [layer.src]
  const textures = useLoader(TextureLoader, textureSrcs)
  const spacing = layer.scale[0] * 0.92
  const cycleWidth = spacing * layer.repeat
  const planeIndexes = useMemo(
    () => Array.from({ length: layer.repeat }, (_, index) => index),
    [layer.repeat],
  )

  useFrame(() => {
    const group = groupRef.current

    if (!group) {
      return
    }

    const now = performance.now() / 1000
    startTimeRef.current ??= now
    const elapsed = now - startTimeRef.current
    const drift = elapsed * layer.speed

    group.children.forEach((child, index) => {
      const x = (index - (layer.repeat - 1) / 2) * spacing + drift
      child.position.x = wrapPosition(x, cycleWidth)
    })
  })

  return (
    <group ref={groupRef} position={[0, layer.y ?? 0, layer.z]}>
      {planeIndexes.map((index) => (
        <mesh key={`${layer.id}-${index}`} renderOrder={renderOrder}>
          <planeGeometry args={layer.scale} />
          <meshBasicMaterial
            alphaTest={0.02}
            depthWrite={false}
            map={textures[index % textures.length]}
            opacity={layer.opacity * opacityMultiplier}
            side={DoubleSide}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}
    </group>
  )
}

function SceneTitle({ opacityMultiplier = 1 }: { opacityMultiplier?: number }) {
  const groupRef = useRef<Group>(null)
  const kanjiTextRef = useRef<FadingText | null>(null)
  const titleTextRef = useRef<FadingText | null>(null)
  const subtitleTextRef = useRef<FadingText | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const isPortrait = useThree(({ size }) => size.width / size.height < 0.75)
  const kanjiFontSize = isPortrait ? 0.92 : 1.3
  const titleFontSize = isPortrait ? 1.2 : 1.76
  const subtitleFontSize = isPortrait ? 0.3 : 0.44
  const kanjiOffset = isPortrait ? 1.12 : 1.48
  const subtitleOffset = isPortrait ? -0.78 : -1.08

  useFrame(() => {
    const group = groupRef.current

    if (!group) {
      return
    }

    const now = performance.now() / 1000
    startTimeRef.current ??= now
    const elapsed = now - startTimeRef.current

    group.position.x = sceneTitle.position[0] + elapsed * sceneTitle.speed
    const opacity = opacityMultiplier * Math.max(
      0,
      Math.min(1, 1 - (elapsed - sceneTitle.fadeStart) / sceneTitle.fadeDuration),
    )

    ;[kanjiTextRef.current, titleTextRef.current, subtitleTextRef.current].forEach((text) => {
      if (!text) {
        return
      }

      text.fillOpacity = opacity
      text.outlineOpacity = opacity
      text.sync()
    })
  })

  return (
    <group ref={groupRef} position={sceneTitle.position} renderOrder={4}>
      <Text
        ref={kanjiTextRef}
        anchorX="center"
        color="#111111"
        fillOpacity={1}
        fontSize={kanjiFontSize}
        fontWeight={700}
        letterSpacing={0}
        lineHeight={0.9}
        maxWidth={isPortrait ? 3.8 : 6}
        outlineColor="#f5f2ea"
        outlineWidth={0.006}
        position={[0, kanjiOffset, 0]}
        renderOrder={4}
      >
        浮世絵
      </Text>
      <Text
        ref={titleTextRef}
        anchorX="center"
        anchorY="middle"
        color="#111111"
        fillOpacity={1}
        font={sceneTitle.font}
        fontSize={titleFontSize}
        fontWeight={700}
        letterSpacing={0}
        lineHeight={0.9}
        maxWidth={isPortrait ? 4.2 : 8}
        outlineColor="#f5f2ea"
        outlineWidth={0.006}
        position={[0, isPortrait ? 0.12 : 0.16, 0]}
        renderOrder={4}
      >
        Ukiyo-e
      </Text>
      <Text
        ref={subtitleTextRef}
        anchorX="center"
        anchorY="middle"
        color="#111111"
        fillOpacity={1}
        font={sceneTitle.font}
        fontSize={subtitleFontSize}
        fontWeight={600}
        letterSpacing={0}
        maxWidth={isPortrait ? 4.2 : 5.8}
        outlineColor="#f5f2ea"
        outlineWidth={0.004}
        position={[0, subtitleOffset, 0]}
        renderOrder={4}
      >
        pictures of the floating world
      </Text>
    </group>
  )
}

function FlyingBirds({ opacityMultiplier = 1 }: { opacityMultiplier?: number }) {
  const groupRef = useRef<Group>(null)
  const startTimeRef = useRef<number | null>(null)
  const materialRefs = useRef<(MeshBasicMaterial | null)[]>([])
  const frameIndexesRef = useRef<number[]>([])
  const textures = useLoader(TextureLoader, birdTextureSrcs)

  useEffect(() => {
    textures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace
      texture.needsUpdate = true
    })
  }, [textures])

  useFrame(({ camera, size }) => {
    const group = groupRef.current

    if (!group) {
      return
    }

    const now = performance.now() / 1000
    startTimeRef.current ??= now
    const elapsed = now - startTimeRef.current

    group.children.forEach((child, index) => {
      const bird = birdFlights[index]
      const direction = bird.flip ? -1 : 1
      const drift = elapsed * bird.speed * direction
      const frameIndex = Math.floor(elapsed * 14 + bird.frameOffset) % framesPerBirdCycle
      const textureIndex = getBirdTextureIndex(bird.type, frameIndex)
      const material = materialRefs.current[index]

      if (material && frameIndexesRef.current[index] !== frameIndex) {
        material.map = textures[textureIndex]
        material.needsUpdate = true
        frameIndexesRef.current[index] = frameIndex
      }

      if (material) {
        material.opacity = bird.opacity * opacityMultiplier
      }

      const cycleWidth = getBirdCycleWidth({
        camera: camera as PerspectiveCamera,
        height: size.height,
        width: size.width,
        z: bird.start[2],
      })

      child.position.x = wrapPosition(bird.start[0] + drift, cycleWidth)
      child.position.y =
        bird.start[1] + Math.sin(elapsed * bird.bob + bird.phase) * bird.bobAmount
    })
  })

  return (
    <group ref={groupRef}>
      {birdFlights.map((bird, index) => (
        <mesh
          key={bird.id}
          position={bird.start}
          renderOrder={6}
          scale={[bird.flip ? -1 : 1, 1, 1]}
        >
          <planeGeometry args={bird.scale} />
          <meshBasicMaterial
            ref={(material) => {
              materialRefs.current[index] = material
            }}
            alphaTest={0.02}
            depthWrite={false}
            map={textures[getBirdTextureIndex(bird.type, bird.frameOffset % framesPerBirdCycle)]}
            opacity={bird.opacity}
            side={DoubleSide}
            toneMapped={false}
            transparent
          />
        </mesh>
      ))}
    </group>
  )
}

const leafSprite = {
  src: '/assets/particles/falling-leaf-sprite.png',
  frameCount: 8,
  frameRate: 10,
  poolSize: 140,
  spawnSpacing: 0.15,
  z: 2.25,
}

type PaintedLeaf = {
  active: boolean
  age: number
  life: number
  position: Vector3
  velocity: Vector3
  phase: number
  scale: number
  rotation: number
  spin: number
  swayAmount: number
  swaySpeed: number
  frameOffset: number
}

function createPaintedLeaf(): PaintedLeaf {
  return {
    active: false,
    age: 0,
    life: 0,
    position: new Vector3(),
    velocity: new Vector3(),
    phase: 0,
    scale: 1,
    rotation: 0,
    spin: 0,
    swayAmount: 0,
    swaySpeed: 0,
    frameOffset: 0,
  }
}

function PaintedLeaves({ opacityMultiplier = 1 }: { opacityMultiplier?: number }) {
  const groupRef = useRef<Group>(null)
  const pointerDownRef = useRef(false)
  const lastSpawnPointRef = useRef<Vector3 | null>(null)
  const spawnCursorRef = useRef(0)
  const texture = useLoader(TextureLoader, leafSprite.src)
  const { camera, gl } = useThree()
  const leaves = useMemo<PaintedLeaf[]>(
    () => Array.from({ length: leafSprite.poolSize }, createPaintedLeaf),
    [],
  )
  const poolIndexes = useMemo(
    () => Array.from({ length: leafSprite.poolSize }, (_, index) => index),
    [],
  )
  const raycaster = useMemo(() => new Raycaster(), [])
  const pointer = useMemo(() => new Vector2(), [])
  const drawPlane = useMemo(() => new Plane(new Vector3(0, 0, 1), -leafSprite.z), [])
  const intersection = useMemo(() => new Vector3(), [])
  const materials = useMemo(
    () =>
      Array.from({ length: leafSprite.frameCount }, (_, index) => {
        const frameTexture = texture.clone()
        frameTexture.colorSpace = SRGBColorSpace
        frameTexture.repeat.set(1 / leafSprite.frameCount, 1)
        frameTexture.offset.set(index / leafSprite.frameCount, 0)
        frameTexture.needsUpdate = true

        return new MeshBasicMaterial({
          alphaTest: 0.02,
          depthWrite: false,
          map: frameTexture,
          side: DoubleSide,
          toneMapped: false,
          transparent: true,
        })
      }),
    [texture],
  )

  useEffect(
    () => () => {
      materials.forEach((material) => {
        material.map?.dispose()
        material.dispose()
      })
    },
    [materials],
  )

  useEffect(() => {
    const canvas = gl.domElement

    const getWorldPoint = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)

      return raycaster.ray.intersectPlane(drawPlane, intersection)
        ? intersection.clone()
        : null
    }

    const spawnLeaf = (point: Vector3) => {
      const leaf = leaves[spawnCursorRef.current % leaves.length]
      spawnCursorRef.current += 1
      leaf.active = true
      leaf.age = 0
      leaf.life = 6.8 + Math.random() * 3.2
      leaf.position.set(
        point.x + (Math.random() - 0.5) * 0.24,
        point.y + (Math.random() - 0.5) * 0.16,
        leafSprite.z + Math.random() * 0.22,
      )
      leaf.velocity.set(
        (Math.random() - 0.5) * 0.24,
        -0.28 - Math.random() * 0.22,
        (Math.random() - 0.5) * 0.06,
      )
      leaf.phase = Math.random() * Math.PI * 2
      leaf.scale = 0.28 + Math.random() * 0.18
      leaf.rotation = Math.random() * Math.PI * 2
      leaf.spin = (Math.random() - 0.5) * 1.8
      leaf.swayAmount = 0.14 + Math.random() * 0.2
      leaf.swaySpeed = 1.2 + Math.random() * 1.6
      leaf.frameOffset = Math.floor(Math.random() * leafSprite.frameCount)
    }

    const paintAt = (point: Vector3, burst = 1) => {
      const lastPoint = lastSpawnPointRef.current

      if (!lastPoint) {
        for (let index = 0; index < burst; index += 1) {
          spawnLeaf(point)
        }
        lastSpawnPointRef.current = point.clone()
        return
      }

      const distance = lastPoint.distanceTo(point)
      const steps = Math.max(1, Math.floor(distance / leafSprite.spawnSpacing))

      for (let index = 1; index <= steps; index += 1) {
        spawnLeaf(lastPoint.clone().lerp(point, index / steps))
      }

      lastSpawnPointRef.current = point.clone()
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) {
        return
      }

      const point = getWorldPoint(event)

      if (!point) {
        return
      }

      event.preventDefault()
      pointerDownRef.current = true
      canvas.setPointerCapture(event.pointerId)
      lastSpawnPointRef.current = null
      paintAt(point, 6)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerDownRef.current) {
        return
      }

      const point = getWorldPoint(event)

      if (point) {
        event.preventDefault()
        paintAt(point)
      }
    }

    const stopPainting = (event: PointerEvent) => {
      pointerDownRef.current = false
      lastSpawnPointRef.current = null

      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId)
      }
    }

    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerup', stopPainting)
    canvas.addEventListener('pointercancel', stopPainting)

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', stopPainting)
      canvas.removeEventListener('pointercancel', stopPainting)
    }
  }, [camera, drawPlane, gl.domElement, intersection, leaves, pointer, raycaster])

  useFrame((_, delta) => {
    const group = groupRef.current

    if (!group) {
      return
    }

    const step = Math.min(delta, 0.04)
    materials.forEach((material) => {
      material.opacity = opacityMultiplier
    })

    leaves.forEach((leaf, index) => {
      const mesh = group.children[index] as Mesh | undefined

      if (!mesh) {
        return
      }

      if (!leaf.active) {
        mesh.visible = false
        return
      }

      leaf.age += step

      if (leaf.age >= leaf.life || leaf.position.y < -5.8) {
        leaf.active = false
        mesh.visible = false
        return
      }

      leaf.position.x +=
        (leaf.velocity.x + Math.sin(leaf.age * leaf.swaySpeed + leaf.phase) * leaf.swayAmount) *
        step
      leaf.position.y += leaf.velocity.y * step
      leaf.position.z += leaf.velocity.z * step
      leaf.velocity.y -= 0.018 * step
      leaf.rotation += leaf.spin * step

      const frame =
        (Math.floor(leaf.age * leafSprite.frameRate) + leaf.frameOffset) % leafSprite.frameCount
      const fadeIn = Math.min(1, leaf.age / 0.2)
      const fadeOut = Math.min(1, (leaf.life - leaf.age) / 0.8)
      const visibleScale = leaf.scale * Math.min(fadeIn, fadeOut)

      mesh.visible = true
      mesh.position.copy(leaf.position)
      mesh.rotation.set(0, 0, leaf.rotation)
      mesh.scale.setScalar(visibleScale)
      mesh.material = materials[frame]
    })
  })

  return (
    <group ref={groupRef}>
      {poolIndexes.map((index) => (
        <mesh key={`painted-leaf-${index}`} renderOrder={30} visible={false}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  )
}

type RainDrop = {
  x: number
  y: number
  z: number
  speed: number
  length: number
}

const rainBounds = {
  left: -8.4,
  right: 8.4,
  top: 5.4,
  bottom: -5.2,
  near: 5.4,
  far: -5.4,
}

const rainTiming = {
  fullDuration: sceneTitle.fadeStart,
  stopDuration: 5.5,
  maxOpacity: 0.24,
}

function seededRandom(seed: number) {
  const value = Math.sin(seed * 127.1) * 43758.5453123
  return value - Math.floor(value)
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value)
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2
}

function RainEffect({ opacityMultiplier = 1 }: { opacityMultiplier?: number }) {
  const meshRef = useRef<InstancedMesh>(null)
  const materialRef = useRef<MeshBasicMaterial>(null)
  const startTimeRef = useRef<number | null>(null)
  const dummy = useMemo(() => new Object3D(), [])
  const drops = useMemo<RainDrop[]>(
    () =>
      Array.from({ length: 260 }, (_, index) => {
        const xSeed = seededRandom(index + 1)
        const ySeed = seededRandom(index + 19)
        const zSeed = seededRandom(index + 43)
        const speedSeed = seededRandom(index + 71)

        return {
          x: rainBounds.left + xSeed * (rainBounds.right - rainBounds.left),
          y: rainBounds.bottom + ySeed * (rainBounds.top - rainBounds.bottom),
          z: rainBounds.far + zSeed * (rainBounds.near - rainBounds.far),
          speed: 3.8 + speedSeed * 2.3,
          length: 0.42 + seededRandom(index + 101) * 0.36,
        }
      }),
    [],
  )

  useFrame((_, delta) => {
    const mesh = meshRef.current

    if (!mesh) {
      return
    }

    const now = performance.now() / 1000
    startTimeRef.current ??= now
    const elapsed = now - startTimeRef.current
    const stopProgress = Math.max(
      0,
      Math.min(1, (elapsed - rainTiming.fullDuration) / rainTiming.stopDuration),
    )
    const intensity = 1 - smoothstep(stopProgress)
    const material = materialRef.current

    if (material) {
      material.opacity = rainTiming.maxOpacity * intensity * opacityMultiplier
    }

    mesh.visible = intensity > 0.01

    if (!mesh.visible) {
      return
    }

    drops.forEach((drop, index) => {
      drop.y -= drop.speed * delta * intensity
      drop.x -= drop.speed * delta * 0.18 * intensity

      if (drop.y < rainBounds.bottom) {
        drop.y = rainBounds.top + seededRandom(index + performance.now()) * 1.6
        drop.x = rainBounds.left + seededRandom(index + 211) * (rainBounds.right - rainBounds.left)
      }

      if (drop.x < rainBounds.left) {
        drop.x = rainBounds.right
      }

      dummy.position.set(drop.x, drop.y, drop.z)
      dummy.rotation.set(0, 0, -0.26)
      dummy.scale.set(1, drop.length, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, drops.length]} renderOrder={20}>
      <planeGeometry args={[0.011, 0.52]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#1a1a1a"
        depthWrite={false}
        opacity={rainTiming.maxOpacity}
        side={DoubleSide}
        toneMapped={false}
        transparent
      />
    </instancedMesh>
  )
}

function SkyTransition({
  active,
  onComplete,
}: {
  active: boolean
  onComplete: () => void
}) {
  const { camera } = useThree()
  const startTimeRef = useRef<number | null>(null)
  const completedRef = useRef(false)
  const startPositionRef = useRef(new Vector3())
  const startQuaternionRef = useRef(new Quaternion())
  const targetQuaternionRef = useRef(new Quaternion())
  const startFovRef = useRef(38)

  useEffect(() => {
    if (!active) {
      startTimeRef.current = null
      completedRef.current = false
      return
    }

    const perspectiveCamera = camera as PerspectiveCamera
    const targetCamera = perspectiveCamera.clone()

    startTimeRef.current = performance.now() / 1000
    completedRef.current = false
    startPositionRef.current.copy(perspectiveCamera.position)
    startQuaternionRef.current.copy(perspectiveCamera.quaternion)
    startFovRef.current = perspectiveCamera.fov

    targetCamera.position.copy(skyTransition.targetPosition)
    targetCamera.lookAt(skyTransition.lookAt)
    targetQuaternionRef.current.copy(targetCamera.quaternion)
  }, [active, camera])

  useFrame((state) => {
    if (!active || startTimeRef.current === null || completedRef.current) {
      return
    }

    const perspectiveCamera = state.camera as PerspectiveCamera
    const elapsed = performance.now() / 1000 - startTimeRef.current
    const progress = Math.min(1, elapsed / skyTransition.duration)
    const eased = easeInOutCubic(progress)

    perspectiveCamera.position.lerpVectors(
      startPositionRef.current,
      skyTransition.targetPosition,
      eased,
    )
    perspectiveCamera.quaternion
      .copy(startQuaternionRef.current)
      .slerp(targetQuaternionRef.current, eased)
    perspectiveCamera.fov =
      startFovRef.current + (skyTransition.targetFov - startFovRef.current) * eased
    perspectiveCamera.updateProjectionMatrix()

    if (progress >= 1) {
      completedRef.current = true
      onComplete()
    }
  })

  return null
}

export function UkiyoELandscape({
  isTransitioning = false,
  onTransitionComplete = () => undefined,
}: {
  isTransitioning?: boolean
  onTransitionComplete?: () => void
}) {
  const backgroundLayers = layers.filter((layer) => layer.id !== foregroundLayerId)
  const foregroundLayer = layers.find((layer) => layer.id === foregroundLayerId)

  return (
    <>
      <color attach="background" args={['#f5f2ea']} />
      <SkyTransition active={isTransitioning} onComplete={onTransitionComplete} />
      <group position={[0, -0.75, 0]}>
        {backgroundLayers.map((layer, index) => (
          <LandscapeStrip
            key={layer.id}
            layer={layer}
            renderOrder={index + 1}
          />
        ))}
        <SceneTitle />
        {foregroundLayer && (
          <LandscapeStrip
            layer={foregroundLayer}
            renderOrder={12}
          />
        )}
        <FlyingBirds />
      </group>
      <PaintedLeaves />
      <RainEffect />
    </>
  )
}
