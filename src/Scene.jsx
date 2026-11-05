import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import Device from './Devices'
import { projects } from './data'

export const BG = '#e9e7e2'
export const SPACING = 12
import { STATIONS } from './stations'
import { probeModels } from './models'
const N = STATIONS.length
const ease = (t) => t * t * (3 - 2 * t)

// Soft studio lighting built from light panels, so nothing is downloaded.
function Studio() {
  return (
    <Environment resolution={256} frames={1} background={false}>
      <color attach="background" args={['#cfd2d6']} />
      <Lightformer form="rect" intensity={4.2} position={[0, 6, 2]} scale={[14, 6, 1]} rotation-x={Math.PI / 2} />
      <Lightformer form="rect" intensity={2.2} position={[-7, 1.5, 3]} scale={[2.5, 8, 1]} rotation-y={Math.PI / 2.4} />
      <Lightformer form="rect" intensity={1.6} position={[7, 2, 2]} scale={[2, 7, 1]} rotation-y={-Math.PI / 2.4} />
      <Lightformer form="rect" intensity={1.1} position={[0, -3, 5]} scale={[12, 2, 1]} rotation-x={-Math.PI / 2.6} />
      <Lightformer form="ring" intensity={1.2} color="#fff3e6" position={[0, 2, -6]} scale={5} />
    </Environment>
  )
}

function useAspect() {
  const { size } = useThree()
  return size.width / size.height
}

// Phone framing: each device should fill about 80% of the width, fit inside the
// free area above the text card, and sit centred in it.
const DIM = { laptop: [3.4, 2.4], phone: [1.4, 2.9], tablet: [3.2, 2.2], display: [4.4, 3.5], slab: [4.6, 2.9], monolith: [2.6, 3.8] }
const VIEW_H = 0.5735 // visible height per unit of camera distance (fov 32)
const narrowDist = (kind, aspect) => {
  const [w, h] = DIM[kind]
  return Math.max(w / (0.82 * VIEW_H * aspect), h / (0.38 * VIEW_H), 9)
}
const narrowLift = (dist) => 0.17 * VIEW_H * dist

// Camera dollies between stations and breathes with the cursor.
function Rig({ narrow, scroll, reduced }) {
  const aspect = useAspect()
  const look = useRef(new THREE.Vector3())
  useFrame(({ camera, pointer }, dt) => {
    scroll.offset = THREE.MathUtils.damp(scroll.offset, scroll.target, reduced ? 60 : 5, dt)
    const r = scroll.offset * (N - 1)
    const i = Math.min(N - 2, Math.floor(r))
    const t = ease(r - i)
    // one-off "tease": the camera drifts toward the next device and eases back
    const tz = scroll.teaseAt ? (performance.now() - scroll.teaseAt) / 1800 : 2
    const tease = tz < 1 ? Math.sin(Math.PI * tz) ** 2 * (narrow ? 0.45 : 0.9) : 0
    const x = THREE.MathUtils.lerp(i * SPACING, (i + 1) * SPACING, t) + tease
    const base = narrow
      ? THREE.MathUtils.lerp(narrowDist(STATIONS[i].kind, aspect), narrowDist(STATIONS[i + 1].kind, aspect), t)
      : Math.max(12, 5.4 / (0.5735 * aspect))
    const dist = base + Math.sin(t * Math.PI) * 1.6
    const tx = x + pointer.x * 0.55
    const ty = (narrow ? 0.25 : 0.8) + pointer.y * 0.3
    camera.position.x = THREE.MathUtils.damp(camera.position.x, tx, 6, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, ty, 6, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, dist, 4, dt)
    look.current.set(x, narrow ? 0 : 0.55, 0)
    camera.lookAt(look.current)
  })
  return null
}

// A very faint drafting grid on far walls, in two layers for depth. Each layer
// drifts at its own fraction of the camera's speed and sways a little with the
// mouse, so the grid slides gently behind the devices. Fog fades it, and the
// glass refracts it.
function GridLayer({ z, tile, alpha, drift, sway, size, order }) {
  const mesh = useRef()
  const p = useRef({ x: 0, y: 0 })
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 512
    const g = c.getContext('2d')
    g.strokeStyle = `rgba(21,23,26,${alpha})`
    g.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      g.beginPath()
      g.moveTo(i * 128 + 0.5, 0)
      g.lineTo(i * 128 + 0.5, 512)
      g.moveTo(0, i * 128 + 0.5)
      g.lineTo(512, i * 128 + 0.5)
      g.stroke()
    }
    g.strokeStyle = `rgba(21,23,26,${alpha * 2})`
    g.lineWidth = 1.5
    g.strokeRect(0.75, 0.75, 510.5, 510.5)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = 8
    t.repeat.set(size[0] / tile, size[1] / tile)
    return t
  }, [alpha, tile, size])

  useFrame(({ camera, pointer }, dt) => {
    if (!mesh.current) return
    // eased pointer, so the sway never twitches
    p.current.x = THREE.MathUtils.damp(p.current.x, pointer.x, 2.5, dt)
    p.current.y = THREE.MathUtils.damp(p.current.y, pointer.y, 2.5, dt)
    const cx = camera.position.x
    mesh.current.position.x = cx
    tex.offset.x = (cx * drift - p.current.x * sway) / tile
    tex.offset.y = (-p.current.y * sway * 0.6) / tile
  })
  return (
    <mesh ref={mesh} position={[0, 0.5, z]} renderOrder={order}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}
function Backdrop() {
  return (
    <>
      <GridLayer z={-16} tile={4} alpha={0.022} drift={0.85} sway={0.4} size={[100, 50]} order={-10} />
      <GridLayer z={-34} tile={10} alpha={0.02} drift={0.55} sway={1.1} size={[210, 105]} order={-11} />
    </>
  )
}

// Pale pebbles, rings and orbs for depth and to show the materials.
const sideOf = (i) => (i % 2 === 0 ? 1 : -1)
// half the width of each device model, in scene units
const HALF = { laptop: 1.65, phone: 0.66, tablet: 1.55, display: 2.15, slab: 2.25, monolith: 1.2 }
// Props sit around each device (on its far side, away from the copy), plus a
// few high, faint pieces in the gaps so the camera passes something between stations.
function buildProps(narrow) {
  const out = []
  STATIONS.forEach((s, i) => {
    const side = sideOf(i)
    const cx = i * SPACING + (narrow ? 0 : side * s.off)
    s.props.forEach((p) => {
      // k undoes perspective, so a prop lands where it reads on screen at the device's depth
      const k = (12 - p.z) / 12
      const reach = HALF[s.kind] * s.size + p.gap
      if (narrow) {
        // small pieces tucked beside the device, scaled to the closer camera
        const a = window.innerWidth / window.innerHeight
        const d = narrowDist(s.kind, a)
        const lift = narrowLift(d)
        const up = p.y > 0
        out.push({
          t: p.t,
          x: cx + (up ? -1 : 1) * (DIM[s.kind][0] / 2 + 0.5),
          y: lift + (up ? 1 : -1) * Math.min(DIM[s.kind][1] / 2, 1.6),
          z: p.z,
          s: p.s * (d / 12) * 0.9,
        })
        return
      }
      out.push({ t: p.t, x: cx + side * reach * k, y: p.y * k, z: p.z, s: p.s })
    })
    if (i < STATIONS.length - 1) {
      out.push({ t: i % 2 ? 'pill' : 'orb', x: i * SPACING + SPACING / 2, y: 3.1, z: -7, s: 0.5 })
    }
  })
  return out
}
function Props({ reduced, narrow }) {
  const PROPS = useMemo(() => buildProps(narrow), [narrow])
  return PROPS.map((p, i) => (
    <group key={i} position={[p.x, p.y, p.z]} scale={p.s}>
      <FloatBit reduced={reduced} seed={i}>
        {p.t === 'orb' && (
          <mesh>
            <sphereGeometry args={[1, 48, 48]} />
            <meshPhysicalMaterial color="#ffffff" transmission={1} thickness={1.2} roughness={0.12} ior={1.5} attenuationColor="#f1e4d4" attenuationDistance={3} />
          </mesh>
        )}
        {p.t === 'ring' && (
          <mesh rotation={[1.1, 0.4, 0]}>
            <torusGeometry args={[1, 0.22, 48, 96]} />
            <meshPhysicalMaterial color="#d6d8db" metalness={1} roughness={0.28} anisotropy={0.8} />
          </mesh>
        )}
        {p.t === 'pill' && (
          <mesh rotation={[0.3, 0.2, 1.1]}>
            <capsuleGeometry args={[0.45, 1.5, 12, 32]} />
            <meshPhysicalMaterial color="#f6f5f2" transmission={0.92} thickness={0.8} roughness={0.5} ior={1.3} />
          </mesh>
        )}
      </FloatBit>
    </group>
  ))
}
function FloatBit({ children, seed, reduced }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (reduced || !ref.current) return
    const t = clock.elapsedTime * 0.4 + seed
    ref.current.position.y = Math.sin(t) * 0.18
    ref.current.rotation.y = t * 0.25
  })
  return <group ref={ref}>{children}</group>
}

// Floor shadows follow the camera so the studio feels endless.
function Shadows() {
  const ref = useRef()
  useFrame(({ camera }) => {
    if (ref.current) ref.current.position.x = camera.position.x
  })
  return (
    <group ref={ref} position={[0, -2.3, 0]}>
      <ContactShadows opacity={0.38} scale={28} blur={3.2} far={5} resolution={512} color="#4a4339" />
    </group>
  )
}

// Hands the page its controls and keeps the rail in sync (no React state per frame).
function Bridge({ scroll, railRef, onStation }) {
  const last = useRef(-1)
  const blocks = useRef(null)
  const calm = useRef(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useFrame(() => {
    // Station copy follows the camera: d is how far (in stations) the camera is from block i.
    // At d = 0 the block is fully there; it slides against the pan, fades and softens as d grows.
    if (!blocks.current || !blocks.current.length) blocks.current = Array.from(document.querySelectorAll('.overlays .st'))
    const r = scroll.offset * (N - 1)
    blocks.current.forEach((el, i) => {
      const d = r - i
      const ad = Math.abs(d)
      const k = THREE.MathUtils.smoothstep(ad, 0.06, 0.6) // 0 = settled, 1 = gone
      const a = 1 - k
      el.style.opacity = a.toFixed(3)
      el.style.visibility = a < 0.02 ? 'hidden' : 'visible'
      el.style.transform = calm.current ? 'none' : `translate3d(${(-d * 90).toFixed(1)}px, 0, 0) scale(${(1 - k * 0.025).toFixed(4)})`
      el.style.filter = calm.current || k < 0.01 ? 'none' : `blur(${(k * 9).toFixed(2)}px)`
      const active = ad < 0.42
      if (el.dataset.active !== String(active)) el.dataset.active = String(active)
    })

    const rail = railRef.current
    if (!rail) return
    const idx = Math.round(scroll.target * (N - 1))
    const p = scroll.offset.toFixed(4)
    rail.style.setProperty('--p', p)
    document.documentElement.style.setProperty('--p', p) // drives the nav's progress line
    if (idx !== last.current) {
      last.current = idx
      rail.querySelectorAll('button').forEach((b, i) => b.setAttribute('data-active', String(i === idx)))
      onStation?.(idx)
    }
  })
  return null
}

function World({ narrow, reduced, demo, onOpenProject, onOpenTerminal }) {
  // which of public/models/<kind>.glb exist (missing ones use the built-in device)
  const [glbs, setGlbs] = useState({})
  useEffect(() => {
    probeModels().then(setGlbs)
  }, [])
  const aspect = useAspect()
  return (
    <>
      <Shadows />
      <Props reduced={reduced} narrow={narrow} />
      {STATIONS.map((s, i) => {
        const side = sideOf(i)
        const project = projects.find((p) => p.id === s.project)
        const isDemo = s.kind === 'slab'
        const mock = project ? project.mock : demo
        return (
          <Device
            key={s.key}
            kind={s.kind}
            position={[i * SPACING + (narrow ? 0 : side * s.off), narrow ? narrowLift(narrowDist(s.kind, aspect)) : s.lift, 0]}
            size={narrow ? 1 : s.size}
            baseRotation={[s.kind === 'laptop' ? 0.22 : 0, narrow ? 0 : -side * 0.32, 0]}
            niche={mock?.niche}
            layout={mock?.layout}
            accent={mock?.accent}
            business={mock?.business}
            shot={mock?.shot}
            reduced={reduced}
            glb={glbs[s.kind] || null}
            label={s.kind === 'monolith' ? 'Terminal' : 'Open'}
            onOpen={
              project
                ? (drag, origin) => onOpenProject(project, drag, origin)
                : s.kind === 'monolith'
                  ? onOpenTerminal
                  : undefined
            }
          />
        )
      })}
      <mesh visible={false} scale={aspect} />
    </>
  )
}

// Reports real load stages: the first frames render, then the live screens exist.
function ReadyProbe({ onProgress, onReady }) {
  const n = useRef(0)
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    n.current += 1
    if (n.current === 3) onProgress?.(90, 'Lighting the room')
    if (n.current >= 24 && document.querySelector('.screen-dom')) {
      done.current = true
      onProgress?.(100, 'Ready')
      onReady?.()
    }
    if (n.current > 240) {
      done.current = true
      onReady?.()
    }
  })
  return null
}

export default function Scene({ scroll, scrollerRef, demo, onOpenProject, onOpenTerminal, railRef, onReady, onProgress, onStation }) {
  const narrow = typeof window !== 'undefined' && window.innerWidth < 768
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const top = narrow ? 1.5 : 1.75
  const [dpr, setDpr] = useState(top)

  return (
    <Canvas
      dpr={dpr}
      onCreated={() => onProgress?.(78, 'Setting up the studio')}
      camera={{ fov: 32, position: [0, 0.8, 14], near: 0.1, far: 90 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      eventSource={scrollerRef}
      eventPrefix="client"
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 20, 55]} />
      <Backdrop />
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(top)} />
      <Studio />
      <Rig narrow={narrow} scroll={scroll} reduced={reduced} />
      <World narrow={narrow} reduced={reduced} demo={demo} onOpenProject={onOpenProject} onOpenTerminal={onOpenTerminal} />
      <Bridge scroll={scroll} railRef={railRef} onStation={onStation} />
      <ReadyProbe onProgress={onProgress} onReady={onReady} />
    </Canvas>
  )
}
