import { Html } from '@react-three/drei'
import SiteMock from './SiteMock'
import { htmlPortal } from './portal'

// drei maps 1 world unit to ~40 CSS px in transform mode.
const PX_PER_UNIT = 40

// Live DOM on a 3D screen. w/h are the world size of the screen,
// pxW is the CSS width the content is laid out at.
// The page is laid out at SS times the size and scaled back down, so the browser
// rasterizes it at higher resolution and text stays crisp on the 3D surface.
const SS = 1.75

export default function Screen({ w, h, pxW: basePx, niche, business, shot, layout, accent, ...props }) {
  const pxW = Math.round(basePx * SS)
  const pxH = Math.round((pxW * h) / w)
  return (
    <group {...props}>
      <Html transform portal={htmlPortal} pointerEvents="none" scale={(w * PX_PER_UNIT) / pxW} zIndexRange={[10, 0]}>
        <div className="screen-dom" style={{ width: pxW, height: pxH }}>
          {shot ? (
            <img className="screen-dom__shot" src={shot} alt="" draggable={false} />
          ) : (
            <SiteMock niche={niche} business={business} layout={layout} accent={accent} />
          )}
          <i className="screen-dom__sheen" />
        </div>
      </Html>
    </group>
  )
}
