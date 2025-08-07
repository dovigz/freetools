import QRCodeStyling, { type Options as QRCodeOptions } from 'qr-code-styling'
import { saveAs } from 'file-saver'
import domtoimage from 'dom-to-image'

// QR Code export utilities
export const downloadQRCode = async (
  qrInstance: QRCodeStyling | null,
  filename: string,
  format: 'png' | 'jpg' | 'svg' = 'png'
) => {
  if (!qrInstance) return

  try {
    if (format === 'svg') {
      const svgString = await qrInstance.getRawData('svg')
      if (svgString) {
        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        saveAs(blob, `${filename}.svg`)
      }
    } else {
      const blob = await qrInstance.getRawData(format)
      if (blob) {
        saveAs(blob, `${filename}.${format}`)
      }
    }
  } catch (error) {
    console.error('Error downloading QR code:', error)
    throw new Error(`Failed to download QR code as ${format.toUpperCase()}`)
  }
}

// Copy QR code to clipboard
export const copyQRToClipboard = async (qrInstance: QRCodeStyling | null) => {
  if (!qrInstance) return false

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const blob = await qrInstance.getRawData('png')
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        return true
      }
    }
    return false
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    return false
  }
}

// QR Code presets
export interface QRPreset {
  id: string
  name: string
  description: string
  options: Partial<QRCodeOptions>
  preview?: string
}

export const qrPresets: QRPreset[] = [
  {
    id: 'default',
    name: 'Classic',
    description: 'Simple black and white QR code',
    options: {
      dotsOptions: {
        color: '#000000',
        type: 'square'
      },
      cornersSquareOptions: {
        color: '#000000',
        type: 'square'
      },
      cornersDotOptions: {
        color: '#000000',
        type: 'square'
      }
    }
  },
  {
    id: 'rounded',
    name: 'Rounded',
    description: 'Smooth rounded corners for modern look',
    options: {
      dotsOptions: {
        color: '#000000',
        type: 'rounded'
      },
      cornersSquareOptions: {
        color: '#000000',
        type: 'extra-rounded'
      },
      cornersDotOptions: {
        color: '#000000',
        type: 'dot'
      }
    }
  },
  {
    id: 'gradient',
    name: 'Purple Gradient',
    description: 'Matches your app theme',
    options: {
      dotsOptions: {
        color: '#667eea',
        type: 'rounded'
      },
      cornersSquareOptions: {
        color: '#764ba2',
        type: 'extra-rounded'
      },
      cornersDotOptions: {
        color: '#667eea',
        type: 'dot'
      }
    }
  },
  {
    id: 'dots',
    name: 'Dots Pattern',
    description: 'Circular dots for unique appearance',
    options: {
      dotsOptions: {
        color: '#000000',
        type: 'dots'
      },
      cornersSquareOptions: {
        color: '#000000',
        type: 'extra-rounded'
      },
      cornersDotOptions: {
        color: '#000000',
        type: 'dot'
      }
    }
  }
]

// Data type detection and formatting
export const detectDataType = (data: string): 'url' | 'email' | 'phone' | 'wifi' | 'text' => {
  if (data.startsWith('http://') || data.startsWith('https://')) return 'url'
  if (data.includes('@') && data.includes('.')) return 'email'
  if (data.match(/^[\+]?[\d\s\-\(\)]+$/)) return 'phone'
  if (data.startsWith('WIFI:')) return 'wifi'
  return 'text'
}

// WiFi QR code generator
export const generateWiFiQR = (ssid: string, password: string, security: 'WPA' | 'WEP' | 'nopass' = 'WPA') => {
  return `WIFI:T:${security};S:${ssid};P:${password};;`
}

// vCard QR code generator
export const generateVCardQR = (contact: {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  organization?: string
  url?: string
}) => {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0']
  
  const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
  if (fullName) {
    lines.push(`FN:${fullName}`)
    lines.push(`N:${contact.lastName || ''};${contact.firstName || ''};;;`)
  }
  if (contact.organization) lines.push(`ORG:${contact.organization}`)
  if (contact.email) lines.push(`EMAIL:${contact.email}`)
  if (contact.phone) lines.push(`TEL:${contact.phone}`)
  if (contact.url) lines.push(`URL:${contact.url}`)
  
  lines.push('END:VCARD')
  return lines.join('\r\n')
}

// Generate random colors for QR code
export const generateRandomColor = (): string => {
  const colors = [
    '#667eea', '#764ba2', '#ff6b6b', '#4ecdc4',
    '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3',
    '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
    '#ee5a24', '#009432', '#0652DD', '#9980FA',
    '#833471', '#EA2027', '#006BA6', '#0652DD'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Generate random shape options
export const generateRandomShapes = () => {
  const dotTypes = ['dots', 'rounded', 'classy', 'classy-rounded', 'square', 'extra-rounded']
  const cornerSquareTypes = ['dot', 'square', 'extra-rounded']
  const cornerDotTypes = ['dot', 'square']
  
  return {
    dotsType: dotTypes[Math.floor(Math.random() * dotTypes.length)],
    cornersSquareType: cornerSquareTypes[Math.floor(Math.random() * cornerSquareTypes.length)],
    cornersDotType: cornerDotTypes[Math.floor(Math.random() * cornerDotTypes.length)]
  }
}