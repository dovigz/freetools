"use client";

import QRCodeStyling, {
  type CornerDotType,
  type CornerSquareType,
  type DotType,
  type DrawType,
  type ErrorCorrectionLevel,
  type Options as QRCodeOptions,
} from "qr-code-styling";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface StyledQRCodeProps {
  data?: string;
  width?: number;
  height?: number;
  type?: DrawType;
  image?: string;
  margin?: number;
  dotsOptions?: {
    color?: string;
    type?: DotType;
  };
  backgroundOptions?: {
    color?: string;
  };
  imageOptions?: {
    margin?: number;
    crossOrigin?: string;
    hideBackgroundDots?: boolean;
    imageSize?: number;
  };
  cornersSquareOptions?: {
    color?: string;
    type?: CornerSquareType;
  };
  cornersDotOptions?: {
    color?: string;
    type?: CornerDotType;
  };
  qrOptions?: {
    errorCorrectionLevel?: ErrorCorrectionLevel;
  };
  className?: string;
  onQRCodeReady?: (qrInstance: QRCodeStyling) => void;
}

export interface StyledQRCodeRef {
  getInstance: () => QRCodeStyling | null;
}

export const StyledQRCode = forwardRef<StyledQRCodeRef, StyledQRCodeProps>(
  (
    {
      data = "",
      width = 300,
      height = 300,
      type = "svg",
      image,
      margin = 0,
      dotsOptions = {
        color: "#000000",
        type: "rounded",
      },
      backgroundOptions = {
        color: "transparent",
      },
      imageOptions = {
        margin: 0,
        crossOrigin: "anonymous",
      },
      cornersSquareOptions = {
        color: "#000000",
        type: "extra-rounded",
      },
      cornersDotOptions = {
        color: "#000000",
        type: "dot",
      },
      qrOptions = {
        errorCorrectionLevel: "Q",
      },
      className = "",
      onQRCodeReady,
    },
    ref
  ) => {
    const qrRef = useRef<HTMLDivElement>(null);
    const qrCodeInstance = useRef<QRCodeStyling | null>(null);
    const [isClient, setIsClient] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        getInstance: () => qrCodeInstance.current,
      }),
      []
    );

    useEffect(() => {
      setIsClient(true);
    }, []);

    // Helper function to create text/emoji as image
    const createTextImage = (text: string): string => {
      const canvas = document.createElement("canvas");
      const size = Math.min(width, height) * 0.3;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;

      // Set canvas background to transparent
      ctx.clearRect(0, 0, size, size);

      // Configure text styling
      const fontSize = size * 0.6;
      ctx.font = `${fontSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000000";

      // Draw the text/emoji
      ctx.fillText(text, size / 2, size / 2);

      return canvas.toDataURL();
    };

    useEffect(() => {
      if (!isClient || !qrRef.current || !data?.trim()) return;

      // Determine if image is a text/emoji or actual image
      let logoImage = image;
      if (
        image &&
        !image.startsWith("data:image/") &&
        !image.startsWith("http")
      ) {
        // This is text/emoji, convert it to an image
        logoImage = createTextImage(image);
      }

      const qrCodeOptions: QRCodeOptions = {
        width,
        height,
        type,
        data: data.trim(),
        image: logoImage,
        margin,
        dotsOptions,
        backgroundOptions,
        imageOptions,
        cornersSquareOptions,
        cornersDotOptions,
        qrOptions,
      };

      try {
        if (!qrCodeInstance.current) {
          qrCodeInstance.current = new QRCodeStyling(qrCodeOptions);
          qrCodeInstance.current.append(qrRef.current);
          onQRCodeReady?.(qrCodeInstance.current);
        } else {
          qrCodeInstance.current.update(qrCodeOptions);
        }
      } catch (error) {
        console.error("QR Code generation error:", error);
        // Clear the container if there's an error
        if (qrRef.current) {
          qrRef.current.innerHTML =
            '<div class="text-red-500 text-sm">QR Code Error</div>';
        }
      }

      return () => {
        // Don't clear innerHTML on every update, only on unmount
      };
    }, [
      isClient,
      data,
      width,
      height,
      type,
      image,
      margin,
      dotsOptions,
      backgroundOptions,
      imageOptions,
      cornersSquareOptions,
      cornersDotOptions,
      qrOptions,
      onQRCodeReady,
      createTextImage,
    ]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        const currentRef = qrRef.current;
        if (currentRef) {
          currentRef.innerHTML = "";
        }
      };
    }, []);

    if (!isClient) {
      return (
        <div
          className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
          style={{ width, height }}
        >
          <div className="text-gray-400 text-sm">Loading QR...</div>
        </div>
      );
    }

    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div ref={qrRef} className="flex items-center justify-center" />
      </div>
    );
  }
);

StyledQRCode.displayName = "StyledQRCode";

export default StyledQRCode;
