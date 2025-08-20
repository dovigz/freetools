"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AI_PROVIDERS,
  encryptionUtils,
  type AIModel,
} from "@/lib/ai-providers";
import { chatStorage } from "@/lib/chat-storage";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  EyeOff,
  Info,
  Save,
  Settings,
  Shield,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProviderPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProviderSettings {
  provider: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export function ProviderPanel({ isOpen, onClose }: ProviderPanelProps) {
  const [currentSettings, setCurrentSettings] = useState<
    Record<string, ProviderSettings>
  >({});
  const [selectedProvider, setSelectedProvider] = useState(AI_PROVIDERS[0].id);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<
    Record<string, boolean | null>
  >({});
  const [savedStates, setSavedStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const allSettings = await chatStorage.getSettings();
      const settingsMap: Record<string, ProviderSettings> = {};

      for (const provider of AI_PROVIDERS) {
        const providerSetting = allSettings.find(
          (s) => s.provider === provider.id
        );

        // Decrypt API key if it exists
        let decryptedApiKey = "";
        if (providerSetting?.apiKey) {
          try {
            decryptedApiKey = await encryptionUtils.decrypt(
              providerSetting.apiKey
            );
          } catch (error) {
            console.error("Failed to decrypt API key for", provider.id, error);
            decryptedApiKey = ""; // Clear invalid encrypted data
          }
        }

        settingsMap[provider.id] = {
          provider: provider.id,
          apiKey: decryptedApiKey,
          model: providerSetting?.model || provider.models[0].id,
          temperature: providerSetting?.temperature || 0.7,
          maxTokens: providerSetting?.maxTokens || 2048,
          systemPrompt: providerSetting?.systemPrompt || "",
        };
      }

      setCurrentSettings(settingsMap);

      // Update saved states - mark as saved if API key exists
      const savedStatesMap: Record<string, boolean> = {};
      for (const provider of AI_PROVIDERS) {
        const providerSetting = allSettings.find(
          (s) => s.provider === provider.id
        );
        savedStatesMap[provider.id] = !!providerSetting?.apiKey;
      }
      setSavedStates(savedStatesMap);
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (providerId: string) => {
    const settings = currentSettings[providerId];
    if (!settings) return;

    try {
      setIsLoading(true);

      // Encrypt API key if provided
      let encryptedApiKey = settings.apiKey;
      if (settings.apiKey) {
        encryptedApiKey = await encryptionUtils.encrypt(settings.apiKey);
      }

      await chatStorage.saveSettings({
        provider: providerId,
        apiKey: encryptedApiKey,
        model: settings.model,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        systemPrompt: settings.systemPrompt,
      });

      // Mark as saved
      setSavedStates((prev) => ({ ...prev, [providerId]: true }));

      toast.success(
        `Settings saved for ${AI_PROVIDERS.find((p) => p.id === providerId)?.name}`
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const testApiKey = async (providerId: string) => {
    const settings = currentSettings[providerId];
    if (!settings?.apiKey) {
      toast.error("Please enter an API key first");
      return;
    }

    try {
      setIsLoading(true);
      setTestResults({ ...testResults, [providerId]: null });

      const provider = AI_PROVIDERS.find((p) => p.id === providerId);
      if (!provider) return;

      // Simple test call to validate API key
      const response = await fetch(provider.baseUrl, {
        method: "POST",
        headers: provider.headers(settings.apiKey),
        body: JSON.stringify(
          provider.formatRequest(
            [{ role: "user", content: "Hello" }],
            settings.model,
            { maxTokens: 10 }
          )
        ),
      });

      const isValid = response.ok;
      setTestResults({ ...testResults, [providerId]: isValid });

      if (isValid) {
        toast.success("API key is valid!");
      } else {
        toast.error("API key test failed");
      }
    } catch (error) {
      console.error("API key test failed:", error);
      setTestResults({ ...testResults, [providerId]: false });
      toast.error("API key test failed");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSettings = async (providerId: string) => {
    try {
      await chatStorage.deleteSettings(providerId);
      setCurrentSettings({
        ...currentSettings,
        [providerId]: {
          provider: providerId,
          apiKey: "",
          model:
            AI_PROVIDERS.find((p) => p.id === providerId)?.models[0].id || "",
          temperature: 0.7,
          maxTokens: 2048,
          systemPrompt: "",
        },
      });
      setTestResults({ ...testResults, [providerId]: null });
      setSavedStates((prev) => ({ ...prev, [providerId]: false }));
      toast.success("Settings deleted");
    } catch (error) {
      console.error("Failed to delete settings:", error);
      toast.error("Failed to delete settings");
    }
  };

  const exportSettings = async () => {
    try {
      const data = await chatStorage.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-chat-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Settings exported successfully");
    } catch (error) {
      console.error("Failed to export settings:", error);
      toast.error("Failed to export settings");
    }
  };

  const importSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await chatStorage.importData(data);
      await loadSettings();
      toast.success("Settings imported successfully");
    } catch (error) {
      console.error("Failed to import settings:", error);
      toast.error("Failed to import settings");
    }
  };

  const updateSetting = (
    providerId: string,
    key: keyof ProviderSettings,
    value: any
  ) => {
    setCurrentSettings({
      ...currentSettings,
      [providerId]: {
        ...currentSettings[providerId],
        [key]: value,
      },
    });

    // Mark as unsaved when settings change
    if (key === "apiKey" && value !== "") {
      setSavedStates((prev) => ({ ...prev, [providerId]: false }));
    }
  };

  const getCurrentProvider = () =>
    AI_PROVIDERS.find((p) => p.id === selectedProvider);
  const getCurrentSettings = () => currentSettings[selectedProvider];

  if (!isOpen) return null;

  return (
    <div className="w-96 bg-white border-l flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">AI Settings</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Provider Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              AI Provider
            </Label>
            <Select
              value={selectedProvider}
              onValueChange={setSelectedProvider}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center space-x-2">
                      <span>{provider.icon}</span>
                      <span>{provider.name}</span>
                      {savedStates[provider.id] && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-700"
                        >
                          Saved
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {getCurrentProvider() && getCurrentSettings() && (
            <Tabs defaultValue="api" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="api">API Setup</TabsTrigger>
                <TabsTrigger value="settings">Model Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="api" className="space-y-4">
                {/* API Key Configuration */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">API Key</CardTitle>
                    <CardDescription className="text-xs">
                      Your API key for {getCurrentProvider()?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="relative">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        placeholder={getCurrentProvider()?.apiKeyPlaceholder}
                        value={getCurrentSettings()?.apiKey || ""}
                        onChange={(e) =>
                          updateSetting(
                            selectedProvider,
                            "apiKey",
                            e.target.value
                          )
                        }
                        className={`pr-20 ${savedStates[selectedProvider] ? "border-green-500" : ""}`}
                      />
                      {savedStates[selectedProvider] &&
                        getCurrentSettings()?.apiKey && (
                          <div className="absolute right-10 top-0 h-full flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => saveSettings(selectedProvider)}
                        disabled={isLoading}
                        className="flex-1"
                        variant={
                          savedStates[selectedProvider] ? "outline" : "default"
                        }
                      >
                        <Save className="w-3 h-3 mr-1" />
                        {savedStates[selectedProvider] ? "Saved" : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testApiKey(selectedProvider)}
                        disabled={isLoading || !getCurrentSettings()?.apiKey}
                      >
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteSettings(selectedProvider)}
                        disabled={isLoading}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    {testResults[selectedProvider] === true && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          API key is valid and working!
                        </AlertDescription>
                      </Alert>
                    )}

                    {testResults[selectedProvider] === false && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          API key test failed. Please check your key.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Security Notice */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Your API keys are encrypted and stored locally in your
                    browser. They are never sent to our servers.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                {/* Model Selection */}
                <div>
                  <Label className="text-sm font-medium">Model</Label>
                  <Select
                    value={getCurrentSettings()?.model}
                    onValueChange={(value) =>
                      updateSetting(selectedProvider, "model", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getCurrentProvider()?.models.map((model: AIModel) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{model.name}</span>
                            <span className="text-xs text-gray-500">
                              Max: {model.maxTokens.toLocaleString()} tokens
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Temperature */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Temperature</Label>
                    <Badge variant="outline">
                      {getCurrentSettings()?.temperature}
                    </Badge>
                  </div>
                  <Slider
                    value={[getCurrentSettings()?.temperature || 0.7]}
                    onValueChange={(value) =>
                      updateSetting(selectedProvider, "temperature", value[0])
                    }
                    max={1}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Focused</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Max Tokens */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Max Tokens</Label>
                    <Badge variant="outline">
                      {getCurrentSettings()?.maxTokens}
                    </Badge>
                  </div>
                  <Slider
                    value={[getCurrentSettings()?.maxTokens || 2048]}
                    onValueChange={(value) =>
                      updateSetting(selectedProvider, "maxTokens", value[0])
                    }
                    max={
                      getCurrentProvider()?.models.find(
                        (m) => m.id === getCurrentSettings()?.model
                      )?.maxTokens || 4096
                    }
                    min={100}
                    step={100}
                    className="mt-2"
                  />
                </div>

                {/* System Prompt */}
                <div>
                  <Label className="text-sm font-medium">
                    System Prompt (Optional)
                  </Label>
                  <textarea
                    placeholder="Enter a system prompt to set the AI's behavior..."
                    value={getCurrentSettings()?.systemPrompt || ""}
                    onChange={(e) =>
                      updateSetting(
                        selectedProvider,
                        "systemPrompt",
                        e.target.value
                      )
                    }
                    className="w-full mt-1 p-2 text-sm border rounded-md resize-none h-20"
                  />
                </div>

                <Button
                  onClick={() => saveSettings(selectedProvider)}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </TabsContent>
            </Tabs>
          )}

          <Separator />

          {/* Backup & Restore */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Backup & Restore
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportSettings}
                className="text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Upload className="w-3 h-3 mr-1" />
                  Import
                </Button>
              </div>
            </div>
          </div>

          {/* Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Configure your AI providers to start chatting. Each provider
              requires its own API key.
            </AlertDescription>
          </Alert>
        </div>
      </ScrollArea>
    </div>
  );
}
