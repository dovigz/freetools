"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Html5Qrcode } from "html5-qrcode";
import {
  Copy,
  DollarSign,
  Download,
  Facebook,
  Image as ImageIcon,
  Instagram,
  Link,
  Linkedin,
  Mail,
  MessageCircle,
  Palette,
  Phone,
  RefreshCw,
  Scan,
  Settings,
  Twitter,
  Upload,
  User,
  Video,
  Wifi,
  Youtube,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { InteractiveContrastSlider } from "@/components/qr/InteractiveContrastSlider";
import QRWithFrame from "@/components/qr/QRWithFrame";
import { type StyledQRCodeRef } from "@/components/qr/StyledQRCode";
import { useQRGenerator } from "@/hooks/use-qr-generator";
import { emojiPresets, generateVCardQR, generateWiFiQR } from "@/lib/qr-utils";

// Crypto QR code generator
const generateCryptoQR = (crypto: {
  type: "bitcoin" | "bitcoin-cash" | "ethereum" | "litecoin";
  address: string;
  amount: string;
  message: string;
}) => {
  let scheme = "";
  switch (crypto.type) {
    case "bitcoin":
      scheme = "bitcoin";
      break;
    case "bitcoin-cash":
      scheme = "bitcoincash";
      break;
    case "ethereum":
      scheme = "ethereum";
      break;
    case "litecoin":
      scheme = "litecoin";
      break;
  }

  if (!crypto.address) return "";

  const params = new URLSearchParams();
  if (crypto.amount) params.append("amount", crypto.amount);
  if (crypto.message) params.append("message", crypto.message);

  return `${scheme}:${crypto.address}${params.toString() ? `?${params.toString()}` : ""}`;
};

// SMS QR code generator
const generateSMSQR = (sms: { phone: string; message: string }) => {
  if (!sms.phone) return "";
  return `sms:${sms.phone}${sms.message ? `?body=${encodeURIComponent(sms.message)}` : ""}`;
};

// WhatsApp QR code generator
const generateWhatsAppQR = (whatsapp: { phone: string; message: string }) => {
  if (!whatsapp.phone) return "";
  const cleanPhone = whatsapp.phone.replace(/[^\d+]/g, "");
  return `https://wa.me/${cleanPhone}${whatsapp.message ? `?text=${encodeURIComponent(whatsapp.message)}` : ""}`;
};

// Skype QR code generator
const generateSkypeQR = (skype: { username: string }) => {
  if (!skype.username) return "";
  return `skype:${skype.username}?call`;
};

// Zoom QR code generator
const generateZoomQR = (zoom: { meetingId: string; password: string }) => {
  if (!zoom.meetingId) return "";
  const params = new URLSearchParams();
  if (zoom.password) params.append("pwd", zoom.password);
  return `https://zoom.us/j/${zoom.meetingId}${params.toString() ? `?${params.toString()}` : ""}`;
};

// PayPal QR code generator
const generatePayPalQR = (paypal: {
  type: "buy-now" | "donate";
  email: string;
  itemName: string;
  itemId: string;
  price: string;
  currency: string;
  shipping: string;
  taxRate: string;
}) => {
  if (!paypal.email) return "";

  const baseUrl = "https://www.paypal.com/cgi-bin/webscr";
  const params = new URLSearchParams();

  if (paypal.type === "donate") {
    params.append("cmd", "_donations");
  } else {
    params.append("cmd", "_xclick");
  }

  params.append("business", paypal.email);
  if (paypal.itemName) params.append("item_name", paypal.itemName);
  if (paypal.itemId) params.append("item_number", paypal.itemId);
  if (paypal.price) params.append("amount", paypal.price);
  params.append("currency_code", paypal.currency);
  if (paypal.shipping) params.append("shipping", paypal.shipping);
  if (paypal.taxRate) params.append("tax_rate", paypal.taxRate);

  return `${baseUrl}?${params.toString()}`;
};

export default function QRGenerator() {
  const {
    qrState,
    updateQRState,
    generateQROptions,
    applyPreset,
    applyEmojiPreset,
    randomizeQR,
    downloadQR,
    copyToClipboard,
    setQRInstance,
    isGenerating,
    presets,
  } = useQRGenerator();

  const [dataType, setDataType] = useState<
    | "text"
    | "url"
    | "email"
    | "phone"
    | "wifi"
    | "vcard"
    | "crypto"
    | "sms"
    | "whatsapp"
    | "skype"
    | "zoom"
    | "paypal"
    | "facebook"
    | "twitter"
    | "instagram"
    | "linkedin"
    | "tiktok"
    | "youtube"
  >("url");
  const [wifiData, setWifiData] = useState({
    ssid: "",
    password: "",
    security: "WPA" as const,
  });
  const [vcardData, setVcardData] = useState({
    firstName: "",
    lastName: "",
    title: "",
    organization: "",
    street: "",
    city: "",
    zipCode: "",
    country: "",
    emailPersonal: "",
    emailBusiness: "",
    phonePersonal: "",
    phoneMobile: "",
    phoneBusiness: "",
    website: "",
  });
  const [cryptoData, setCryptoData] = useState({
    type: "bitcoin" as "bitcoin" | "bitcoin-cash" | "ethereum" | "litecoin",
    address: "",
    amount: "",
    message: "",
  });
  const [smsData, setSmsData] = useState({
    phone: "",
    message: "",
  });
  const [whatsappData, setWhatsappData] = useState({
    phone: "",
    message: "",
  });
  const [skypeData, setSkypeData] = useState({
    username: "",
  });
  const [zoomData, setZoomData] = useState({
    meetingId: "",
    password: "",
  });
  const [paypalData, setPaypalData] = useState({
    type: "buy-now" as "buy-now" | "donate",
    email: "",
    itemName: "",
    itemId: "",
    price: "",
    currency: "USD",
    shipping: "",
    taxRate: "",
  });
  const [facebookData, setFacebookData] = useState({
    url: "",
    username: "",
  });
  const [twitterData, setTwitterData] = useState({
    url: "",
    username: "",
  });
  const [instagramData, setInstagramData] = useState({
    url: "",
    username: "",
  });
  const [linkedinData, setLinkedinData] = useState({
    url: "",
    username: "",
  });
  const [tiktokData, setTiktokData] = useState({
    url: "",
    username: "",
  });
  const [youtubeData, setYoutubeData] = useState({
    url: "",
    channel: "",
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [hasEverScanned, setHasEverScanned] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"png" | "svg">("png");
  const qrRef = useRef<StyledQRCodeRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wrapper function to reset scan state whenever QR changes
  const updateQRStateAndReset = (updates: any) => {
    updateQRState(updates);
    setHasEverScanned(false);
  };

  const handleQRReady = (qrInstance: any) => {
    setQRInstance(qrInstance);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateQRStateAndReset({ logo: result });
        toast.success("Logo uploaded successfully!");
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please select a valid image file");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Don't auto-detect data type - let user control it manually

  const handleDataTypeChange = (type: typeof dataType) => {
    setDataType(type);

    switch (type) {
      case "url":
        updateQRStateAndReset({ data: "https://freetools.vercel.app" });
        break;
      case "email":
        updateQRStateAndReset({ data: "contact@example.com" });
        break;
      case "phone":
        updateQRStateAndReset({ data: "+1234567890" });
        break;
      case "wifi":
        const wifiQRData = generateWiFiQR(
          wifiData.ssid || "MyWiFi",
          wifiData.password || "",
          wifiData.security
        );
        updateQRStateAndReset({ data: wifiQRData });
        break;
      case "vcard":
        const vcardQRData = generateVCardQR({
          ...vcardData,
          firstName: vcardData.firstName || "John",
          lastName: vcardData.lastName || "Doe",
        });
        updateQRStateAndReset({ data: vcardQRData });
        break;
      case "crypto":
        const cryptoQRData = generateCryptoQR({
          ...cryptoData,
          address: cryptoData.address || "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
        });
        updateQRStateAndReset({ data: cryptoQRData });
        break;
      case "sms":
        const smsQRData = generateSMSQR({
          ...smsData,
          phone: smsData.phone || "+1234567890",
        });
        updateQRStateAndReset({ data: smsQRData });
        break;
      case "whatsapp":
        const whatsappQRData = generateWhatsAppQR({
          ...whatsappData,
          phone: whatsappData.phone || "+1234567890",
        });
        updateQRStateAndReset({ data: whatsappQRData });
        break;
      case "skype":
        const skypeQRData = generateSkypeQR({
          ...skypeData,
          username: skypeData.username || "username",
        });
        updateQRStateAndReset({ data: skypeQRData });
        break;
      case "zoom":
        const zoomQRData = generateZoomQR({
          ...zoomData,
          meetingId: zoomData.meetingId || "123456789",
        });
        updateQRStateAndReset({ data: zoomQRData });
        break;
      case "paypal":
        const paypalQRData = generatePayPalQR({
          ...paypalData,
          email: paypalData.email || "seller@example.com",
        });
        updateQRStateAndReset({ data: paypalQRData });
        break;
      case "facebook":
        const fbUrl =
          facebookData.url || `https://facebook.com/${facebookData.username}`;
        updateQRStateAndReset({ data: fbUrl });
        break;
      case "twitter":
        const twitterUrl =
          twitterData.url || `https://twitter.com/${twitterData.username}`;
        updateQRStateAndReset({ data: twitterUrl });
        break;
      case "instagram":
        const instaUrl =
          instagramData.url ||
          `https://instagram.com/${instagramData.username}`;
        updateQRStateAndReset({ data: instaUrl });
        break;
      case "linkedin":
        const linkedinUrl =
          linkedinData.url ||
          `https://linkedin.com/in/${linkedinData.username}`;
        updateQRStateAndReset({ data: linkedinUrl });
        break;
      case "tiktok":
        const tiktokUrl =
          tiktokData.url || `https://tiktok.com/@${tiktokData.username}`;
        updateQRStateAndReset({ data: tiktokUrl });
        break;
      case "youtube":
        const youtubeUrl =
          youtubeData.url || `https://youtube.com/c/${youtubeData.channel}`;
        updateQRStateAndReset({ data: youtubeUrl });
        break;
      default:
        updateQRStateAndReset({ data: "Hello, World!" });
    }
  };

  const handleWifiUpdate = (field: keyof typeof wifiData, value: string) => {
    const newWifiData = { ...wifiData, [field]: value };
    setWifiData(newWifiData);
    updateQRStateAndReset({
      data: generateWiFiQR(
        newWifiData.ssid,
        newWifiData.password,
        newWifiData.security
      ),
    });
  };

  const handleVCardUpdate = (field: keyof typeof vcardData, value: string) => {
    const newVCardData = { ...vcardData, [field]: value };
    setVcardData(newVCardData);
    updateQRStateAndReset({ data: generateVCardQR(newVCardData) });
  };

  const handleCryptoUpdate = (
    field: keyof typeof cryptoData,
    value: string
  ) => {
    const newCryptoData = { ...cryptoData, [field]: value };
    setCryptoData(newCryptoData);
    updateQRStateAndReset({ data: generateCryptoQR(newCryptoData) });
  };

  const handleSmsUpdate = (field: keyof typeof smsData, value: string) => {
    const newSmsData = { ...smsData, [field]: value };
    setSmsData(newSmsData);
    updateQRStateAndReset({ data: generateSMSQR(newSmsData) });
  };

  const handleWhatsAppUpdate = (
    field: keyof typeof whatsappData,
    value: string
  ) => {
    const newWhatsAppData = { ...whatsappData, [field]: value };
    setWhatsappData(newWhatsAppData);
    updateQRStateAndReset({ data: generateWhatsAppQR(newWhatsAppData) });
  };

  const handleSkypeUpdate = (field: keyof typeof skypeData, value: string) => {
    const newSkypeData = { ...skypeData, [field]: value };
    setSkypeData(newSkypeData);
    updateQRStateAndReset({ data: generateSkypeQR(newSkypeData) });
  };

  const handleZoomUpdate = (field: keyof typeof zoomData, value: string) => {
    const newZoomData = { ...zoomData, [field]: value };
    setZoomData(newZoomData);
    updateQRStateAndReset({ data: generateZoomQR(newZoomData) });
  };

  const handlePayPalUpdate = (
    field: keyof typeof paypalData,
    value: string
  ) => {
    const newPayPalData = { ...paypalData, [field]: value };
    setPaypalData(newPayPalData);
    updateQRStateAndReset({ data: generatePayPalQR(newPayPalData) });
  };

  const updateFacebook = (updates: Partial<typeof facebookData>) => {
    const newData = { ...facebookData, ...updates };
    setFacebookData(newData);
    const url = newData.url || `https://facebook.com/${newData.username}`;
    updateQRStateAndReset({ data: url });
  };

  const updateTwitter = (updates: Partial<typeof twitterData>) => {
    const newData = { ...twitterData, ...updates };
    setTwitterData(newData);
    const url = newData.url || `https://twitter.com/${newData.username}`;
    updateQRStateAndReset({ data: url });
  };

  const updateInstagram = (updates: Partial<typeof instagramData>) => {
    const newData = { ...instagramData, ...updates };
    setInstagramData(newData);
    const url = newData.url || `https://instagram.com/${newData.username}`;
    updateQRStateAndReset({ data: url });
  };

  const updateLinkedIn = (updates: Partial<typeof linkedinData>) => {
    const newData = { ...linkedinData, ...updates };
    setLinkedinData(newData);
    const url = newData.url || `https://linkedin.com/in/${newData.username}`;
    updateQRStateAndReset({ data: url });
  };

  const updateTikTok = (updates: Partial<typeof tiktokData>) => {
    const newData = { ...tiktokData, ...updates };
    setTiktokData(newData);
    const url = newData.url || `https://tiktok.com/@${newData.username}`;
    updateQRStateAndReset({ data: url });
  };

  const updateYouTube = (updates: Partial<typeof youtubeData>) => {
    const newData = { ...youtubeData, ...updates };
    setYoutubeData(newData);
    const url = newData.url || `https://youtube.com/c/${newData.channel}`;
    updateQRStateAndReset({ data: url });
  };

  const updateSMS = (updates: Partial<typeof smsData>) => {
    const newData = { ...smsData, ...updates };
    setSmsData(newData);
    updateQRStateAndReset({ data: generateSMSQR(newData) });
  };

  const updateWhatsApp = (updates: Partial<typeof whatsappData>) => {
    const newData = { ...whatsappData, ...updates };
    setWhatsappData(newData);
    updateQRStateAndReset({ data: generateWhatsAppQR(newData) });
  };

  const updateSkype = (updates: Partial<typeof skypeData>) => {
    const newData = { ...skypeData, ...updates };
    setSkypeData(newData);
    updateQRStateAndReset({ data: generateSkypeQR(newData) });
  };

  const updateZoom = (updates: Partial<typeof zoomData>) => {
    const newData = { ...zoomData, ...updates };
    setZoomData(newData);
    updateQRStateAndReset({ data: generateZoomQR(newData) });
  };

  const updatePayPal = (updates: Partial<typeof paypalData>) => {
    const newData = { ...paypalData, ...updates };
    setPaypalData(newData);
    updateQRStateAndReset({ data: generatePayPalQR(newData) });
  };

  const handleDownload = async (format: "png" | "jpg" | "svg") => {
    try {
      await downloadQR(format);
      toast.success(`QR code downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to download QR code");
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard();
    if (success) {
      toast.success("QR code copied to clipboard");
    } else {
      toast.error("Failed to copy QR code");
    }
  };

  const handleRandomize = () => {
    randomizeQR();
    setHasEverScanned(false); // Keep this one since randomizeQR is from the hook, not updateQRState
    toast.success("QR code randomized!");
  };

  const openDownloadModal = (format: "png" | "svg") => {
    setDownloadFormat(format);
    setShowDownloadModal(true);
  };

  const confirmDownload = () => {
    handleDownload(downloadFormat);
    setShowDownloadModal(false);
  };

  const handleSwapColors = () => {
    const currentDotsColor = qrState.dotsColor;
    const currentBackgroundColor =
      qrState.backgroundColor === "transparent"
        ? "#ffffff"
        : qrState.backgroundColor;

    updateQRStateAndReset({
      dotsColor: currentBackgroundColor,
      backgroundColor: currentDotsColor,
      cornersSquareColor: currentBackgroundColor,
      cornersDotColor: currentBackgroundColor,
    });
  };

  const handleContrastColorChange = (
    newForeground: string,
    newBackground: string
  ) => {
    updateQRStateAndReset({
      dotsColor: newForeground,
      backgroundColor: newBackground,
      cornersSquareColor: newForeground,
      cornersDotColor: newForeground,
    });
  };

  const handleScanQR = async () => {
    if (isScanning) return;
    setIsScanning(true);

    try {
      // Start scanning animation
      const scanOverlay = document.getElementById("scan-overlay");
      const scanLine = document.getElementById("scan-line");
      if (scanOverlay && scanLine) {
        scanOverlay.style.display = "flex";
        scanLine.style.animation = "scanDown 1.5s ease-in-out";
      }

      // Wait for animation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get the QR code from the DOM - look for SVG, canvas, or image elements
      const qrCodeContainer = document.querySelector(".qr-code-container");
      if (!qrCodeContainer) {
        throw new Error("QR code container not found");
      }

      // Try to find SVG, Canvas, or Image elements
      let qrSvg = qrCodeContainer.querySelector("svg");
      let qrCanvas = qrCodeContainer.querySelector("canvas");
      let qrImage = qrCodeContainer.querySelector("img");

      let imageElement = null;

      if (qrCanvas) {
        console.log("Found canvas, converting to image...");
        // Convert canvas to image for scanning
        const dataURL = qrCanvas.toDataURL("image/png");
        imageElement = new Image();
        imageElement.src = dataURL;
        await new Promise((resolve) => {
          imageElement.onload = resolve;
        });
      } else if (qrSvg) {
        console.log("Found SVG, converting to image...");
        // Convert SVG to canvas then to image
        const svgData = new XMLSerializer().serializeToString(qrSvg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        const svgBlob = new Blob([svgData], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.naturalWidth || 300;
            canvas.height = img.naturalHeight || 300;
            ctx?.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            // Convert canvas to image
            imageElement = new Image();
            imageElement.src = canvas.toDataURL("image/png");
            imageElement.onload = resolve;
          };
          img.onerror = reject;
          img.src = url;
        });
      } else if (qrImage) {
        console.log("Found image element...");
        imageElement = qrImage;
      }

      if (!imageElement) {
        console.log("Available elements:", {
          svg: !!qrSvg,
          canvas: !!qrCanvas,
          image: !!qrImage,
          containerContent: qrCodeContainer.innerHTML.slice(0, 200),
        });
        throw new Error("No QR code image found");
      }

      // Convert the image element to a File for html5-qrcode
      let blob: Blob | null = null;

      if (qrCanvas) {
        console.log("Converting canvas to blob...");
        blob = await new Promise<Blob>((resolve, reject) => {
          qrCanvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob from canvas"));
          }, "image/png");
        });
      } else if (qrSvg) {
        console.log("Converting SVG to blob...");
        // For SVG, we need to create a canvas first
        const svgData = new XMLSerializer().serializeToString(qrSvg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        const svgBlob = new Blob([svgData], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.naturalWidth || 300;
            canvas.height = img.naturalHeight || 300;
            ctx?.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve();
          };
          img.onerror = reject;
          img.src = url;
        });

        blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob from SVG"));
          }, "image/png");
        });
      } else if (imageElement && imageElement.src) {
        console.log("Converting image element to blob...");
        // Convert image element to canvas then to blob
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = imageElement.naturalWidth || imageElement.width;
        canvas.height = imageElement.naturalHeight || imageElement.height;
        ctx?.drawImage(imageElement, 0, 0);

        blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob from image"));
          }, "image/png");
        });
      }

      if (!blob) {
        throw new Error("Failed to create blob from QR code");
      }

      // Create File object from blob
      const file = new File([blob], "qr-code.png", { type: "image/png" });
      console.log("Created file for scanning:", file.name, file.size, "bytes");

      // Use html5-qrcode to scan the file
      const html5QrCode = new Html5Qrcode("temp-qr-reader");

      try {
        const scanResult = await html5QrCode.scanFile(file, true);
        console.log("Real QR scan result:", scanResult);
        setScanResult(scanResult);
        setHasEverScanned(true);
      } catch (scanError) {
        console.error("QR scan failed:", scanError);

        // Check if it's a contrast/readability issue
        if (
          scanError.message &&
          scanError.message.includes("finder patterns")
        ) {
          setScanResult(
            "QR code found but could not be read! This is likely due to poor contrast between the QR dots and background. The scanner found the QR code but couldn't detect the corner finder patterns properly. Try using black dots on a white background for best readability."
          );
        } else {
          setScanResult(
            "QR code could not be read. This might be due to low contrast, unusual colors, or the QR code being too stylized. Try using higher contrast colors (black on white works best)."
          );
        }
      }
    } catch (error) {
      console.error("QR scan error:", error);
      setScanResult(
        "Failed to scan QR code. Please ensure the QR code is visible and try again."
      );
    } finally {
      // Hide scan overlay and reset state
      const scanOverlay = document.getElementById("scan-overlay");
      if (scanOverlay) {
        scanOverlay.style.display = "none";
      }
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Hidden div for QR scanning */}
      <div id="temp-qr-reader" style={{ display: "none" }}></div>

      {/* Scan Result Modal */}
      {scanResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {scanResult.includes("could not be read") ||
                  scanResult.includes("No QR data") ||
                  scanResult.includes("Failed to scan") ||
                  scanResult.includes("might be due to") ? (
                    <>❌ Scan Failed</>
                  ) : (
                    <>✅ QR Code Scanned Successfully!</>
                  )}
                </h2>
                <button
                  onClick={() => setScanResult(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    Scanned Content:
                  </label>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg border">
                    <pre className="text-sm font-mono break-all whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                      {scanResult}
                    </pre>
                  </div>
                </div>
                {!scanResult.includes("could not be read") &&
                  !scanResult.includes("No QR data") &&
                  !scanResult.includes("Failed to scan") &&
                  !scanResult.includes("might be due to") && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Length: {scanResult.length} characters
                    </div>
                  )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={() => setScanResult(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation for scanning line */}
      <style jsx>{`
        @keyframes scanDown {
          0% {
            top: 0%;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0%;
          }
        }
        #scan-overlay {
          display: none;
        }
      `}</style>

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          QR Code Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create customizable QR codes with advanced styling options
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Panel - QR Preview */}
        <div className="lg:col-span-1 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="sticky top-0 space-y-4">
            {/* Interactive Contrast Control */}
            <InteractiveContrastSlider
              foregroundColor={qrState.dotsColor}
              backgroundColor={qrState.backgroundColor}
              onColorChange={handleContrastColorChange}
              onSwapColors={handleSwapColors}
            />

            {/* QR Code Display */}
            <div className="flex justify-center mb-4">
              <div className="qr-code-container relative">
                <QRWithFrame
                  ref={qrRef}
                  {...generateQROptions()}
                  hasFrame={qrState.hasFrame}
                  frameColor={qrState.frameColor}
                  textColor={qrState.textColor}
                  frameText={qrState.frameText}
                  textPosition={qrState.textPosition}
                  className="drop-shadow-sm"
                  onQRCodeReady={handleQRReady}
                />

                {/* Scanning Overlay */}
                <div
                  id="scan-overlay"
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-lg items-center justify-center"
                  style={{ display: "none" }}
                >
                  <div className="relative w-full h-full">
                    {/* Scanning Line */}
                    <div
                      id="scan-line"
                      className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-lg"
                      style={{
                        top: "0%",
                        boxShadow: "0 0 10px #ef4444, 0 0 20px #ef4444",
                      }}
                    />

                    {/* Corner brackets */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-red-500"></div>
                    <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-red-500"></div>
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-red-500"></div>
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-red-500"></div>

                    {/* Scanning text */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium">
                      Scanning QR Code...
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4 relative">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => openDownloadModal("png")}
                      disabled={isGenerating || !hasEverScanned}
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PNG
                    </Button>
                    <Button
                      onClick={() => openDownloadModal("svg")}
                      variant="outline"
                      disabled={isGenerating || !hasEverScanned}
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      SVG
                    </Button>
                  </div>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="w-full"
                    disabled={isGenerating || !hasEverScanned}
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleRandomize}
                      variant="outline"
                      size="sm"
                      disabled={isGenerating}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Randomize
                    </Button>
                    <Button
                      onClick={handleScanQR}
                      variant="outline"
                      disabled={isGenerating || isScanning}
                      size="sm"
                    >
                      <Scan className="w-4 h-4 mr-2" />
                      {isScanning ? "Scanning..." : "Scan"}
                    </Button>
                  </div>
                </div>

                {/* Scan to Unlock Overlay */}
                {!hasEverScanned && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <div className="text-center p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Test your QR code by scanning it first to ensure it
                        works properly before downloading or sharing.
                      </p>
                      <Button
                        onClick={handleScanQR}
                        disabled={isGenerating || isScanning}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Scan className="w-4 h-4 mr-2" />
                        {isScanning ? "Scanning..." : "Scan QR Code"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel - All Configuration Options */}
        <div className="lg:col-span-2 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {/* Content Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Content</CardTitle>
              <CardDescription>
                Choose what your QR code will contain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Data Type Selector */}
              <div className="space-y-2">
                <Label htmlFor="content-type">Content Type</Label>
                <Select
                  value={dataType}
                  onValueChange={(value) =>
                    handleDataTypeChange(value as typeof dataType)
                  }
                >
                  <SelectTrigger id="content-type" className="w-full">
                    <SelectValue placeholder="Choose content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">
                      <div className="flex items-center gap-2">
                        <Link className="w-4 h-4" />
                        <span>URL - Website Link</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="text">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span>Text - Plain Text</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>Email - Email Address</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="phone">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>Phone - Phone Number</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="wifi">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4" />
                        <span>WiFi - Network Credentials</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="vcard">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Contact - Business Card</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="crypto">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Crypto - Wallet Address</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>SMS - Text Message</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="whatsapp">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp - Message</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="skype">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        <span>Skype - Video Call</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="zoom">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        <span>Zoom - Meeting Link</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="paypal">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>PayPal - Payment Link</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="facebook">
                      <div className="flex items-center gap-2">
                        <Facebook className="w-4 h-4" />
                        <span>Facebook - Profile/Page</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="twitter">
                      <div className="flex items-center gap-2">
                        <Twitter className="w-4 h-4" />
                        <span>Twitter - Profile/Tweet</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="instagram">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4" />
                        <span>Instagram - Profile</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="linkedin">
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn - Profile</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="tiktok">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        <span>TikTok - Profile</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="youtube">
                      <div className="flex items-center gap-2">
                        <Youtube className="w-4 h-4" />
                        <span>YouTube - Channel/Video</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Content Input Fields */}
              {dataType === "wifi" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ssid">Network Name (SSID)</Label>
                      <Input
                        id="ssid"
                        value={wifiData.ssid}
                        onChange={(e) =>
                          handleWifiUpdate("ssid", e.target.value)
                        }
                        placeholder="My WiFi Network"
                      />
                    </div>
                    <div>
                      <Label htmlFor="security">Security</Label>
                      <Select
                        value={wifiData.security}
                        onValueChange={(value) =>
                          handleWifiUpdate("security", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WPA">WPA/WPA2</SelectItem>
                          <SelectItem value="WEP">WEP</SelectItem>
                          <SelectItem value="nopass">No Password</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={wifiData.password}
                      onChange={(e) =>
                        handleWifiUpdate("password", e.target.value)
                      }
                      placeholder="WiFi password"
                      disabled={wifiData.security === "nopass"}
                    />
                  </div>
                </div>
              )}

              {dataType === "vcard" && (
                <div className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        value={vcardData.firstName}
                        onChange={(e) =>
                          handleVCardUpdate("firstName", e.target.value)
                        }
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="organization">Company/Organisation</Label>
                      <Input
                        id="organization"
                        value={vcardData.organization}
                        onChange={(e) =>
                          handleVCardUpdate("organization", e.target.value)
                        }
                        placeholder="Company Name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        value={vcardData.lastName}
                        onChange={(e) =>
                          handleVCardUpdate("lastName", e.target.value)
                        }
                        placeholder="Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailPersonal">Email (personal)</Label>
                      <Input
                        id="emailPersonal"
                        type="email"
                        value={vcardData.emailPersonal}
                        onChange={(e) =>
                          handleVCardUpdate("emailPersonal", e.target.value)
                        }
                        placeholder="john@personal.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={vcardData.title}
                        onChange={(e) =>
                          handleVCardUpdate("title", e.target.value)
                        }
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailBusiness">Email (business)</Label>
                      <Input
                        id="emailBusiness"
                        type="email"
                        value={vcardData.emailBusiness}
                        onChange={(e) =>
                          handleVCardUpdate("emailBusiness", e.target.value)
                        }
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="street">Street</Label>
                      <Input
                        id="street"
                        value={vcardData.street}
                        onChange={(e) =>
                          handleVCardUpdate("street", e.target.value)
                        }
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phonePersonal">Phone (personal)</Label>
                      <Input
                        id="phonePersonal"
                        value={vcardData.phonePersonal}
                        onChange={(e) =>
                          handleVCardUpdate("phonePersonal", e.target.value)
                        }
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zipCode">Zip code</Label>
                      <Input
                        id="zipCode"
                        value={vcardData.zipCode}
                        onChange={(e) =>
                          handleVCardUpdate("zipCode", e.target.value)
                        }
                        placeholder="12345"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneMobile">Phone (mobile)</Label>
                      <Input
                        id="phoneMobile"
                        value={vcardData.phoneMobile}
                        onChange={(e) =>
                          handleVCardUpdate("phoneMobile", e.target.value)
                        }
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={vcardData.city}
                        onChange={(e) =>
                          handleVCardUpdate("city", e.target.value)
                        }
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneBusiness">Phone (business)</Label>
                      <Input
                        id="phoneBusiness"
                        value={vcardData.phoneBusiness}
                        onChange={(e) =>
                          handleVCardUpdate("phoneBusiness", e.target.value)
                        }
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={vcardData.country}
                        onChange={(e) =>
                          handleVCardUpdate("country", e.target.value)
                        }
                        placeholder="United States"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={vcardData.website}
                        onChange={(e) =>
                          handleVCardUpdate("website", e.target.value)
                        }
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {dataType === "crypto" && (
                <div className="space-y-4">
                  {/* Cryptocurrency Type Selector */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Cryptocurrency Type
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "bitcoin", label: "Bitcoin" },
                        { value: "bitcoin-cash", label: "Bitcoin Cash" },
                        { value: "ethereum", label: "Ethereum" },
                        { value: "litecoin", label: "Litecoin" },
                      ].map(({ value, label }) => (
                        <div
                          key={value}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            id={`crypto-${value}`}
                            name="cryptoType"
                            value={value}
                            checked={cryptoData.type === value}
                            onChange={(e) =>
                              handleCryptoUpdate("type", e.target.value)
                            }
                            className="w-4 h-4"
                          />
                          <Label
                            htmlFor={`crypto-${value}`}
                            className="text-sm cursor-pointer"
                          >
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Receiver Address */}
                  <div>
                    <Label htmlFor="cryptoAddress">Receiver Address</Label>
                    <Input
                      id="cryptoAddress"
                      value={cryptoData.address}
                      onChange={(e) =>
                        handleCryptoUpdate("address", e.target.value)
                      }
                      placeholder="Enter wallet address"
                      className="font-mono text-sm"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <Label htmlFor="cryptoAmount">Amount (Optional)</Label>
                    <Input
                      id="cryptoAmount"
                      type="number"
                      step="0.00000001"
                      value={cryptoData.amount}
                      onChange={(e) =>
                        handleCryptoUpdate("amount", e.target.value)
                      }
                      placeholder="0.00000000"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="cryptoMessage">Message (Optional)</Label>
                    <Input
                      id="cryptoMessage"
                      value={cryptoData.message}
                      onChange={(e) =>
                        handleCryptoUpdate("message", e.target.value)
                      }
                      placeholder="Payment description"
                    />
                  </div>

                  {/* Raw Text Preview */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                      Raw Text Check:
                    </Label>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg border">
                      <code className="text-sm font-mono break-all text-gray-900 dark:text-gray-100">
                        {generateCryptoQR(cryptoData) ||
                          "Enter address to generate"}
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {/* SMS Form */}
              {dataType === "sms" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="smsPhone">Phone Number</Label>
                    <Input
                      id="smsPhone"
                      value={smsData.phone}
                      onChange={(e) => updateSMS({ phone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smsMessage">Message (Optional)</Label>
                    <Textarea
                      id="smsMessage"
                      value={smsData.message}
                      onChange={(e) => updateSMS({ message: e.target.value })}
                      placeholder="Enter your message"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              )}

              {/* WhatsApp Form */}
              {dataType === "whatsapp" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="whatsappPhone">Phone Number</Label>
                    <Input
                      id="whatsappPhone"
                      value={whatsappData.phone}
                      onChange={(e) =>
                        updateWhatsApp({ phone: e.target.value })
                      }
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsappMessage">Message (Optional)</Label>
                    <Textarea
                      id="whatsappMessage"
                      value={whatsappData.message}
                      onChange={(e) =>
                        updateWhatsApp({ message: e.target.value })
                      }
                      placeholder="Enter your message"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              )}

              {/* Skype Form */}
              {dataType === "skype" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="skypeUsername">Skype Username</Label>
                    <Input
                      id="skypeUsername"
                      value={skypeData.username}
                      onChange={(e) =>
                        updateSkype({ username: e.target.value })
                      }
                      placeholder="skype_username"
                    />
                  </div>
                </div>
              )}

              {/* Zoom Form */}
              {dataType === "zoom" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="zoomMeetingId">Meeting ID</Label>
                    <Input
                      id="zoomMeetingId"
                      value={zoomData.meetingId}
                      onChange={(e) =>
                        updateZoom({ meetingId: e.target.value })
                      }
                      placeholder="123 456 7890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zoomPassword">Password (Optional)</Label>
                    <Input
                      id="zoomPassword"
                      value={zoomData.password}
                      onChange={(e) => updateZoom({ password: e.target.value })}
                      placeholder="Meeting password"
                      type="password"
                    />
                  </div>
                </div>
              )}

              {/* PayPal Form */}
              {dataType === "paypal" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="paypalType">Payment Type</Label>
                    <Select
                      value={paypalData.type}
                      onValueChange={(value) =>
                        updatePayPal({ type: value as "buy-now" | "donate" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy-now">Buy now</SelectItem>
                        <SelectItem value="donate">Donate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paypalEmail">Email</Label>
                    <Input
                      id="paypalEmail"
                      type="email"
                      value={paypalData.email}
                      onChange={(e) => updatePayPal({ email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paypalItemName">Item Name</Label>
                    <Input
                      id="paypalItemName"
                      value={paypalData.itemName}
                      onChange={(e) =>
                        updatePayPal({ itemName: e.target.value })
                      }
                      placeholder="Product or service name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paypalItemId">Item ID (Optional)</Label>
                    <Input
                      id="paypalItemId"
                      value={paypalData.itemId}
                      onChange={(e) => updatePayPal({ itemId: e.target.value })}
                      placeholder="SKU or ID"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paypalPrice">Price</Label>
                      <Input
                        id="paypalPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={paypalData.price}
                        onChange={(e) =>
                          updatePayPal({ price: e.target.value })
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paypalCurrency">Currency</Label>
                      <Select
                        value={paypalData.currency}
                        onValueChange={(value) =>
                          updatePayPal({ currency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">
                            United States dollar
                          </SelectItem>
                          <SelectItem value="EUR">Euro</SelectItem>
                          <SelectItem value="GBP">British Pound</SelectItem>
                          <SelectItem value="CAD">Canadian Dollar</SelectItem>
                          <SelectItem value="AUD">Australian Dollar</SelectItem>
                          <SelectItem value="JPY">Japanese Yen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paypalShipping">Shipping</Label>
                      <Input
                        id="paypalShipping"
                        type="number"
                        step="0.01"
                        min="0"
                        value={paypalData.shipping}
                        onChange={(e) =>
                          updatePayPal({ shipping: e.target.value })
                        }
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">USD</p>
                    </div>
                    <div>
                      <Label htmlFor="paypalTaxRate">Tax Rate</Label>
                      <div className="relative">
                        <Input
                          id="paypalTaxRate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={paypalData.taxRate}
                          onChange={(e) =>
                            updatePayPal({ taxRate: e.target.value })
                          }
                          placeholder="0"
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Facebook Form */}
              {dataType === "facebook" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="facebookUrl">Facebook URL (Optional)</Label>
                    <Input
                      id="facebookUrl"
                      value={facebookData.url}
                      onChange={(e) => updateFacebook({ url: e.target.value })}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebookUsername">Username/Page Name</Label>
                    <Input
                      id="facebookUsername"
                      value={facebookData.username}
                      onChange={(e) =>
                        updateFacebook({ username: e.target.value })
                      }
                      placeholder="yourpage"
                    />
                  </div>
                </div>
              )}

              {/* Twitter Form */}
              {dataType === "twitter" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="twitterUrl">Twitter URL (Optional)</Label>
                    <Input
                      id="twitterUrl"
                      value={twitterData.url}
                      onChange={(e) => updateTwitter({ url: e.target.value })}
                      placeholder="https://twitter.com/yourusername"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitterUsername">Username</Label>
                    <Input
                      id="twitterUsername"
                      value={twitterData.username}
                      onChange={(e) =>
                        updateTwitter({ username: e.target.value })
                      }
                      placeholder="yourusername"
                    />
                  </div>
                </div>
              )}

              {/* Instagram Form */}
              {dataType === "instagram" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="instagramUrl">
                      Instagram URL (Optional)
                    </Label>
                    <Input
                      id="instagramUrl"
                      value={instagramData.url}
                      onChange={(e) => updateInstagram({ url: e.target.value })}
                      placeholder="https://instagram.com/yourusername"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagramUsername">Username</Label>
                    <Input
                      id="instagramUsername"
                      value={instagramData.username}
                      onChange={(e) =>
                        updateInstagram({ username: e.target.value })
                      }
                      placeholder="yourusername"
                    />
                  </div>
                </div>
              )}

              {/* LinkedIn Form */}
              {dataType === "linkedin" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn URL (Optional)</Label>
                    <Input
                      id="linkedinUrl"
                      value={linkedinData.url}
                      onChange={(e) => updateLinkedIn({ url: e.target.value })}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedinUsername">Profile Name</Label>
                    <Input
                      id="linkedinUsername"
                      value={linkedinData.username}
                      onChange={(e) =>
                        updateLinkedIn({ username: e.target.value })
                      }
                      placeholder="yourprofile"
                    />
                  </div>
                </div>
              )}

              {/* TikTok Form */}
              {dataType === "tiktok" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tiktokUrl">TikTok URL (Optional)</Label>
                    <Input
                      id="tiktokUrl"
                      value={tiktokData.url}
                      onChange={(e) => updateTikTok({ url: e.target.value })}
                      placeholder="https://tiktok.com/@yourusername"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tiktokUsername">Username</Label>
                    <Input
                      id="tiktokUsername"
                      value={tiktokData.username}
                      onChange={(e) =>
                        updateTikTok({ username: e.target.value })
                      }
                      placeholder="yourusername"
                    />
                  </div>
                </div>
              )}

              {/* YouTube Form */}
              {dataType === "youtube" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="youtubeUrl">YouTube URL (Optional)</Label>
                    <Input
                      id="youtubeUrl"
                      value={youtubeData.url}
                      onChange={(e) => updateYouTube({ url: e.target.value })}
                      placeholder="https://youtube.com/c/yourchannel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="youtubeChannel">Channel Name</Label>
                    <Input
                      id="youtubeChannel"
                      value={youtubeData.channel}
                      onChange={(e) =>
                        updateYouTube({ channel: e.target.value })
                      }
                      placeholder="yourchannel"
                    />
                  </div>
                </div>
              )}

              {![
                "wifi",
                "vcard",
                "crypto",
                "sms",
                "whatsapp",
                "skype",
                "zoom",
                "paypal",
                "facebook",
                "twitter",
                "instagram",
                "linkedin",
                "tiktok",
                "youtube",
              ].includes(dataType) && (
                <div>
                  <Label htmlFor="qrData">
                    {dataType === "url" && "URL"}
                    {dataType === "email" && "Email Address"}
                    {dataType === "phone" && "Phone Number"}
                    {dataType === "text" && "Text Content"}
                  </Label>
                  <Textarea
                    id="qrData"
                    value={qrState.data}
                    onChange={(e) =>
                      updateQRStateAndReset({ data: e.target.value })
                    }
                    placeholder={
                      dataType === "url"
                        ? "https://example.com"
                        : dataType === "email"
                          ? "contact@example.com"
                          : dataType === "phone"
                            ? "+1234567890"
                            : "Enter your text here"
                    }
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Correction Level */}
          <Card>
            <CardHeader>
              <CardTitle>Quality & Reliability</CardTitle>
              <CardDescription>
                Set error correction level - crucial for QR code scanning
                reliability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="errorCorrection">Error Correction Level</Label>
                <Select
                  value={qrState.errorCorrectionLevel}
                  onValueChange={(value) =>
                    updateQRStateAndReset({
                      errorCorrectionLevel: value as any,
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">
                      <div className="space-y-1">
                        <div className="font-medium">Low (7%)</div>
                        <div className="text-xs text-gray-500">
                          Smallest size, minimal damage recovery
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="M">
                      <div className="space-y-1">
                        <div className="font-medium">Medium (15%)</div>
                        <div className="text-xs text-gray-500">
                          Balanced size and reliability
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="Q">
                      <div className="space-y-1">
                        <div className="font-medium">
                          Quartile (25%) - Recommended
                        </div>
                        <div className="text-xs text-gray-500">
                          Good reliability for most uses
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="H">
                      <div className="space-y-1">
                        <div className="font-medium">High (30%)</div>
                        <div className="text-xs text-gray-500">
                          Maximum reliability, larger size
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Higher levels make QR codes more resistant to damage but
                  increase size.
                  <strong>Quartile (25%)</strong> is recommended for most
                  applications.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emoji Style Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Style Presets
              </CardTitle>
              <CardDescription>
                Choose from emoji-themed QR code styles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-0.5">
                {emojiPresets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant="outline"
                    onClick={() => {
                      applyEmojiPreset(preset);
                      setHasEverScanned(false);
                    }}
                    className="h-8 w-8 p-0 text-center group hover:scale-110 transition-transform border-0"
                    title={`${preset.name} - ${preset.description}`}
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">
                      {preset.emoji}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Background & Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Background & Colors</CardTitle>
              <CardDescription>
                Customize background and colors of your QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Background Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="withBackground"
                  checked={qrState.backgroundColor !== "transparent"}
                  onChange={(e) =>
                    updateQRStateAndReset({
                      backgroundColor: e.target.checked
                        ? "#ffffff"
                        : "transparent",
                    })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="withBackground" className="text-sm font-medium">
                  With background ✓
                </Label>
              </div>

              {/* Color Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backgroundColor">Background color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={
                        qrState.backgroundColor === "transparent"
                          ? "#ffffff"
                          : qrState.backgroundColor
                      }
                      onChange={(e) =>
                        updateQRStateAndReset({
                          backgroundColor: e.target.value,
                        })
                      }
                      className="w-16 h-10 p-1 border rounded"
                      disabled={qrState.backgroundColor === "transparent"}
                    />
                    <Input
                      value={
                        qrState.backgroundColor === "transparent"
                          ? "#ffffff"
                          : qrState.backgroundColor
                      }
                      onChange={(e) =>
                        updateQRStateAndReset({
                          backgroundColor: e.target.value,
                        })
                      }
                      placeholder="#ffffff"
                      className="flex-1"
                      disabled={qrState.backgroundColor === "transparent"}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dotsColor">Dots color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="dotsColor"
                      type="color"
                      value={qrState.dotsColor}
                      onChange={(e) =>
                        updateQRStateAndReset({ dotsColor: e.target.value })
                      }
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={qrState.dotsColor}
                      onChange={(e) =>
                        updateQRStateAndReset({ dotsColor: e.target.value })
                      }
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cornersSquareColor">
                    Corners Square color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="cornersSquareColor"
                      type="color"
                      value={qrState.cornersSquareColor}
                      onChange={(e) =>
                        updateQRStateAndReset({
                          cornersSquareColor: e.target.value,
                        })
                      }
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={qrState.cornersSquareColor}
                      onChange={(e) =>
                        updateQRStateAndReset({
                          cornersSquareColor: e.target.value,
                        })
                      }
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cornersDotColor">Corners Dot color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cornersDotColor"
                      type="color"
                      value={qrState.cornersDotColor}
                      onChange={(e) =>
                        updateQRStateAndReset({
                          cornersDotColor: e.target.value,
                        })
                      }
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={qrState.cornersDotColor}
                      onChange={(e) =>
                        updateQRStateAndReset({
                          cornersDotColor: e.target.value,
                        })
                      }
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shape Options */}
          <Card>
            <CardHeader>
              <CardTitle>Shape Options</CardTitle>
              <CardDescription>
                Choose the shape style for different parts of the QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Dots type */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Dots type
                  </Label>
                  <div className="space-y-2">
                    {[
                      { value: "dots", label: "dots" },
                      { value: "rounded", label: "rounded" },
                      { value: "classy", label: "classy" },
                      { value: "classy-rounded", label: "classy-rounded" },
                      { value: "square", label: "square" },
                      { value: "extra-rounded", label: "extra-rounded" },
                    ].map(({ value, label }) => (
                      <div key={value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`dots-${value}`}
                          name="dotsType"
                          value={value}
                          checked={qrState.dotsType === value}
                          onChange={(e) =>
                            updateQRStateAndReset({
                              dotsType: e.target.value as any,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <Label
                          htmlFor={`dots-${value}`}
                          className="text-sm cursor-pointer"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Corners Square type */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Corners Square type
                  </Label>
                  <div className="space-y-2">
                    {[
                      { value: "dot", label: "dot" },
                      { value: "square", label: "square" },
                      { value: "extra-rounded", label: "extra-rounded" },
                    ].map(({ value, label }) => (
                      <div key={value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`corners-square-${value}`}
                          name="cornersSquareType"
                          value={value}
                          checked={qrState.cornersSquareType === value}
                          onChange={(e) =>
                            updateQRStateAndReset({
                              cornersSquareType: e.target.value as any,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <Label
                          htmlFor={`corners-square-${value}`}
                          className="text-sm cursor-pointer"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Corners Dot type */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Corners Dot type
                  </Label>
                  <div className="space-y-2">
                    {[
                      { value: "dot", label: "dot" },
                      { value: "square", label: "square" },
                    ].map(({ value, label }) => (
                      <div key={value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`corners-dot-${value}`}
                          name="cornersDotType"
                          value={value}
                          checked={qrState.cornersDotType === value}
                          onChange={(e) =>
                            updateQRStateAndReset({
                              cornersDotType: e.target.value as any,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <Label
                          htmlFor={`corners-dot-${value}`}
                          className="text-sm cursor-pointer"
                        >
                          {label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Frame Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Frame settings
              </CardTitle>
              <CardDescription>
                Add a frame around your QR code with custom text
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add frame toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="addFrame"
                  checked={qrState.hasFrame}
                  onChange={(e) =>
                    updateQRStateAndReset({ hasFrame: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="addFrame" className="text-sm font-medium">
                  Add frame
                </Label>
              </div>

              {qrState.hasFrame && (
                <div className="space-y-4">
                  {/* Frame and text colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="frameColor">Frame color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="frameColor"
                          type="color"
                          value={qrState.frameColor}
                          onChange={(e) =>
                            updateQRStateAndReset({
                              frameColor: e.target.value,
                            })
                          }
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={qrState.frameColor}
                          onChange={(e) =>
                            updateQRStateAndReset({
                              frameColor: e.target.value,
                            })
                          }
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="textColor">Text color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="textColor"
                          type="color"
                          value={qrState.textColor}
                          onChange={(e) =>
                            updateQRStateAndReset({ textColor: e.target.value })
                          }
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={qrState.textColor}
                          onChange={(e) =>
                            updateQRStateAndReset({ textColor: e.target.value })
                          }
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Text position */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Text position
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "top", label: "top" },
                        { value: "bottom", label: "bottom" },
                      ].map(({ value, label }) => (
                        <div
                          key={value}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            id={`text-position-${value}`}
                            name="textPosition"
                            value={value}
                            checked={qrState.textPosition === value}
                            onChange={(e) =>
                              updateQRStateAndReset({
                                textPosition: e.target.value as any,
                              })
                            }
                            className="w-4 h-4"
                          />
                          <Label
                            htmlFor={`text-position-${value}`}
                            className="text-sm cursor-pointer"
                          >
                            {label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Frame text */}
                  <div>
                    <Label htmlFor="frameText">Frame text</Label>
                    <Input
                      id="frameText"
                      value={qrState.frameText}
                      onChange={(e) =>
                        updateQRStateAndReset({ frameText: e.target.value })
                      }
                      placeholder="Scan for more info"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logo Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Logo Options
              </CardTitle>
              <CardDescription>
                Add text, emoji, or image to the center of your QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {/* Text/Emoji input with upload button */}
                <div>
                  <Label htmlFor="logoText">Logo Text or Emoji</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logoText"
                      value={
                        qrState.logo?.startsWith("data:")
                          ? ""
                          : qrState.logo || ""
                      }
                      onChange={(e) =>
                        updateQRStateAndReset({
                          logo: e.target.value || undefined,
                        })
                      }
                      placeholder="🚀 or MyLogo or 🔥"
                      className="flex-1"
                      maxLength={10}
                    />
                    <Button
                      onClick={handleUploadClick}
                      variant="outline"
                      size="sm"
                      className="px-3"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Enter text, emoji, or upload an image
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Upload status indicator */}
                {qrState.logo?.startsWith("data:") && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                    ✓ Image uploaded successfully
                  </div>
                )}
              </div>

              {/* Logo size slider */}
              {qrState.logo && (
                <>
                  <div>
                    <Label>
                      Logo Size: {Math.round(qrState.logoSize * 100)}%
                    </Label>
                    <Slider
                      value={[qrState.logoSize]}
                      onValueChange={([value]) =>
                        updateQRStateAndReset({ logoSize: value })
                      }
                      min={0.1}
                      max={0.8}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Logo Margin: {qrState.logoMargin}px</Label>
                    <Slider
                      value={[qrState.logoMargin]}
                      onValueChange={([value]) =>
                        updateQRStateAndReset({ logoMargin: value })
                      }
                      min={0}
                      max={20}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </>
              )}

              {/* Remove logo button */}
              {qrState.logo && (
                <Button
                  onClick={() => updateQRStateAndReset({ logo: undefined })}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Remove Logo
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Download Options Modal */}
      <Dialog open={showDownloadModal} onOpenChange={setShowDownloadModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Download QR Code</DialogTitle>
            <DialogDescription>
              Preview and customize your QR code before downloading
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview */}
            <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="qr-code-container">
                <QRWithFrame
                  {...generateQROptions()}
                  hasFrame={qrState.hasFrame}
                  frameColor={qrState.frameColor}
                  textColor={qrState.textColor}
                  frameText={qrState.frameText}
                  textPosition={qrState.textPosition}
                  className="drop-shadow-sm"
                />
              </div>
            </div>

            {/* Size Options */}
            <div className="space-y-3">
              <div>
                <Label>Size (Width × Height)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <Slider
                      value={[qrState.width]}
                      onValueChange={([value]) =>
                        updateQRStateAndReset({ width: value })
                      }
                      min={200}
                      max={800}
                      step={50}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Width: {qrState.width}px
                    </div>
                  </div>
                  <div>
                    <Slider
                      value={[qrState.height]}
                      onValueChange={([value]) =>
                        updateQRStateAndReset({ height: value })
                      }
                      min={200}
                      max={800}
                      step={50}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Height: {qrState.height}px
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Margin</Label>
                <Slider
                  value={[qrState.margin]}
                  onValueChange={([value]) =>
                    updateQRStateAndReset({ margin: value })
                  }
                  min={0}
                  max={50}
                  step={5}
                  className="mt-1"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Margin: {qrState.margin}px
                </div>
              </div>

              <div>
                <Label>Border Radius</Label>
                <Slider
                  value={[qrState.borderRadius]}
                  onValueChange={([value]) =>
                    updateQRStateAndReset({ borderRadius: value })
                  }
                  min={0}
                  max={50}
                  step={5}
                  className="mt-1"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Border Radius: {qrState.borderRadius}px
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDownloadModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDownload}
                className="flex-1"
                disabled={isGenerating}
              >
                <Download className="w-4 h-4 mr-2" />
                Download {downloadFormat.toUpperCase()}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
