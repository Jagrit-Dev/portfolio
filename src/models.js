// The GLB slot. Drop a model at public/models/<kind>.glb and that device uses it
// instead of the built-in procedural version. See public/models/README.md for the
// contract (a mesh named "Screen", normal facing the viewer).
//
// For comparing variants without touching the defaults, open the site with
// ?models=<folder> and models load from public/models/<folder>/ instead.

export const KINDS = ['laptop', 'phone', 'tablet', 'display', 'slab', 'monolith']

// Target width of each device in scene units (matches the procedural versions),
// so a model of any size is scaled to sit on the stage like the originals.
export const NOMINAL = { laptop: 3.3, phone: 1.32, tablet: 3.1, display: 4.3, slab: 4.5, monolith: 2.4 }

// CSS width the live site is laid out at on each device's screen.
export const SCREEN_PX = { laptop: 1000, phone: 390, tablet: 900, display: 1150, slab: 1150 }

const folder = typeof window === 'undefined' ? '' : (new URLSearchParams(window.location.search).get('models') || '').replace(/[^\w-]/g, '')
export const modelUrl = (kind) => `/models/${folder ? folder + '/' : ''}${kind}.glb`

// Which models actually exist. A missing file on a single-page-app host comes back
// as index.html, so a response that is HTML (or an error) means "no model".
export async function probeModels() {
  const found = {}
  await Promise.all(
    KINDS.map(async (kind) => {
      try {
        const res = await fetch(modelUrl(kind))
        const ok = res.ok && !/text\/html/i.test(res.headers.get('content-type') || '')
        res.body?.cancel?.()
        found[kind] = ok ? modelUrl(kind) : null
      } catch {
        found[kind] = null
      }
    }),
  )
  return found
}
