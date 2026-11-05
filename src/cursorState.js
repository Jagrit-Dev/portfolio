// Shared, non-reactive cursor state. Devices write it, the cursor reads it every
// frame, so hovering never triggers a React render.
export const cursor = { label: null, pressed: false }
