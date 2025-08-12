"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Circle } from "lucide-react";
import { AI_PROVIDERS, type AIProvider, type AIModel } from "@/lib/ai-providers";
import { chatStorage } from "@/lib/chat-storage";

interface ModelSelectorProps {
  currentProvider: string;
  currentModel: string;
  onModelChange: (provider: string, model: string) => void;
}

export function ModelSelector({ 
  currentProvider, 
  currentModel, 
  onModelChange 
}: ModelSelectorProps) {
  const [configuredProviders, setConfiguredProviders] = useState<string[]>([]);

  useEffect(() => {
    checkConfiguredProviders();
  }, []);

  const checkConfiguredProviders = async () => {
    try {
      const allSettings = await chatStorage.getSettings();
      const configured = allSettings
        .filter(s => s.apiKey && s.apiKey.length > 0)
        .map(s => s.provider);
      setConfiguredProviders(configured);
    } catch (error) {
      console.error('Failed to check provider status:', error);
    }
  };

  const getCurrentProviderData = () => {
    return AI_PROVIDERS.find(p => p.id === currentProvider);
  };

  const getCurrentModelData = () => {
    const provider = getCurrentProviderData();
    return provider?.models.find(m => m.id === currentModel);
  };

  const isProviderConfigured = (providerId: string) => {
    return configuredProviders.includes(providerId);
  };

  const providerData = getCurrentProviderData();
  const modelData = getCurrentModelData();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 px-3 text-sm">
          <div className="flex items-center space-x-2">
            <span>{providerData?.icon}</span>
            <span className="font-medium">{modelData?.name || currentModel}</span>
            <ChevronDown className="w-3 h-3" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-64">
        {AI_PROVIDERS.map((provider) => {
          const isConfigured = isProviderConfigured(provider.id);
          
          return (
            <div key={provider.id}>
              <DropdownMenuLabel className="flex items-center justify-between px-2 py-1.5">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{provider.icon}</span>
                  <span className="text-sm font-medium">{provider.name}</span>
                </div>
                <div className="flex items-center">
                  <Circle 
                    className={`w-2 h-2 ${
                      isConfigured ? 'fill-green-500 text-green-500' : 'fill-gray-300 text-gray-300'
                    }`} 
                  />
                </div>
              </DropdownMenuLabel>
              
              {isConfigured ? (
                provider.models.map((model) => (
                  <DropdownMenuItem
                    key={`${provider.id}-${model.id}`}
                    onClick={() => onModelChange(provider.id, model.id)}
                    className={`px-6 py-2 cursor-pointer ${
                      currentProvider === provider.id && currentModel === model.id
                        ? 'bg-gray-100'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">{model.name}</span>
                      {currentProvider === provider.id && currentModel === model.id && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          Active
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled className="px-6 py-2">
                  <span className="text-xs text-gray-500">Configure API key to use</span>
                </DropdownMenuItem>
              )}
              
              {provider.id !== AI_PROVIDERS[AI_PROVIDERS.length - 1].id && (
                <DropdownMenuSeparator />
              )}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}