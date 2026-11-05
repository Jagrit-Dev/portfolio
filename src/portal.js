// Mount point for the live DOM on the 3D screens. Created outside React so
// React never reconciles its children.
let layer = null
export const htmlPortal = {
  get current() {
    if (!layer && typeof document !== 'undefined') {
      layer = document.createElement('div')
      layer.className = 'html-layer'
      document.body.appendChild(layer)
    }
    return layer
  },
}
