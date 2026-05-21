import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('public/icons', { recursive: true })

const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#0A0A0F"/>
  <circle cx="256" cy="256" r="195" fill="none" stroke="#00D4FF" stroke-width="14" opacity="0.18"/>
  <circle cx="256" cy="256" r="145" fill="none" stroke="#00D4FF" stroke-width="10" opacity="0.28"/>
  <circle cx="256" cy="256" r="95" fill="#00D4FF" opacity="0.18"/>
  <circle cx="256" cy="256" r="55" fill="#00D4FF"/>
</svg>`)

await Promise.all([
  sharp(svg).resize(512, 512).png().toFile('public/icons/icon-512.png'),
  sharp(svg).resize(192, 192).png().toFile('public/icons/icon-192.png'),
  sharp(svg).resize(512, 512).png().toFile('public/icons/icon-maskable-512.png'),
])
console.log('PWA icons generated ✓')
