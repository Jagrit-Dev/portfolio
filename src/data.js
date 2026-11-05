// Everything you will edit lives here. Swap placeholders for real work.

export const profile = {
  name: 'Jagrit Mondal',
  role: 'Web design and development',
  email: 'hello@example.com', // TODO: your real email
  booking: 'https://cal.com/your-handle', // TODO: your booking link
  // TODO: your real profile links
  socials: {
    linkedin: 'https://www.linkedin.com/in/your-handle',
    github: 'https://github.com/your-handle',
    x: 'https://x.com/your-handle',
    instagram: 'https://www.instagram.com/your-handle',
    youtube: 'https://www.youtube.com/@your-handle',
  },
}

// kind picks the device: laptop | phone | tablet | display
// mock = built-in live preview. Set `url` + `embed: true` to show the real site instead.
export const projects = [
  {
    id: 'clientgate',
    name: 'ClientGate',
    kind: 'laptop',
    type: 'SaaS product',
    blurb: 'Client intake and qualification for agencies. Every inquiry is scored against your ideal client profile, by form or by Eli, the voice agent, so only good fits reach your inbox.',
    stack: ['Next.js', 'InsForge', 'OpenAI', 'Vercel'],
    url: 'https://clientgate.io',
    embed: false, // clientgate.io sends X-Frame-Options: SAMEORIGIN
    mock: { niche: 'portal', business: 'ClientGate', shot: '/shots/clientgate.webp' },
  },
  {
    id: 'pocket-ledger',
    name: 'Pocket Ledger',
    kind: 'phone',
    type: 'SaaS product',
    blurb: 'Bookkeeping for freelancers, built around one screen and zero jargon.', // TODO
    stack: ['React', 'Node', 'Razorpay'],
    url: null,
    embed: false,
    mock: { niche: 'ledger', business: 'Pocket Ledger' },
  },
  {
    id: 'velluto',
    name: 'Velluto',
    kind: 'tablet',
    type: 'Concept website',
    blurb: 'A specialty coffee atelier, told as a short film: a 3D-rendered pour plays as you scroll, with an original soundtrack.',
    stack: ['Remotion', 'Three.js', 'React', 'Cloudflare'],
    url: 'https://velluto-cafe-demo.jagritmondal-csbs.workers.dev',
    embed: true,
    mock: { niche: 'cafe', business: 'Velluto', shot: '/shots/velluto.webp' },
  },
  {
    id: 'forma',
    name: 'FORMA',
    kind: 'display',
    type: 'Concept website',
    blurb: 'A human performance lab where members are scanned, measured and programmed. A 42,000-point body scan anchors the page, and the numbers come alive as you scroll.',
    stack: ['Three.js', 'React', 'GSAP', 'Cloudflare'],
    url: 'https://forma-fitness-demo.jagritmondal-csbs.workers.dev',
    embed: true,
    mock: { niche: 'gym', business: 'FORMA', shot: '/shots/forma.webp' },
  },
]

// Niches used by the live demo and by the personalized /for/<slug> links.
// layout: split | center | stack. seed feeds the placeholder photo.
export const niches = {
  bakery: {
    label: 'Bakery',
    brand: 'Sunrise Bakery',
    layout: 'split',
    font: 'Georgia, "Times New Roman", serif',
    seed: 'bakery-bread-counter',
    palette: { bg: '#FFF3E0', ink: '#3B2314', accent: '#C2531A', soft: '#FBD9A8' },
    headline: 'Warm bread, baked before you wake.',
    sub: 'Sourdough, pastries and custom cakes from our oven to your table every morning.',
    cta: 'Pre-order today',
    links: ['Menu', 'Cakes', 'Visit'],
    services: [
      ['Daily loaves', 'Sourdough and rye, out of the oven by seven.'],
      ['Custom cakes', 'Order online, pick up fresh on the day.'],
      ['Morning boxes', 'A box of pastries for the whole office.'],
    ],
  },
  dental: {
    label: 'Dental clinic',
    brand: 'Brightside Dental',
    layout: 'center',
    font: '"Geist Variable", system-ui, sans-serif',
    seed: 'dental-clinic-smile',
    palette: { bg: '#EAF6F8', ink: '#12343B', accent: '#0B7285', soft: '#BFE5EA' },
    headline: 'A dentist visit you will not dread.',
    sub: 'Gentle check-ups, whitening and braces, with online booking in under a minute.',
    cta: 'Book a visit',
    links: ['Treatments', 'Team', 'Contact'],
    services: [
      ['Check-ups', 'Calm, thorough and never rushed.'],
      ['Whitening', 'Visible results in a single sitting.'],
      ['Braces', 'Clear aligners with a monthly plan.'],
    ],
  },
  gym: {
    label: 'Gym',
    brand: 'Pulse Fitness',
    layout: 'stack',
    font: '"Bricolage Grotesque Variable", system-ui, sans-serif',
    seed: 'gym-weights-training',
    palette: { bg: '#FFF7B8', ink: '#1F1F1F', accent: '#D6361F', soft: '#FFE45C' },
    headline: 'Train hard. Leave happy.',
    sub: 'Strength classes, open floor and coaches who learn your name. First week is free.',
    cta: 'Claim free week',
    links: ['Classes', 'Coaches', 'Join'],
    services: [
      ['Strength lab', 'Small groups, real coaching.'],
      ['Open floor', 'Racks, platforms and quiet corners.'],
      ['Recovery', 'Sauna and mobility sessions.'],
    ],
  },
  law: {
    label: 'Law firm',
    brand: 'Hale & Moreau',
    layout: 'split',
    font: 'Georgia, "Times New Roman", serif',
    seed: 'law-office-desk',
    palette: { bg: '#F1EFEA', ink: '#1C2B3A', accent: '#8A5A12', soft: '#D9D2C3' },
    headline: 'Clear advice when it matters most.',
    sub: 'Business, property and family law explained in plain language, with fixed fees.',
    cta: 'Request a consultation',
    links: ['Practice', 'People', 'Contact'],
    services: [
      ['Business law', 'Contracts, disputes and compliance.'],
      ['Property', 'Purchases, leases and title checks.'],
      ['Family', 'Careful guidance through hard changes.'],
    ],
  },
  plumber: {
    label: 'Plumber',
    brand: 'Bluepipe Plumbing',
    layout: 'stack',
    font: '"Bricolage Grotesque Variable", system-ui, sans-serif',
    seed: 'plumber-van-tools',
    palette: { bg: '#E3F0FF', ink: '#0E2A47', accent: '#1260CC', soft: '#B7D6FF' },
    headline: 'Leak at midnight? We answer.',
    sub: 'Emergency call-outs, boilers and bathrooms across the city, with upfront pricing.',
    cta: 'Call for a quote',
    links: ['Services', 'Areas', 'Reviews'],
    services: [
      ['Emergency', 'On site within the hour.'],
      ['Boilers', 'Install, service and repair.'],
      ['Bathrooms', 'Design and fit, start to finish.'],
    ],
  },
  cafe: {
    label: 'Cafe',
    brand: 'Little Orbit Coffee',
    layout: 'center',
    font: '"Bricolage Grotesque Variable", system-ui, sans-serif',
    seed: 'cafe-coffee-latte',
    palette: { bg: '#F3E8FF', ink: '#2A1B3D', accent: '#B0431F', soft: '#E4CCFF' },
    headline: 'Coffee worth a detour.',
    sub: 'Small-batch roasts, slow mornings and a pastry case that does not hold back.',
    cta: 'See the menu',
    links: ['Menu', 'Beans', 'Find us'],
    services: [
      ['House roast', 'Chocolate, orange peel, a long finish.'],
      ['Brunch', 'Served until three on weekends.'],
      ['Beans to go', 'Fresh bags, shipped or collected.'],
    ],
  },
  // used only for the project windows, not offered in the demo chips
  portal: {
    hidden: true,
    label: 'Client portal',
    brand: 'ClientGate',
    layout: 'split',
    font: '"Geist Variable", system-ui, sans-serif',
    seed: 'portal-workspace-laptop',
    palette: { bg: '#EEF1FF', ink: '#17203A', accent: '#2F4BD8', soft: '#CBD3FF' },
    headline: 'One front door for every client.',
    sub: 'Files, approvals and invoices in a portal your clients actually use.',
    cta: 'Start free',
    links: ['Product', 'Pricing', 'Sign in'],
    services: [
      ['Shared files', 'Drop it once, everyone sees it.'],
      ['Approvals', 'Sign-off in a click, with history.'],
      ['Invoices', 'Paid faster, chased automatically.'],
    ],
  },
  ledger: {
    hidden: true,
    label: 'Bookkeeping app',
    brand: 'Pocket Ledger',
    layout: 'center',
    font: '"Geist Variable", system-ui, sans-serif',
    seed: 'ledger-notebook-desk',
    palette: { bg: '#E9F7EC', ink: '#10301C', accent: '#1F7A3E', soft: '#BDE8C8' },
    headline: 'Bookkeeping in one calm screen.',
    sub: 'Log income, snap receipts and see what you owe before tax time does.',
    cta: 'Try it free',
    links: ['Features', 'Pricing', 'Log in'],
    services: [
      ['Receipts', 'Snap, sorted and filed.'],
      ['Invoices', 'Send in seconds, track every one.'],
      ['Tax view', 'Always know what to set aside.'],
    ],
  },
}

export const demoNiches = Object.entries(niches)
  .filter(([, n]) => !n.hidden)
  .map(([key, n]) => ({ key, label: n.label }))

// Personalized outreach links: yoursite.com/for/<slug>  (or ?for=<slug>)
// Add one line per prospect before you call them.
export const prospects = {
  'sunrise-bakery': { niche: 'bakery', business: 'Sunrise Bakery' },
  'brightside-dental': { niche: 'dental', business: 'Brightside Dental' },
  'ironworks-gym': { niche: 'gym', business: 'Ironworks Gym' },
}

export const LAYOUTS = [
  { key: 'split', label: 'Split' },
  { key: 'center', label: 'Centered' },
  { key: 'stack', label: 'Bold' },
]
// Accent colours offered in the demo. All are dark enough for white button text.
export const ACCENTS = ['#C2531A', '#0B7285', '#2F4BD8', '#1F7A3E', '#B3261E', '#1F2937']

// Two ways in: a saved prospect (/for/<slug>), or a shareable demo link built by the
// demo station: /?demo=<niche>&name=<business>&layout=<key>&accent=<hex without #>
export function findProspect() {
  const params = new URLSearchParams(window.location.search)
  const fromPath = window.location.pathname.match(/^\/for\/([^/]+)/)?.[1]
  const slug = fromPath || params.get('for')
  if (slug) return prospects[slug.toLowerCase()] || null

  const demo = params.get('demo')
  if (demo && niches[demo] && !niches[demo].hidden) {
    const layout = params.get('layout')
    const accent = params.get('accent')
    return {
      niche: demo,
      business: (params.get('name') || '').slice(0, 36),
      layout: LAYOUTS.some((l) => l.key === layout) ? layout : null,
      accent: /^[0-9a-f]{6}$/i.test(accent || '') ? '#' + accent : null,
    }
  }
  return null
}
