import { Component, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import Screen from './Screen'
import { NOMINAL, SCREEN_PX } from './models'

const UP = new THREE.Vector3(0, 1, 0)

// Reads a loaded model and works out, from the geometry alone:
//  - the scale and offset that fit it to the stage like the built-in devices
//  - where the mesh named "Screen" sits, how big it is and which way it faces
function analyze(source, kind) {
  const scene = source.clone(true)
  scene.updateMatrixWorld(true)

  let screen = null
  scene.traverse((o) => {
    if (!screen && o.isMesh && /^screen$/i.test(o.name)) screen = o
  })

  const box = new THREE.Box3().setFromObject(scene)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const s = NOMINAL[kind] / Math.max(size.x, 1e-6)

  let frame = null
  if (screen) {
    const pos = screen.geometry.attributes.position
    const nor = screen.geometry.attributes.normal
    const verts = []
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) verts.push(v.fromBufferAttribute(pos, i).applyMatrix4(screen.matrixWorld).clone())

    // normal: the average of the mesh's own vertex normals (it should face the viewer)
    const n = new THREE.Vector3()
    const nm = new THREE.Matrix3().getNormalMatrix(screen.matrixWorld)
    if (nor) for (let i = 0; i < nor.count; i++) n.add(v.fromBufferAttribute(nor, i).applyMatrix3(nm))
    if (n.lengthSq() < 1e-8) n.set(0, 0, 1)
    n.normalize()

    // in-plane axes: "up" is world-up projected onto the screen plane
    const up = UP.clone().addScaledVector(n, -UP.dot(n))
    if (up.lengthSq() < 0.04) up.set(0, 0, -1).addScaledVector(n, n.z)
    up.normalize()
    const right = new THREE.Vector3().crossVectors(up, n).normalize()

    const c = new THREE.Vector3()
    verts.forEach((p) => c.add(p))
    c.divideScalar(verts.length)
    let r0 = Infinity, r1 = -Infinity, u0 = Infinity, u1 = -Infinity
    verts.forEach((p) => {
      const d = p.clone().sub(c)
      const r = d.dot(right)
      const u = d.dot(up)
      r0 = Math.min(r0, r); r1 = Math.max(r1, r)
      u0 = Math.min(u0, u); u1 = Math.max(u1, u)
    })
    const mid = c.clone().addScaledVector(right, (r0 + r1) / 2).addScaledVector(up, (u0 + u1) / 2)

    frame = {
      w: (r1 - r0) * s,
      h: (u1 - u0) * s,
      position: mid.sub(center).multiplyScalar(s),
      quaternion: new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, n)),
    }
    // the live DOM covers it; keep a dark panel underneath for the moment before it paints
    screen.material = new THREE.MeshBasicMaterial({ color: '#0b0c0e' })
  } else if (kind !== 'monolith') {
    console.warn(`[models] ${kind}.glb has no mesh named "Screen", so no live site will be shown on it.`)
  }

  scene.position.copy(center).multiplyScalar(-s)
  scene.scale.setScalar(s)
  return { scene, frame }
}

function Model({ url, kind, niche, business, shot, layout, accent }) {
  const gltf = useGLTF(url)
  const { scene, frame } = useMemo(() => analyze(gltf.scene, kind), [gltf, kind])
  return (
    <>
      <primitive object={scene} />
      {frame && SCREEN_PX[kind] && (
        <Screen
          w={frame.w}
          h={frame.h}
          pxW={SCREEN_PX[kind]}
          niche={niche}
          business={business}
          shot={shot}
          layout={layout}
          accent={accent}
          position={frame.position}
          quaternion={frame.quaternion}
        />
      )}
    </>
  )
}

// If a model fails to load or parse, show the built-in device instead of breaking the page.
export class ModelBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    console.warn('[models] could not load a model, using the built-in device.', err)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export default Model
