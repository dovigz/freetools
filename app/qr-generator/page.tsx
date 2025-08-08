"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Copy,
  Download,
  Image as ImageIcon,
  Link,
  Mail,
  Palette,
  Phone,
  RefreshCw,
  Scan,
  Settings,
  Sparkles,
  Upload,
  User,
  Wifi,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import QRWithFrame from "@/components/qr/QRWithFrame";
import { type StyledQRCodeRef } from "@/components/qr/StyledQRCode";
import { useQRGenerator } from "@/hooks/use-qr-generator";
import { emojiPresets, generateVCardQR, generateWiFiQR } from "@/lib/qr-utils";

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
    "text" | "url" | "email" | "phone" | "wifi" | "vcard"
  >("url");
  const [wifiData, setWifiData] = useState({
    ssid: "",
    password: "",
    security: "WPA" as const,
  });
  const [vcardData, setVcardData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organization: "",
    url: "",
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const qrRef = useRef<StyledQRCodeRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQRReady = (qrInstance: any) => {
    setQRInstance(qrInstance);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateQRState({ logo: result });
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
        updateQRState({ data: "https://freetools.vercel.app" });
        break;
      case "email":
        updateQRState({ data: "contact@example.com" });
        break;
      case "phone":
        updateQRState({ data: "+1234567890" });
        break;
      case "wifi":
        const wifiQRData = generateWiFiQR(
          wifiData.ssid || "MyWiFi",
          wifiData.password || "",
          wifiData.security
        );
        updateQRState({ data: wifiQRData });
        break;
      case "vcard":
        const vcardQRData = generateVCardQR({
          ...vcardData,
          firstName: vcardData.firstName || "John",
          lastName: vcardData.lastName || "Doe",
        });
        updateQRState({ data: vcardQRData });
        break;
      default:
        updateQRState({ data: "Hello, World!" });
    }
  };

  const handleWifiUpdate = (field: keyof typeof wifiData, value: string) => {
    const newWifiData = { ...wifiData, [field]: value };
    setWifiData(newWifiData);
    updateQRState({
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
    updateQRState({ data: generateVCardQR(newVCardData) });
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
    toast.success("QR code randomized!");
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

      // Get QR code data directly from the state (most reliable method)
      const qrData = qrState.data?.trim();
      console.log("QR Data to scan:", qrData);

      if (qrData) {
        // Show modal with scan result
        setScanResult(qrData);
      } else {
        setScanResult("No QR data found. Please generate a QR code first.");
      }
    } catch (error) {
      console.error("QR scan error:", error);
      setScanResult(
        "QR code could not be read. Please change to a different color and try again."
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
                  scanResult.includes("No QR data") ? (
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
                  !scanResult.includes("No QR data") && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Length: {scanResult.length} characters
                    </div>
                  )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              {!scanResult.includes("could not be read") &&
                !scanResult.includes("No QR data") && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(scanResult);
                      toast.success("Copied to clipboard!");
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                )}
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
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                QR Code Preview
              </CardTitle>
              <CardDescription>
                Your generated QR code will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code Display */}
              <div className="flex justify-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-200 dark:bg-gray-900 dark:border-gray-700 relative">
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
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleDownload("png")}
                    disabled={isGenerating}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PNG
                  </Button>
                  <Button
                    onClick={() => handleDownload("svg")}
                    variant="outline"
                    disabled={isGenerating}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    SVG
                  </Button>
                </div>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="w-full"
                  disabled={isGenerating}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handleRandomize} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Randomize QR
                  </Button>
                  <Button
                    onClick={handleScanQR}
                    variant="outline"
                    disabled={isGenerating || isScanning}
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    {isScanning ? "Scanning..." : "Scan QR"}
                  </Button>
                </div>
              </div>

              {/* Data Type Indicator */}
              <div className="flex items-center justify-center">
                <Badge variant="secondary" className="text-xs">
                  {dataType.toUpperCase()} • {qrState.data.length} chars
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - All Configuration Options */}
        <div className="lg:col-span-2 space-y-6 max-h-screen overflow-y-auto">
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
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "url", label: "URL", icon: Link },
                  { value: "text", label: "Text", icon: Settings },
                  { value: "email", label: "Email", icon: Mail },
                  { value: "phone", label: "Phone", icon: Phone },
                  { value: "wifi", label: "WiFi", icon: Wifi },
                  { value: "vcard", label: "Contact", icon: User },
                ].map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={dataType === value ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      handleDataTypeChange(value as typeof dataType)
                    }
                    className="flex flex-col h-auto py-3"
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
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
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={vcardData.lastName}
                        onChange={(e) =>
                          handleVCardUpdate("lastName", e.target.value)
                        }
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vcardEmail">Email</Label>
                      <Input
                        id="vcardEmail"
                        type="email"
                        value={vcardData.email}
                        onChange={(e) =>
                          handleVCardUpdate("email", e.target.value)
                        }
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vcardPhone">Phone</Label>
                      <Input
                        id="vcardPhone"
                        value={vcardData.phone}
                        onChange={(e) =>
                          handleVCardUpdate("phone", e.target.value)
                        }
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={vcardData.organization}
                        onChange={(e) =>
                          handleVCardUpdate("organization", e.target.value)
                        }
                        placeholder="Company Name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vcardUrl">Website</Label>
                      <Input
                        id="vcardUrl"
                        value={vcardData.url}
                        onChange={(e) =>
                          handleVCardUpdate("url", e.target.value)
                        }
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {!["wifi", "vcard"].includes(dataType) && (
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
                    onChange={(e) => updateQRState({ data: e.target.value })}
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
                    onClick={() => applyEmojiPreset(preset)}
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
                    updateQRState({
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
                        updateQRState({ backgroundColor: e.target.value })
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
                        updateQRState({ backgroundColor: e.target.value })
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
                        updateQRState({ dotsColor: e.target.value })
                      }
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={qrState.dotsColor}
                      onChange={(e) =>
                        updateQRState({ dotsColor: e.target.value })
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
                        updateQRState({ cornersSquareColor: e.target.value })
                      }
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={qrState.cornersSquareColor}
                      onChange={(e) =>
                        updateQRState({ cornersSquareColor: e.target.value })
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
                        updateQRState({ cornersDotColor: e.target.value })
                      }
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={qrState.cornersDotColor}
                      onChange={(e) =>
                        updateQRState({ cornersDotColor: e.target.value })
                      }
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Size & Quality */}
          <Card>
            <CardHeader>
              <CardTitle>Size & Quality</CardTitle>
              <CardDescription>
                Adjust the size, margins and error correction level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Width (px): {qrState.width}</Label>
                  <Slider
                    value={[qrState.width]}
                    onValueChange={([value]) => updateQRState({ width: value })}
                    min={200}
                    max={800}
                    step={50}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Height (px): {qrState.height}</Label>
                  <Slider
                    value={[qrState.height]}
                    onValueChange={([value]) =>
                      updateQRState({ height: value })
                    }
                    min={200}
                    max={800}
                    step={50}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Border radius (px): {qrState.borderRadius}</Label>
                  <Slider
                    value={[qrState.borderRadius]}
                    onValueChange={([value]) =>
                      updateQRState({ borderRadius: value })
                    }
                    min={0}
                    max={50}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Margin (px): {qrState.margin}</Label>
                  <Slider
                    value={[qrState.margin]}
                    onValueChange={([value]) =>
                      updateQRState({ margin: value })
                    }
                    min={0}
                    max={50}
                    step={5}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Image margin (px): {qrState.logoMargin}</Label>
                  <Slider
                    value={[qrState.logoMargin]}
                    onValueChange={([value]) =>
                      updateQRState({ logoMargin: value })
                    }
                    min={0}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="errorCorrection">Error Correction Level</Label>
                <Select
                  value={qrState.errorCorrectionLevel}
                  onValueChange={(value) =>
                    updateQRState({ errorCorrectionLevel: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
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
                            updateQRState({ dotsType: e.target.value as any })
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
                            updateQRState({
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
                            updateQRState({
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
                    updateQRState({ hasFrame: e.target.checked })
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
                            updateQRState({ frameColor: e.target.value })
                          }
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={qrState.frameColor}
                          onChange={(e) =>
                            updateQRState({ frameColor: e.target.value })
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
                            updateQRState({ textColor: e.target.value })
                          }
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          value={qrState.textColor}
                          onChange={(e) =>
                            updateQRState({ textColor: e.target.value })
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
                              updateQRState({
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
                        updateQRState({ frameText: e.target.value })
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
                        updateQRState({ logo: e.target.value || undefined })
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
                <div>
                  <Label>
                    Logo Size: {Math.round(qrState.logoSize * 100)}%
                  </Label>
                  <Slider
                    value={[qrState.logoSize]}
                    onValueChange={([value]) =>
                      updateQRState({ logoSize: value })
                    }
                    min={0.1}
                    max={0.8}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              )}

              {/* Remove logo button */}
              {qrState.logo && (
                <Button
                  onClick={() => updateQRState({ logo: undefined })}
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
    </div>
  );
}
