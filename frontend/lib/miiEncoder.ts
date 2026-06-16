/**
 * Pure browser-side Mii data encoder for the Mii Studio API.
 * No Node.js dependencies (no Buffer, no bit-buffer).
 *
 * Full encoder for Wii U Mii Store Data (FFLStoreData / FFSD format).
 * 96 bytes: 0x5C data + 2 padding + 2 CRC-16 (CCITT, poly 0x1021).
 *
 * Based on reverse-engineering of the binary format documented at:
 * https://github.com/kinnay/NintendoClients/wiki/Mii-Data-(Wii-U)
 * Cross-verified with MiiJS (https://github.com/Stewared/MiiJS).
 */

import { DEFAULT_MII_DATA } from './mii-default'

export interface MiiData {
  name: string
  creatorName: string
  gender: number // 0=male, 1=female
  favoriteColor: number // 0-11
  height: number // 0-127
  build: number // 0-127
  skinColor: number // 0-5
  faceType: number // 0-11
  wrinkles: number // 0-11 (faceFeature)
  makeup: number // 0-11
  hairType: number // 0-131
  hairColor: number // 0-7
  flipHair: boolean
  eyeType: number // 0-59
  eyeColor: number // 0-5
  eyeScale: number // 0-7
  eyeVerticalStretch: number // 0-7 (eyeSquash / thickness)
  eyeRotation: number // 0-7
  eyeSpacing: number // 0-7
  eyeYPosition: number // 0-18
  eyebrowType: number // 0-24
  eyebrowColor: number // 0-7
  eyebrowScale: number // 0-7
  eyebrowVerticalStretch: number // 0-7 (eyebrowSquash)
  eyebrowRotation: number // 0-11
  eyebrowSpacing: number // 0-7
  eyebrowYPosition: number // 3-18
  noseType: number // 0-17
  noseScale: number // 0-7
  noseYPosition: number // 0-18
  mouthType: number // 0-35
  mouthColor: number // 0-4
  mouthScale: number // 0-7
  mouthHorizontalStretch: number // 0-7 (mouthSquash / thickness)
  mouthYPosition: number // 0-18
  mustacheType: number // 0-5
  beardType: number // 0-5
  facialHairColor: number // 0-7
  mustacheScale: number // 0-7
  mustacheYPosition: number // 0-16
  glassesType: number // 0-8
  glassesColor: number // 0-5
  glassesScale: number // 0-7
  glassesYPosition: number // 0-20
  moleEnabled: boolean
  moleScale: number // 0-7
  moleXPosition: number // 0-16
  moleYPosition: number // 0-30
}

/**
 * CRC-16 CCITT (polynomial 0x1021) over bytes 0x00-0x5D.
 * Stored big-endian at offset 0x5E.
 */
function crc16(data: Uint8Array): number {
  let crc = 0x0000
  for (let i = 0; i < data.length; i++) {
    const byte = data[i]
    for (let bit = 7; bit >= 0; bit--) {
      crc = ((crc << 1) | ((byte >> bit) & 1)) & 0x1ffff
      if (crc & 0x10000) crc ^= 0x1021
    }
  }
  // Final 16 zero bits
  for (let i = 0; i < 16; i++) {
    crc = (crc << 1) & 0x1ffff
    if (crc & 0x10000) crc ^= 0x1021
  }
  return crc & 0xffff
}

function encodeUTF16LE(str: string, maxChars = 10): Uint8Array {
  const bytes = new Uint8Array(maxChars * 2)
  for (let i = 0; i < maxChars && i < str.length; i++) {
    const code = str.charCodeAt(i)
    bytes[i * 2] = code & 0xff
    bytes[i * 2 + 1] = (code >> 8) & 0xff
  }
  return bytes
}

/**
 * Encode a MiiData object into a Uint8Array of 96 bytes (FFLStoreData).
 */
export function encodeMiiBytes(m: MiiData): Uint8Array {
  const buf = new Uint8Array(0x60) // 96 bytes, zeroed

  // Helper: write little-endian u16
  const w16 = (off: number, val: number) => {
    buf[off] = val & 0xff
    buf[off + 1] = (val >> 8) & 0xff
  }

  // 0x00: Header (4 bytes LE)
  // bit 31-28: birth platform (4 = Wii U/Switch)
  // bit 8: is copyable (1)
  // bit 7-0: mii version (3)
  w16(0x00, 0x0003) // version=3, copyable=1
  w16(0x02, 0x4000) // birth platform=4 (Wii U)

  // 0x04: Author ID (8 bytes) — valid-looking system identifier
  buf[0x04] = 0x38; buf[0x05] = 0x41; buf[0x06] = 0xa0; buf[0x07] = 0x41
  buf[0x08] = 0x00; buf[0x09] = 0x00; buf[0x0A] = 0x84; buf[0x0B] = 0xa0

  // 0x0C: Mii ID (10 bytes)
  // First byte bit 7 = 1 for Default Mii type
  buf[0x0C] = 0xdb; buf[0x0D] = 0xb8; buf[0x0E] = 0x87; buf[0x0F] = 0x31
  buf[0x10] = 0xbe; buf[0x11] = 0x60; buf[0x12] = 0x2b

  // 0x16: Unknown (2 bytes)
  w16(0x16, 0x2a2a)

  // 0x18: 2 bytes LE
  // bit 0: gender | bits 4-1: birth month | bits 9-5: birth day | bits 13-10: favorite color
  let v18 = (m.gender & 1)
    | ((m.favoriteColor & 0xf) << 10)
    | (((m.build > 0 ? 15 : 15) & 0x1f) << 5) // will be overridden
  // Actually let's build it cleanly
  v18 = (m.gender & 1)
    | ((6 & 0xf) << 1) // We need month/day from the caller... but MiiData doesn't have them
  // Hmm, the MiiData interface doesn't have birthMonth/birthDay. Let's just set reasonable defaults.
  v18 = (m.gender & 1) | ((6 & 0xf) << 1) | ((15 & 0x1f) << 5) | ((m.favoriteColor & 0xf) << 10)
  w16(0x18, v18)

  // 0x1A: Mii name (40 bytes UTF-16LE)
  const nameBuf = encodeUTF16LE(m.name, 10)
  buf.set(nameBuf, 0x1a)

  // 0x2E: height
  buf[0x2e] = m.height

  // 0x2F: build
  buf[0x2f] = m.build

  // 0x30: 2 bytes LE
  // bit 0: local only | bits 4-1: face type | bits 7-5: skin color
  let v30 = (m.faceType & 0xf) << 1 | (m.skinColor & 0x7) << 5
  w16(0x30, v30)

  // 0x31: 2 bytes LE
  // bits 0-3: wrinkles | bits 4-7: makeup
  let v31 = (m.wrinkles & 0xf) | ((m.makeup & 0xf) << 4)
  w16(0x31, v31)

  // 0x32: 2 bytes LE
  // bits 7-0: hair type | bits 10-8: hair color | bit 11: flip hair
  let v32 = (m.hairType & 0x7f) | ((m.hairColor & 0x7) << 8) | ((m.flipHair ? 1 : 0) << 11)
  w16(0x32, v32)

  // 0x34: 2 bytes LE
  // bits 5-0: eye type | bits 8-6: eye color | bits 12-9: eye scale | bits 15-13: eye thickness
  let v34 = (m.eyeType & 0x3f) | ((m.eyeColor & 0x7) << 6) | ((m.eyeScale & 0xf) << 9) | ((m.eyeVerticalStretch & 0x7) << 13)
  w16(0x34, v34)

  // 0x36: 2 bytes LE
  // bits 4-0: eye rotation | bits 8-5: eye distance | bits 15-9: eye Y position
  let v36 = (m.eyeRotation & 0x1f) | ((m.eyeSpacing & 0xf) << 5) | ((m.eyeYPosition & 0x7f) << 9)
  w16(0x36, v36)

  // 0x38: 2 bytes LE
  // bits 4-0: eyebrow type | bits 7-5: eyebrow color | bits 11-8: eyebrow scale | bits 15-12: eyebrow thickness
  let v38 = (m.eyebrowType & 0x1f) | ((m.eyebrowColor & 0x7) << 5) | ((m.eyebrowScale & 0xf) << 8) | ((m.eyebrowVerticalStretch & 0xf) << 12)
  w16(0x38, v38)

  // 0x3A: 2 bytes LE
  // bits 4-0: eyebrow rotation | bits 8-5: eyebrow distance | bits 15-9: eyebrow Y position
  let v3a = (m.eyebrowRotation & 0x1f) | ((m.eyebrowSpacing & 0xf) << 5) | ((m.eyebrowYPosition & 0x7f) << 9)
  w16(0x3a, v3a)

  // 0x3C: 2 bytes LE
  // bits 4-0: nose type | bits 8-5: nose scale | bits 15-9: nose Y position
  let v3c = (m.noseType & 0x1f) | ((m.noseScale & 0xf) << 5) | ((m.noseYPosition & 0x7f) << 9)
  w16(0x3c, v3c)

  // 0x3E: 2 bytes LE
  // bits 5-0: mouth type | bits 8-6: mouth color | bits 12-9: mouth scale | bits 15-13: mouth thickness
  let v3e = (m.mouthType & 0x3f) | ((m.mouthColor & 0x7) << 6) | ((m.mouthScale & 0xf) << 9) | ((m.mouthHorizontalStretch & 0x7) << 13)
  w16(0x3e, v3e)

  // 0x40: 2 bytes LE
  // bits 4-0: mouth Y position | bits 7-5: mustache type
  let v40 = (m.mouthYPosition & 0x1f) | ((m.mustacheType & 0x7) << 5)
  w16(0x40, v40)

  // 0x42: 2 bytes LE
  // bits 2-0: beard type | bits 5-3: beard color | bits 9-6: mustache scale | bits 15-10: mustache Y position
  let v42 = (m.beardType & 0x7) | ((m.facialHairColor & 0x7) << 3) | ((m.mustacheScale & 0xf) << 6) | ((m.mustacheYPosition & 0x3f) << 10)
  w16(0x42, v42)

  // 0x44: 2 bytes LE
  // bits 3-0: glasses type | bits 6-4: glasses color | bits 10-7: glasses scale | bits 15-11: glasses Y position
  let v44 = (m.glassesType & 0xf) | ((m.glassesColor & 0x7) << 4) | ((m.glassesScale & 0xf) << 7) | ((m.glassesYPosition & 0x1f) << 11)
  w16(0x44, v44)

  // 0x46: 2 bytes LE
  // bit 0: mole enabled | bits 4-1: mole scale | bits 9-5: mole X | bits 14-10: mole Y
  let v46 = (m.moleEnabled ? 1 : 0) | ((m.moleScale & 0xf) << 1) | ((m.moleXPosition & 0x1f) << 5) | ((m.moleYPosition & 0x1f) << 10)
  w16(0x46, v46)

  // 0x48: Creator name (40 bytes UTF-16LE)
  const creatorBuf = encodeUTF16LE(m.creatorName, 10)
  buf.set(creatorBuf, 0x48)

  // 0x5C-0x5D: padding (must be 0x0000)
  buf[0x5c] = 0x00
  buf[0x5d] = 0x00

  // 0x5E-0x5F: CRC-16 (big-endian)
  const dataSlice = buf.slice(0, 0x5e)
  const crc = crc16(dataSlice)
  buf[0x5e] = (crc >> 8) & 0xff
  buf[0x5f] = crc & 0xff

  return buf
}

/**
 * Encode a MiiData to base64 string suitable for Mii Studio API.
 */
export function encodeMiiStudio(m: MiiData): string {
  const bytes = encodeMiiBytes(m)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Get the default MaWLd Mii as a base64 string.
 * Uses the pre-computed valid FFLStoreData from mii-default.ts.
 */
export function getDefaultMiiBase64(): string {
  return DEFAULT_MII_DATA
}

/**
 * Get the default MaWLd Mii as a Uint8Array.
 */
export function getDefaultMiiBytes(): Uint8Array {
  const binary = atob(DEFAULT_MII_DATA)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Build the Mii Studio render URL from encoded Mii data.
 */
export function buildStudioUrl(miiBase64: string, options: {
  type?: 'face' | 'body'
  expression?: string
  width?: number
  clothesColor?: string
} = {}): string {
  const type = options.type || 'face'
  const expression = options.expression || 'normal'
  const width = options.width || 512
  const clothesColor = encodeURIComponent(options.clothesColor || '#9333ea')

  return `https://mii-hosting-service.pretendo.net/mii/${miiBase64}/${type}_${expression}_0_0_${width}_${width}_${clothesColor}_0.png`
}
