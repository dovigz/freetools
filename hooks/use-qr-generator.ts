import { useState, useCallback, useRef } from 'react'
import QRCodeStyling, { type Options as QRCodeOptions, type ErrorCorrectionLevel, type DotType, type CornerSquareType, type CornerDotType } from 'qr-code-styling'
import { type QRPreset, qrPresets, downloadQRCode, copyQRToClipboard, generateRandomColor, generateRandomShapes } from '@/lib/qr-utils'

export interface QRCodeState {
  data: string
  width: number
  height: number
  margin: number
  borderRadius: number
  errorCorrectionLevel: ErrorCorrectionLevel
  dotsColor: string
  dotsType: DotType
  cornersSquareColor: string
  cornersSquareType: CornerSquareType
  cornersDotColor: string
  cornersDotType: CornerDotType
  backgroundColor: string
  logo?: string
  logoSize: number
  logoMargin: number
  // Frame settings
  hasFrame: boolean
  frameColor: string
  textColor: string
  frameText: string
  textPosition: 'top' | 'bottom'
}

const initialState: QRCodeState = {
  data: 'https://freetools.vercel.app',
  width: 300,
  height: 300,
  margin: 10,
  borderRadius: 0,
  errorCorrectionLevel: 'Q',
  dotsColor: '#000000',
  dotsType: 'rounded',
  cornersSquareColor: '#000000',
  cornersSquareType: 'extra-rounded',
  cornersDotColor: '#000000',
  cornersDotType: 'dot',
  backgroundColor: 'transparent',
  logoSize: 0.4,
  logoMargin: 0,
  // Frame settings
  hasFrame: true,
  frameColor: '#000000',
  textColor: '#ffffff',
  frameText: 'Scan for more info',
  textPosition: 'bottom'
}

export const useQRGenerator = () => {
  const [qrState, setQrState] = useState<QRCodeState>(initialState)
  const [isGenerating, setIsGenerating] = useState(false)
  const qrInstanceRef = useRef<QRCodeStyling | null>(null)

  const updateQRState = useCallback((updates: Partial<QRCodeState>) => {
    setQrState(prev => ({ ...prev, ...updates }))
  }, [])

  const setQRInstance = useCallback((instance: QRCodeStyling | null) => {
    qrInstanceRef.current = instance
  }, [])

  const generateQROptions = useCallback((): QRCodeOptions => {
    return {
      width: qrState.width,
      height: qrState.height,
      type: 'svg',
      data: qrState.data,
      image: qrState.logo,
      margin: qrState.margin,
      dotsOptions: {
        color: qrState.dotsColor,
        type: qrState.dotsType
      },
      backgroundOptions: {
        color: qrState.backgroundColor
      },
      imageOptions: {
        margin: qrState.logoMargin,
        imageSize: qrState.logoSize,
        crossOrigin: 'anonymous',
        hideBackgroundDots: true
      },
      cornersSquareOptions: {
        color: qrState.cornersSquareColor,
        type: qrState.cornersSquareType
      },
      cornersDotOptions: {
        color: qrState.cornersDotColor,
        type: qrState.cornersDotType
      },
      qrOptions: {
        errorCorrectionLevel: qrState.errorCorrectionLevel
      }
    }
  }, [qrState])

  const applyPreset = useCallback((preset: QRPreset) => {
    const updates: Partial<QRCodeState> = {}
    
    if (preset.options.dotsOptions) {
      if (preset.options.dotsOptions.color) updates.dotsColor = preset.options.dotsOptions.color
      if (preset.options.dotsOptions.type) updates.dotsType = preset.options.dotsOptions.type
    }
    
    if (preset.options.cornersSquareOptions) {
      if (preset.options.cornersSquareOptions.color) updates.cornersSquareColor = preset.options.cornersSquareOptions.color
      if (preset.options.cornersSquareOptions.type) updates.cornersSquareType = preset.options.cornersSquareOptions.type
    }
    
    if (preset.options.cornersDotOptions) {
      if (preset.options.cornersDotOptions.color) updates.cornersDotColor = preset.options.cornersDotOptions.color
      if (preset.options.cornersDotOptions.type) updates.cornersDotType = preset.options.cornersDotOptions.type
    }

    updateQRState(updates)
  }, [updateQRState])

  const randomizeQR = useCallback(() => {
    const dotsColor = generateRandomColor()
    const cornersSquareColor = generateRandomColor()
    const cornersDotColor = generateRandomColor()
    const backgroundColor = Math.random() > 0.5 ? generateRandomColor() : 'transparent'
    const shapes = generateRandomShapes()
    
    // Frame randomization
    const textPositions = ['top', 'bottom']
    const frameTexts = ['Scan for more info', 'Scan me!', 'Get more details', 'Visit our site', 'Learn more']
    
    updateQRState({
      dotsColor,
      cornersSquareColor, 
      cornersDotColor,
      backgroundColor,
      dotsType: shapes.dotsType as DotType,
      cornersSquareType: shapes.cornersSquareType as CornerSquareType,
      cornersDotType: shapes.cornersDotType as CornerDotType,
      // Also randomize some other properties for fun
      borderRadius: Math.floor(Math.random() * 25),
      margin: Math.floor(Math.random() * 30) + 5,
      // Frame randomization (30% chance to have frame)
      hasFrame: Math.random() > 0.7,
      frameColor: generateRandomColor(),
      textColor: generateRandomColor(),
      frameText: frameTexts[Math.floor(Math.random() * frameTexts.length)],
      textPosition: textPositions[Math.floor(Math.random() * textPositions.length)] as any
    })
  }, [updateQRState])

  const downloadQR = useCallback(async (format: 'png' | 'jpg' | 'svg' = 'png') => {
    if (!qrInstanceRef.current) return
    
    setIsGenerating(true)
    try {
      const filename = `qr-code-${Date.now()}`
      await downloadQRCode(qrInstanceRef.current, filename, format)
    } catch (error) {
      console.error('Download failed:', error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const copyToClipboard = useCallback(async () => {
    if (!qrInstanceRef.current) return false
    
    setIsGenerating(true)
    try {
      const success = await copyQRToClipboard(qrInstanceRef.current)
      return success
    } catch (error) {
      console.error('Copy failed:', error)
      return false
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return {
    qrState,
    updateQRState,
    generateQROptions,
    applyPreset,
    randomizeQR,
    downloadQR,
    copyToClipboard,
    setQRInstance,
    isGenerating,
    presets: qrPresets
  }
}