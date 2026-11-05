// Writes a small test laptop (base + tilted lid + a "Screen" quad) to
// public/models/_test/laptop.glb, to check the GLB slot end to end:
//   node scripts/make-test-glb.cjs   then open the site with ?models=_test
const fs = require('fs')
const path = require('path')

function box(w, h, d) {
  const hw = w / 2, hh = h / 2, hd = d / 2
  const faces = [
    [[0, 0, 1], [[-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd]]],
    [[0, 0, -1], [[hw, -hh, -hd], [-hw, -hh, -hd], [-hw, hh, -hd], [hw, hh, -hd]]],
    [[1, 0, 0], [[hw, -hh, hd], [hw, -hh, -hd], [hw, hh, -hd], [hw, hh, hd]]],
    [[-1, 0, 0], [[-hw, -hh, -hd], [-hw, -hh, hd], [-hw, hh, hd], [-hw, hh, -hd]]],
    [[0, 1, 0], [[-hw, hh, hd], [hw, hh, hd], [hw, hh, -hd], [-hw, hh, -hd]]],
    [[0, -1, 0], [[-hw, -hh, -hd], [hw, -hh, -hd], [hw, -hh, hd], [-hw, -hh, hd]]],
  ]
  const pos = [], nor = [], idx = []
  faces.forEach(([n, corners], f) => {
    corners.forEach((c) => { pos.push(...c); nor.push(...n) })
    const o = f * 4
    idx.push(o, o + 1, o + 2, o, o + 2, o + 3)
  })
  return { pos, nor, idx }
}
function quad(w, h) {
  const hw = w / 2, hh = h / 2
  return {
    pos: [-hw, -hh, 0, hw, -hh, 0, hw, hh, 0, -hw, hh, 0],
    nor: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    idx: [0, 1, 2, 0, 2, 3],
  }
}

const meshes = [
  { name: 'Base', geo: box(3.3, 0.09, 2.25), material: 0 },
  { name: 'LidShell', geo: box(3.3, 2.2, 0.07), material: 0 },
  { name: 'Screen', geo: quad(2.9, 1.8), material: 1 },
]

// pack everything into one binary buffer
const chunks = []
let offset = 0
const bufferViews = []
const accessors = []
function add(data, type, target) {
  const bytes = Buffer.from(type === 'idx' ? new Uint16Array(data).buffer : new Float32Array(data).buffer)
  const pad = (4 - (bytes.length % 4)) % 4
  bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: bytes.length, target })
  chunks.push(bytes, Buffer.alloc(pad))
  offset += bytes.length + pad
  return bufferViews.length - 1
}
const meshDefs = meshes.map((m) => {
  const pv = add(m.geo.pos, 'f', 34962)
  const nv = add(m.geo.nor, 'f', 34962)
  const iv = add(m.geo.idx, 'idx', 34963)
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < m.geo.pos.length; i += 3) for (let k = 0; k < 3; k++) {
    min[k] = Math.min(min[k], m.geo.pos[i + k]); max[k] = Math.max(max[k], m.geo.pos[i + k])
  }
  accessors.push({ bufferView: pv, componentType: 5126, count: m.geo.pos.length / 3, type: 'VEC3', min, max })
  accessors.push({ bufferView: nv, componentType: 5126, count: m.geo.nor.length / 3, type: 'VEC3' })
  accessors.push({ bufferView: iv, componentType: 5123, count: m.geo.idx.length, type: 'SCALAR' })
  const a = accessors.length - 3
  return { name: m.name, primitives: [{ attributes: { POSITION: a, NORMAL: a + 1 }, indices: a + 2, material: m.material }] }
})

const tilt = -0.17 // lid leans back a little, like a real laptop
const gltf = {
  asset: { version: '2.0', generator: 'make-test-glb' },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [
    { name: 'Root', children: [1, 2] },
    { name: 'Base', mesh: 0, translation: [0, 0.045, 1.125] },
    { name: 'LidPivot', translation: [0, 0.09, 0], rotation: [Math.sin(tilt / 2), 0, 0, Math.cos(tilt / 2)], children: [3, 4] },
    { name: 'Lid', mesh: 1, translation: [0, 1.1, 0] },
    { name: 'Screen', mesh: 2, translation: [0, 1.1, 0.0365] },
  ],
  meshes: meshDefs,
  materials: [
    { name: 'Aluminium', pbrMetallicRoughness: { baseColorFactor: [0.78, 0.8, 0.83, 1], metallicFactor: 1, roughnessFactor: 0.32 } },
    { name: 'ScreenBlack', pbrMetallicRoughness: { baseColorFactor: [0.03, 0.03, 0.04, 1], metallicFactor: 0, roughnessFactor: 0.4 } },
  ],
  accessors,
  bufferViews,
  buffers: [{ byteLength: offset }],
}

const bin = Buffer.concat(chunks)
let json = Buffer.from(JSON.stringify(gltf))
json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 0x20)])
const total = 12 + 8 + json.length + 8 + bin.length
const out = Buffer.alloc(total)
let o = 0
out.writeUInt32LE(0x46546c67, o); o += 4
out.writeUInt32LE(2, o); o += 4
out.writeUInt32LE(total, o); o += 4
out.writeUInt32LE(json.length, o); o += 4
out.writeUInt32LE(0x4e4f534a, o); o += 4
json.copy(out, o); o += json.length
out.writeUInt32LE(bin.length, o); o += 4
out.writeUInt32LE(0x004e4942, o); o += 4
bin.copy(out, o)

const file = path.join(__dirname, '..', 'public', 'models', '_test', 'laptop.glb')
fs.mkdirSync(path.dirname(file), { recursive: true })
fs.writeFileSync(file, out)
console.log('wrote', file, out.length, 'bytes')
