import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Html, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import Screen from './Screen'
import GlbModel, { ModelBoundary } from './GlbDevice'
import { htmlPortal } from './portal'
import { sound } from './sound'
import { cursor } from './cursorState'

function Metal({ color = '#cfd2d6', roughness = 0.34 }) {
  return <meshPhysicalMaterial color={color} metalness={1} roughness={roughness} anisotropy={0.55} clearcoat={0.15} />
}
const Black = () => <meshPhysicalMaterial color="#0d0e10" roughness={0.35} metalness={0.2} clearcoat={0.6} />

function useKeysTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 1100
    c.height = 380
    const g = c.getContext('2d')
    g.fillStyle = '#17181a'
    g.fillRect(0, 0, c.width, c.height)
    const rows = [14, 14, 13, 12, 8]
    rows.forEach((n, r) => {
      const gap = 8
      const kw = (c.width - 60 - gap * (n - 1)) / n
      for (let i = 0; i < n; i++) {
        g.fillStyle = '#2b2d30'
        g.beginPath()
        g.roundRect(30 + i * (kw + gap), 24 + r * 66, kw, 54, 9)
        g.fill()
      }
    })
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [])
}

function Laptop({ niche, business, shot }) {
  const keys = useKeysTexture()
  return (
    <group position={[0, -0.75, 0]}>
      <RoundedBox args={[3.3, 0.09, 2.25]} radius={0.045} smoothness={5}>
        <Metal />
      </RoundedBox>
      <mesh position={[0, 0.0465, -0.18]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2.9, 1.0]} />
        <meshStandardMaterial map={keys} roughness={0.7} />
      </mesh>
      <RoundedBox args={[1.15, 0.004, 0.72]} radius={0.03} position={[0, 0.047, 0.62]}>
        <meshPhysicalMaterial color="#d9dce0" metalness={1} roughness={0.5} />
      </RoundedBox>
      {/* lid, hinged at the back edge */}
      <group position={[0, 0.05, -1.08]} rotation-x={-1.78}>
        <RoundedBox args={[3.3, 0.07, 2.2]} radius={0.035} smoothness={5} position={[0, 0, 1.1]}>
          <Metal />
        </RoundedBox>
        <mesh position={[0, -0.0365, 1.1]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[3.2, 2.1]} />
          <Black />
        </mesh>
        <Screen w={3.06} h={1.9} pxW={1000} niche={niche} business={business} shot={shot} position={[0, -0.0385, 1.1]} rotation-x={Math.PI / 2} />
        {/* the screen's glow spills onto the keyboard deck */}
        <pointLight position={[0, -0.7, 1.1]} intensity={0.9} distance={3.2} decay={2} color="#eef3ff" />
      </group>
    </group>
  )
}

function Phone({ niche, business, shot }) {
  return (
    <group>
      <RoundedBox args={[1.32, 2.78, 0.13]} radius={0.17} smoothness={6}>
        <Metal color="#b9b6ae" roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[1.24, 2.7, 0.01]} radius={0.14} smoothness={6} position={[0, 0, 0.066]}>
        <Black />
      </RoundedBox>
      <Screen w={1.16} h={2.52} pxW={390} niche={niche} business={business} shot={shot} position={[0, 0, 0.073]} />
      <RoundedBox args={[0.34, 0.09, 0.012]} radius={0.045} position={[0, 1.18, 0.075]}>
        <meshBasicMaterial color="#050506" />
      </RoundedBox>
      <RoundedBox args={[0.03, 0.34, 0.1]} radius={0.012} position={[0.67, 0.5, 0]}>
        <Metal color="#b9b6ae" />
      </RoundedBox>
    </group>
  )
}

function Tablet({ niche, business, shot }) {
  return (
    <group>
      <RoundedBox args={[3.1, 2.15, 0.1]} radius={0.11} smoothness={6}>
        <Metal color="#d6d4cf" />
      </RoundedBox>
      <RoundedBox args={[3.0, 2.05, 0.01]} radius={0.08} smoothness={6} position={[0, 0, 0.051]}>
        <Black />
      </RoundedBox>
      <Screen w={2.92} h={1.95} pxW={900} niche={niche} business={business} shot={shot} position={[0, 0, 0.058]} />
    </group>
  )
}

function Display({ niche, business, shot }) {
  return (
    <group position={[0, 0.2, 0]}>
      <RoundedBox args={[4.3, 2.6, 0.12]} radius={0.07} smoothness={5}>
        <Metal color="#d3d5d8" />
      </RoundedBox>
      <RoundedBox args={[4.2, 2.5, 0.01]} radius={0.05} smoothness={5} position={[0, 0, 0.061]}>
        <Black />
      </RoundedBox>
      <Screen w={4.1} h={2.35} pxW={1150} niche={niche} business={business} shot={shot} position={[0, 0, 0.068]} />
      <RoundedBox args={[0.55, 1.45, 0.08]} radius={0.03} position={[0, -1.95, -0.16]} rotation-x={0.06}>
        <Metal color="#c4c7cb" />
      </RoundedBox>
      <RoundedBox args={[1.7, 0.06, 1.15]} radius={0.03} position={[0, -2.66, -0.1]}>
        <Metal color="#c4c7cb" />
      </RoundedBox>
    </group>
  )
}

// The demo slab reacts to every change: a small pulse, and its glass takes on a
// faint tint of the chosen accent colour.
function Slab({ niche, business, shot, layout, accent }) {
  const g = useRef()
  const pulse = useRef(0)
  const first = useRef(true)
  const tint = useMemo(() => new THREE.Color(accent || '#dfe6ee').lerp(new THREE.Color('#ffffff'), accent ? 0.72 : 0), [accent])
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    pulse.current = 1
  }, [niche, layout, accent])
  useFrame((state, dt) => {
    pulse.current = THREE.MathUtils.damp(pulse.current, 0, 4.5, dt)
    if (!g.current) return
    const p = pulse.current
    g.current.scale.setScalar(1 + 0.035 * p)
    g.current.rotation.z = Math.sin(state.clock.elapsedTime * 22) * 0.012 * p
  })
  return (
    <group ref={g} position={[0, 0.2, 0]}>
      <RoundedBox args={[4.5, 2.8, 0.2]} radius={0.12} smoothness={6}>
        <meshPhysicalMaterial color="#ffffff" transmission={1} thickness={0.8} roughness={0.42} ior={1.35} attenuationColor={'#' + tint.getHexString()} attenuationDistance={2} />
      </RoundedBox>
      <Screen w={4.0} h={2.28} pxW={1150} niche={niche} business={business} shot={shot} layout={layout} accent={accent} position={[0, 0, 0.11]} />
    </group>
  )
}

function Monolith({ hovered }) {
  const led = useRef()
  useFrame(({ clock }) => {
    if (led.current) led.current.material.emissiveIntensity = 1.6 + Math.sin(clock.elapsedTime * 2.2) * 0.6 + (hovered ? 1.6 : 0)
  })
  return (
    <group position={[0, 0.3, 0]}>
      {/* clear, lightly frosted acrylic: light enough to read as glass, with a warm glow from within */}
      <RoundedBox args={[2.4, 3.5, 0.62]} radius={0.17} smoothness={6}>
        <meshPhysicalMaterial color="#f6f8fb" transmission={1} thickness={1.45} roughness={0.16} ior={1.5} attenuationColor="#c9d4e4" attenuationDistance={2.0} clearcoat={0.5} />
      </RoundedBox>
      <pointLight position={[0, 0.1, 0.5]} color="#ff7a4d" intensity={1.5} distance={4.4} decay={2} />
      {/* brushed metal plinth */}
      <RoundedBox args={[2.9, 0.16, 1.1]} radius={0.06} smoothness={5} position={[0, -1.84, 0]}>
        <Metal color="#c9ccd1" />
      </RoundedBox>
      {/* light slit inside the glass */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.025, 2.5, 0.04]} />
        <meshStandardMaterial color="#ff6a3c" emissive="#ff5a2c" emissiveIntensity={1.4} />
      </mesh>
      <mesh ref={led} position={[0, -1.45, 0.34]}>
        <sphereGeometry args={[0.055, 24, 24]} />
        <meshStandardMaterial color="#ff5a2c" emissive="#ff5a2c" emissiveIntensity={1.6} />
      </mesh>
      <Html transform portal={htmlPortal} pointerEvents="none" scale={0.2125} position={[0, 0.1, 0.33]} zIndexRange={[10, 0]}>
        <TypedPrompt />
      </Html>
    </group>
  )
}

// The monolith's prompt types its own lines, deletes them, and moves on. It writes
// straight to the DOM, so it never triggers a React render.
const PROMPT_LINES = ['hire jagrit', 'book a call', 'say hello']
function TypedPrompt() {
  const text = useRef(null)
  useEffect(() => {
    let line = 0
    let n = 0
    let deleting = false
    let t
    const tick = () => {
      const s = PROMPT_LINES[line]
      n += deleting ? -1 : 1
      if (text.current) text.current.textContent = s.slice(0, n)
      let wait = deleting ? 38 : 85
      if (!deleting && n === s.length) {
        wait = 1500
        deleting = true
      } else if (deleting && n === 0) {
        deleting = false
        line = (line + 1) % PROMPT_LINES.length
        wait = 350
      }
      t = setTimeout(tick, wait)
    }
    tick()
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="prompt-dom">
      <span>&gt;</span> <b ref={text} />
      <i />
    </div>
  )
}

// Soft radial falloff used for the hover halo.
function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    grad.addColorStop(0, 'rgba(255,255,255,0.9)')
    grad.addColorStop(0.35, 'rgba(255,255,255,0.4)')
    grad.addColorStop(0.7, 'rgba(255,255,255,0.08)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 256, 256)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
}

const MODELS = { laptop: Laptop, phone: Phone, tablet: Tablet, display: Display, slab: Slab, monolith: Monolith }

// Floating, cursor-tilting, pull-to-open device.
export default function Device({ kind, position, baseRotation = [0, 0, 0], size = 1, niche, business, shot, layout, accent, glb, onOpen, label, reduced }) {
  const Model = MODELS[kind]
  const tilt = useRef()
  const rise = useRef()
  const appear = useRef(0)
  const glow = useRef()
  const rim = useRef()
  const glowTex = useGlowTexture()
  const [hovered, setHovered] = useState(false)
  const down = useRef(null)

  useFrame((state, dt) => {
    const g = tilt.current
    if (!g) return
    const px = reduced ? 0 : state.pointer.x
    const py = reduced ? 0 : state.pointer.y
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, baseRotation[1] + px * 0.5, 4, dt)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, baseRotation[0] - py * 0.3, 4, dt)
    g.rotation.z = baseRotation[2]
    // devices rise into place as the camera arrives
    const near = Math.abs(state.camera.position.x - position[0]) < 12 ? 1 : 0
    appear.current = THREE.MathUtils.damp(appear.current, near, 2.6, dt)
    const a = appear.current
    if (rise.current) rise.current.position.y = (1 - a) * -1.1
    const target = (hovered ? 1.045 : 1) * (0.88 + 0.12 * a) * size
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, target, 6, dt))
    // hover glow: a warm halo behind, plus a soft rim light on the device
    if (glow.current) glow.current.opacity = THREE.MathUtils.damp(glow.current.opacity, hovered ? 0.5 : 0, 4, dt)
    if (rim.current) rim.current.intensity = THREE.MathUtils.damp(rim.current.intensity, hovered ? 2.2 : 0, 5, dt)
  })

  const pointerDown = (e) => {
    if (!onOpen) return
    e.stopPropagation()
    const start = { x: e.clientX, y: e.clientY }
    down.current = start
    const move = (ev) => {
      if (Math.hypot(ev.clientX - start.x, ev.clientY - start.y) > 12) {
        cleanup()
        onOpen({ x: ev.clientX, y: ev.clientY })
      }
    }
    const cleanup = () => {
      down.current = null
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', cleanup)
    }
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', cleanup)
  }

  return (
    <group position={position}>
      <group ref={rise}>
      <Float speed={reduced ? 0 : 1.2} rotationIntensity={0.12} floatIntensity={0.55} floatingRange={[-0.12, 0.12]}>
        {/* sits well behind the device (never over it) to mark the click / drag zone */}
        <mesh position={[0, 0, -3.4]} scale={size * 1.28} renderOrder={-5}>
          <planeGeometry args={[9, 7]} />
          <meshBasicMaterial ref={glow} map={glowTex} color="#ff8a5c" transparent opacity={0} depthWrite={false} toneMapped={false} />
        </mesh>
        <pointLight ref={rim} position={[-1.8, 2.2, 3]} intensity={0} distance={9} decay={2} color="#ffffff" />
        <group
          ref={tilt}
          onPointerOver={(e) => {
            e.stopPropagation()
            if (!onOpen) return
            setHovered(true)
            sound.hover()
            cursor.label = label || 'Open'
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            setHovered(false)
            cursor.label = null
            document.body.style.cursor = ''
          }}
          onPointerDown={pointerDown}
          onClick={(e) => {
            e.stopPropagation()
            if (onOpen) sound.click()
            onOpen?.(null, { x: e.clientX, y: e.clientY })
          }}
        >
          {glb ? (
            <ModelBoundary fallback={<Model niche={niche} business={business} shot={shot} layout={layout} accent={accent} hovered={hovered} />}>
              <Suspense fallback={<Model niche={niche} business={business} shot={shot} layout={layout} accent={accent} hovered={hovered} />}>
                <GlbModel url={glb} kind={kind} niche={niche} business={business} shot={shot} layout={layout} accent={accent} />
              </Suspense>
            </ModelBoundary>
          ) : (
            <Model niche={niche} business={business} shot={shot} layout={layout} accent={accent} hovered={hovered} />
          )}
        </group>
      </Float>
      </group>
    </group>
  )
}
