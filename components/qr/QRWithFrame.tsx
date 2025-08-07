"use client"

import { forwardRef } from 'react'
import StyledQRCode, { type StyledQRCodeProps, type StyledQRCodeRef } from './StyledQRCode'

interface QRWithFrameProps extends StyledQRCodeProps {
  hasFrame: boolean
  frameColor: string
  textColor: string
  frameText: string
  textPosition: 'top' | 'bottom'
}

export const QRWithFrame = forwardRef<StyledQRCodeRef, QRWithFrameProps>(({
  hasFrame,
  frameColor,
  textColor,
  frameText,
  textPosition,
  className,
  ...qrProps
}, ref) => {
  
  if (!hasFrame) {
    return <StyledQRCode ref={ref} {...qrProps} className={className} />
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: frameColor,
    padding: '20px',
    borderRadius: '12px',
    gap: '16px',
    maxWidth: 'fit-content'
  }

  const textStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '500',
    textAlign: 'center',
    margin: 0,
    color: textColor,
    whiteSpace: 'nowrap',
    letterSpacing: '0.025em'
  }

  const qrContainerStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }

  return (
    <div style={containerStyle} className={className}>
      {textPosition === 'top' && frameText && (
        <div style={textStyle}>{frameText}</div>
      )}
      
      <div style={qrContainerStyle}>
        <StyledQRCode ref={ref} {...qrProps} />
      </div>
      
      {textPosition === 'bottom' && frameText && (
        <div style={textStyle}>{frameText}</div>
      )}
    </div>
  )
})

QRWithFrame.displayName = 'QRWithFrame'

export default QRWithFrame