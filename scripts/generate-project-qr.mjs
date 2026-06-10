/** 產生專題線上體驗 QR Code */
import { mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import QRCode from 'qrcode'

const DEMO_URL = 'https://lyxiui.github.io/CHEM-IS-TRY/'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'presentations', 'assets')
const outFile = join(outDir, 'chem-is-try-qr.png')

mkdirSync(outDir, { recursive: true })

await QRCode.toFile(outFile, DEMO_URL, {
  width: 360,
  margin: 2,
  color: { dark: '#0f766e', light: '#ffffff' },
})

console.log(`QR Code → ${outFile}`)
console.log(`URL: ${DEMO_URL}`)
