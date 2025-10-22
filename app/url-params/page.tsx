"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface URLParam {
  key: string;
  value: string;
  enabled: boolean;
  id: string;
}

export default function URLParamsPage() {
  const [inputUrl, setInputUrl] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [params, setParams] = useState<URLParam[]>([]);
  const [copied, setCopied] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Auto-resize textarea function
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    element.style.overflowY = "hidden";
    const scrollHeight = element.scrollHeight;

    // Only show scrollbar if content exceeds max height
    if (scrollHeight > 72) {
      element.style.height = "72px";
      element.style.overflowY = "auto";
    } else {
      element.style.height = scrollHeight + "px";
      element.style.overflowY = "hidden";
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem("url-params-input");
    if (savedUrl) {
      setInputUrl(savedUrl);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when input changes (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("url-params-input", inputUrl);
    }
  }, [inputUrl, isLoaded]);

  // Parse URL when input changes
  useEffect(() => {
    if (!inputUrl.trim()) {
      setBaseUrl("");
      setParams([]);
      setIsValidUrl(true);
      return;
    }

    try {
      const url = new URL(inputUrl);
      setBaseUrl(`${url.protocol}//${url.host}${url.pathname}`);

      const urlParams: URLParam[] = [];
      url.searchParams.forEach((value, key) => {
        urlParams.push({
          key,
          value,
          enabled: true,
          id: Math.random().toString(36).substr(2, 9),
        });
      });

      setParams(urlParams);
      setIsValidUrl(true);
    } catch {
      setIsValidUrl(false);
    }
  }, [inputUrl]);

  // Adjust textarea heights after params are loaded
  useEffect(() => {
    params.forEach((param) => {
      const keyTextarea = document.getElementById(
        `key-${param.id}`
      ) as HTMLTextAreaElement;
      const valueTextarea = document.getElementById(
        `value-${param.id}`
      ) as HTMLTextAreaElement;
      if (keyTextarea) adjustTextareaHeight(keyTextarea);
      if (valueTextarea) adjustTextareaHeight(valueTextarea);
    });
  }, [params]);

  // Build the final URL
  const buildUrl = () => {
    if (!baseUrl) return "";

    const enabledParams = params.filter((p) => p.enabled && p.key.trim());
    if (enabledParams.length === 0) return baseUrl;

    const urlParams = new URLSearchParams();
    enabledParams.forEach((param) => {
      urlParams.append(param.key, param.value);
    });

    return `${baseUrl}?${urlParams.toString()}`;
  };

  const finalUrl = buildUrl();

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(finalUrl);
      setCopied(true);
      toast.success("URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  // Update parameter
  const updateParam = (
    id: string,
    field: "key" | "value",
    newValue: string
  ) => {
    setParams(
      params.map((p) => (p.id === id ? { ...p, [field]: newValue } : p))
    );
  };

  // Toggle parameter enabled state
  const toggleParam = (id: string) => {
    setParams(
      params.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  // Remove parameter
  const removeParam = (id: string) => {
    setParams(params.filter((p) => p.id !== id));
    toast.success("Parameter removed");
  };

  // Add new parameter
  const addParam = () => {
    const newParam: URLParam = {
      key: "",
      value: "",
      enabled: true,
      id: Math.random().toString(36).substr(2, 9),
    };
    setParams([...params, newParam]);
  };

  // Clear all
  const clearAll = () => {
    setInputUrl("");
    setBaseUrl("");
    setParams([]);
    setIsValidUrl(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">URL Parameters</h1>
        <p className="text-muted-foreground">
          View, modify, and manage URL parameters easily
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Paste URL
          </CardTitle>
          <CardDescription>
            Enter a URL to view and manage its parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url-input">URL</Label>
            <div className="flex gap-2">
              <Input
                id="url-input"
                type="text"
                placeholder="https://example.com?param1=value1&param2=value2"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className={!isValidUrl && inputUrl ? "border-destructive" : ""}
              />
              {inputUrl && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearAll}
                  title="Clear all"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {!isValidUrl && inputUrl && (
              <p className="text-sm text-destructive">
                Please enter a valid URL
              </p>
            )}
          </div>

          {baseUrl && (
            <div className="space-y-2">
              <Label>Base URL</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                {baseUrl}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parameters Section */}
      {params.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Parameters ({params.filter((p) => p.enabled).length}/
                  {params.length})
                </CardTitle>
                <CardDescription>
                  Uncheck to remove, or edit values directly
                </CardDescription>
              </div>
              <Button onClick={addParam} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Parameter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Header Row */}
            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 mb-2 px-1">
              <div className="w-8"></div>
              <Label className="text-xs text-muted-foreground font-medium">
                Key
              </Label>
              <Label className="text-xs text-muted-foreground font-medium">
                Value
              </Label>
              <div className="w-8"></div>
            </div>

            {/* Parameter Rows */}
            <div className="space-y-2">
              {params.map((param) => (
                <div
                  key={param.id}
                  className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-start"
                >
                  <div className="pt-2">
                    <Checkbox
                      checked={param.enabled}
                      onCheckedChange={() => toggleParam(param.id)}
                      id={`param-${param.id}`}
                    />
                  </div>

                  <textarea
                    id={`key-${param.id}`}
                    value={param.key}
                    onChange={(e) => {
                      updateParam(param.id, "key", e.target.value);
                      adjustTextareaHeight(e.target);
                    }}
                    placeholder="key"
                    disabled={!param.enabled}
                    rows={1}
                    className="font-mono text-sm px-3 py-2 border border-input bg-background rounded-md resize-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    style={{
                      minHeight: "36px",
                      maxHeight: "72px",
                      overflowY: "hidden",
                    }}
                  />

                  <textarea
                    id={`value-${param.id}`}
                    value={param.value}
                    onChange={(e) => {
                      updateParam(param.id, "value", e.target.value);
                      adjustTextareaHeight(e.target);
                    }}
                    placeholder="value"
                    disabled={!param.enabled}
                    rows={1}
                    className="font-mono text-sm px-3 py-2 border border-input bg-background rounded-md resize-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    style={{
                      minHeight: "36px",
                      maxHeight: "72px",
                      overflowY: "hidden",
                    }}
                  />

                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeParam(param.id)}
                      className="h-9 w-9 text-destructive hover:text-destructive"
                      title="Remove parameter"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Output Section */}
      {baseUrl && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Final URL</CardTitle>
                <CardDescription>
                  Copy the modified URL with your changes
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  size="icon"
                  variant="outline"
                  title="Copy URL"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={() => window.open(finalUrl, "_blank")}
                  size="icon"
                  variant="outline"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
                {finalUrl}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="font-semibold">
                  {params.filter((p) => p.enabled).length}
                </span>
                <span>parameters active</span>
              </div>
              {params.filter((p) => !p.enabled).length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">
                      {params.filter((p) => !p.enabled).length}
                    </span>
                    <span>disabled</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!inputUrl && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Link2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No URL yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Paste a URL above to start viewing and managing its parameters.
              You can enable/disable parameters, modify their values, or add new
              ones.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
