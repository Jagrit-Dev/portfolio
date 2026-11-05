import { GithubLogo, InstagramLogo, LinkedinLogo, XLogo, YoutubeLogo } from '@phosphor-icons/react'
import { profile } from './data'

// Brand colours keep the icons readable on the pale stage. GitHub and X are
// near-black by design.
export const SOCIALS = [
  { key: 'linkedin', label: 'LinkedIn', href: profile.socials.linkedin, Icon: LinkedinLogo, color: '#0A66C2' },
  { key: 'github', label: 'GitHub', href: profile.socials.github, Icon: GithubLogo, color: '#24292F' },
  { key: 'x', label: 'X', href: profile.socials.x, Icon: XLogo, color: '#111418' },
  { key: 'instagram', label: 'Instagram', href: profile.socials.instagram, Icon: InstagramLogo, color: '#E1306C' },
  { key: 'youtube', label: 'YouTube', href: profile.socials.youtube, Icon: YoutubeLogo, color: '#E5231B' },
]
