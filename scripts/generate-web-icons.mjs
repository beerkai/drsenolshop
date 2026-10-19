/**
 * Mağaza logosundan favicon / PWA ikonları üretir.
 * Kaynak: public/brand/logo-icon-source.png
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const SOURCE = path.join(ROOT, 'public/brand/logo-icon-source.png')
const BONE = '#F4F0E8'

async function pngBuffer(size, { creamFrame = false } = {}) {
  const logo = sharp(SOURCE).resize(size, size, { fit: 'contain', background: creamFrame ? BONE : { r: 0, g: 0, b: 0, alpha: 0 } })
  if (!creamFrame) {
    return logo.png().toBuffer()
  }
  const inset = Math.round(size * 0.08)
  const inner = size - inset * 2
  const logoBuf = await sharp(SOURCE)
    .resize(inner, inner, { fit: 'contain', background: BONE })
    .png()
    .toBuffer()
  return sharp({
    create: { width: size, height: size, channels: 3, background: BONE },
  })
    .composite([{ input: logoBuf, gravity: 'centre' }])
    .png()
    .toBuffer()
}

async function writeSvgFromPng(pngBuf, outPath) {
  const b64 = pngBuf.toString('base64')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512">
  <image width="512" height="512" href="data:image/png;base64,${b64}"/>
</svg>`
  await fs.writeFile(outPath, svg, 'utf8')
}

async function main() {
  const icon512 = await pngBuffer(512)
  const icon512Cream = await pngBuffer(512, { creamFrame: true })
  const apple180 = await pngBuffer(180, { creamFrame: true })
  const favicon32 = await pngBuffer(32)

  await fs.mkdir(path.join(ROOT, 'src/app'), { recursive: true })

  await fs.writeFile(path.join(ROOT, 'src/app/icon.png'), icon512Cream)
  await fs.writeFile(path.join(ROOT, 'src/app/apple-icon.png'), apple180)
  await fs.writeFile(path.join(ROOT, 'public/favicon-32.png'), favicon32)
  await writeSvgFromPng(icon512, path.join(ROOT, 'public/icon.svg'))
  await fs.writeFile(path.join(ROOT, 'src/app/favicon.ico'), await icoFromPngs([
    { size: 16, buf: await pngBuffer(16, { creamFrame: true }) },
    { size: 32, buf: await pngBuffer(32, { creamFrame: true }) },
    { size: 48, buf: await pngBuffer(48, { creamFrame: true }) },
  ]))

  console.log('[generate-web-icons] Tamam: app/favicon.ico, app/icon.png, app/apple-icon.png, public/icon.svg, public/favicon-32.png')
}

function icoFromPngs(pngs) {
  const count = pngs.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(count, 4)
  const entries = Buffer.alloc(16 * count)
  let offset = 6 + 16 * count
  for (let i = 0; i < pngs.length; i++) {
    const png = pngs[i]
    const at = 16 * i
    const dim = png.size >= 256 ? 0 : png.size
    entries.writeUInt8(dim, at)
    entries.writeUInt8(dim, at + 1)
    entries.writeUInt8(0, at + 2)
    entries.writeUInt8(0, at + 3)
    entries.writeUInt16LE(1, at + 4)
    entries.writeUInt16LE(32, at + 6)
    entries.writeUInt32LE(png.buf.length, at + 8)
    entries.writeUInt32LE(offset, at + 12)
    offset += png.buf.length
  }
  return Buffer.concat([header, entries, ...pngs.map((png) => png.buf)])
}

main().catch((err) => {
  console.error('[generate-web-icons] hata:', err)
  process.exit(1)
})
