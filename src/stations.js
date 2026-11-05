// Stage direction for each station.
//   size  apparent scale of the device (tuned so they feel like one family)
//   lift  height of the device centre, so it lines up with the copy
//   off   how far the device sits from the station centre (copy is on the other side)
//   props glass and metal pieces placed just outside the device's far edge:
//         gap = clearance from the device edge, y/z = height and depth, s = scale
export const STATIONS = [
  {
    key: 'home', label: 'Home', kind: 'laptop', project: 'clientgate',
    size: 1.34, lift: 0.15, off: 1.9,
    props: [
      { t: 'orb', gap: 0.7, y: 2.6, z: -5, s: 0.65 },
      { t: 'ring', gap: 0.7, y: -1.9, z: -3.4, s: 0.45 },
    ],
  },
  {
    key: 'pocket-ledger', label: 'Pocket Ledger', kind: 'phone', project: 'pocket-ledger',
    size: 1.32, lift: 0.45, off: 2.5,
    props: [
      { t: 'ring', gap: 1.0, y: 2.0, z: -4.2, s: 0.8 },
      { t: 'pill', gap: 1.6, y: -1.3, z: -3.6, s: 0.6 },
    ],
  },
  {
    key: 'velluto', label: 'Velluto', kind: 'tablet', project: 'velluto',
    size: 1.42, lift: 0.5, off: 2.5,
    props: [
      { t: 'orb', gap: 0.9, y: 2.8, z: -5, s: 0.7 },
      { t: 'pill', gap: 1.1, y: -1.9, z: -3.6, s: 0.5 },
    ],
  },
  {
    key: 'forma', label: 'FORMA', kind: 'display', project: 'forma',
    size: 1.0, lift: 0.15, off: 2.5,
    props: [
      { t: 'ring', gap: 0.8, y: 2.2, z: -5, s: 0.9 },
      { t: 'orb', gap: 1.0, y: -1.5, z: -3.8, s: 0.45 },
    ],
  },
  {
    key: 'demo', label: 'Live demo', kind: 'slab',
    size: 1.05, lift: 0.4, off: 2.5,
    props: [
      { t: 'orb', gap: 0.5, y: 2.2, z: -5, s: 0.75 },
      { t: 'ring', gap: 1.0, y: -1.5, z: -3.6, s: 0.5 },
    ],
  },
  {
    key: 'contact', label: 'Contact', kind: 'monolith',
    size: 1.0, lift: 0.15, off: 2.5,
    props: [
      { t: 'ring', gap: 1.5, y: 2.1, z: -4.5, s: 0.7 },
      { t: 'orb', gap: 2.2, y: -1.4, z: -3.6, s: 0.45 },
    ],
  },
]
