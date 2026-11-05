# 3D models (the GLB slot)

Drop a file here and that device switches to it automatically. Anything missing keeps the
built-in procedural device. No code changes, no config.

| File | Device | Station |
|---|---|---|
| `laptop.glb` | laptop | Home |
| `phone.glb` | phone | Pocket Ledger |
| `tablet.glb` | tablet | Kiln & Crumb |
| `display.glb` | desktop display | Pulse Fitness |
| `slab.glb` | glass slab | Live demo |
| `monolith.glb` | acrylic monolith | Contact |

## The contract

1. **A mesh named `Screen`.** A flat quad (or any flat mesh) where the live website should
   appear. Its position, size and orientation are read from the geometry, so you never
   size or place the screen by hand. Works for tilted screens (an open laptop lid).
2. **The `Screen` normal must face the viewer.** If the site shows up mirrored or not at
   all, flip the normals in Blender.
3. **Any scale, any origin.** The model is auto-fitted to the stage width of the
   built-in device and centred, so it will sit in the same place.
4. **Face the camera down +Z** (Blender: front view, Y-forward export defaults are fine).
5. **PBR materials are kept as authored.** Lighting comes from the scene's studio lights.
   Draco compression is supported.
6. `monolith.glb` does not need a `Screen` (it has no live site).

For a reasonable download keep each model under ~2 MB and textures at 2K or less.

## Trying variants

Open the site with `?models=<folder>` to load from `public/models/<folder>/` instead,
for example `?models=v2`. `_test/laptop.glb` is a throwaway test model made by
`node scripts/make-test-glb.cjs`; delete the `_test` folder when you no longer need it.

## Not built yet

Animating parts (opening a laptop lid, a swivelling display) is not supported yet.
