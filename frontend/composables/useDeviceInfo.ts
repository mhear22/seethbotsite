/**
 * Device Info
 *
 * Shared browser/OS/device-type detection from navigator.userAgent.
 * Used for labelling auth sessions (device name + device type).
 */

/**
 * Detect a human-readable device name (browser + OS).
 */
export const detectDeviceName = (): string => {
  const ua = navigator.userAgent
  let browser = 'Unknown'
  let os = 'Unknown'

  // Browser detection
  if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Safari')) browser = 'Safari'
  else if (ua.includes('Edge')) browser = 'Edge'

  // OS detection
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iOS')) os = 'iOS'

  return `${browser} on ${os}`
}

/**
 * Detect the device type (mobile / tablet / desktop).
 */
export const detectDeviceType = (): string => {
  const ua = navigator.userAgent

  if (/Mobile|Android|iP(hone|od|ad)|BlackBerry|IEMobile|Kindle/.test(ua)) {
    return 'mobile'
  }

  if (/Tablet|iPad/.test(ua)) {
    return 'tablet'
  }

  return 'desktop'
}
