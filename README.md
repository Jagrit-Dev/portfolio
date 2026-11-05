# Jagrit Mondal portfolio: The Atelier (3D prototype)

React + Three.js (react-three-fiber). No backend.

```bash
npm install
npm run dev -- --port 5174
npm run build
```

- `src/data.js`: profile, projects, niches, outreach `prospects`
- `src/stations.js`: the order of stations in the scene
- `src/Devices.jsx`: the 3D laptop, phone, tablet, display, slab and monolith
- Personalized links: `/for/<slug>` (add the slug to `prospects`)
- Terminal: press `/`

The three.js scene is lazy-loaded; the shell is ~88 kB gzipped.
