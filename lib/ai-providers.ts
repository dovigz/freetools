export interface AIProvider {
  id: string;
  name: string;
  icon: string;
  baseUrl: string;
  apiKeyPlaceholder: string;
  models: AIModel[];
  headers: (apiKey: string) => Record<string, string>;
  formatRequest: (
    messages: ChatMessage[],
    model: string,
    options?: ChatOptions
  ) => any;
  parseResponse: (response: any) => string;
  parseStreamChunk: (chunk: string) => string | null;
  supportedFeatures: {
    streaming: boolean;
    systemMessages: boolean;
    maxTokens: boolean;
    temperature: boolean;
  };
}

export interface AIModel {
  id: string;
  name: string;
  maxTokens: number;
  costPer1kTokens?: {
    input: number;
    output: number;
  };
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// OpenAI Provider
const openaiProvider: AIProvider = {
  id: "openai",
  name: "OpenAI",
  icon: "🤖",
  baseUrl: "https://api.openai.com/v1/chat/completions",
  apiKeyPlaceholder: "sk-...",
  models: [
    {
      id: "gpt-4o",
      name: "GPT-4o",
      maxTokens: 128000,
      costPer1kTokens: { input: 0.005, output: 0.015 },
    },
    {
      id: "gpt-4o-mini",
      name: "GPT-4o Mini",
      maxTokens: 128000,
      costPer1kTokens: { input: 0.00015, output: 0.0006 },
    },
    {
      id: "gpt-4-turbo",
      name: "GPT-4 Turbo",
      maxTokens: 128000,
      costPer1kTokens: { input: 0.01, output: 0.03 },
    },
    {
      id: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      maxTokens: 16385,
      costPer1kTokens: { input: 0.0005, output: 0.0015 },
    },
  ],
  headers: (apiKey: string) => ({
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  }),
  formatRequest: (
    messages: ChatMessage[],
    model: string,
    options?: ChatOptions
  ) => ({
    model,
    messages,
    stream: true,
    ...(options?.temperature && { temperature: options.temperature }),
    ...(options?.maxTokens && { max_tokens: options.maxTokens }),
  }),
  parseResponse: (response: any) => response.choices[0]?.message?.content || "",
  parseStreamChunk: (chunk: string) => {
    if (chunk.startsWith("data: ")) {
      const data = chunk.slice(6).trim();
      if (data === "[DONE]") return null;
      try {
        const parsed = JSON.parse(data);
        return parsed.choices[0]?.delta?.content || null;
      } catch {
        return null;
      }
    }
    return null;
  },
  supportedFeatures: {
    streaming: true,
    systemMessages: true,
    maxTokens: true,
    temperature: true,
  },
};

// Anthropic Claude Provider
const anthropicProvider: AIProvider = {
  id: "anthropic",
  name: "Anthropic Claude",
  icon: "🧠",
  baseUrl: "https://api.anthropic.com/v1/messages",
  apiKeyPlaceholder: "sk-ant-...",
  models: [
    {
      id: "claude-3-5-sonnet-20241022",
      name: "Claude 3.5 Sonnet",
      maxTokens: 200000,
      costPer1kTokens: { input: 0.003, output: 0.015 },
    },
    {
      id: "claude-3-haiku-20240307",
      name: "Claude 3 Haiku",
      maxTokens: 200000,
      costPer1kTokens: { input: 0.00025, output: 0.00125 },
    },
    {
      id: "claude-3-opus-20240229",
      name: "Claude 3 Opus",
      maxTokens: 200000,
      costPer1kTokens: { input: 0.015, output: 0.075 },
    },
  ],
  headers: (apiKey: string) => ({
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
  }),
  formatRequest: (
    messages: ChatMessage[],
    model: string,
    options?: ChatOptions
  ) => {
    const systemMessage = messages.find((m) => m.role === "system");
    const chatMessages = messages.filter((m) => m.role !== "system");

    return {
      model,
      messages: chatMessages,
      max_tokens: options?.maxTokens || 4096,
      stream: true,
      ...(systemMessage && { system: systemMessage.content }),
      ...(options?.temperature && { temperature: options.temperature }),
    };
  },
  parseResponse: (response: any) => response.content[0]?.text || "",
  parseStreamChunk: (chunk: string) => {
    if (chunk.startsWith("data: ")) {
      const data = chunk.slice(6).trim();
      if (data === "[DONE]") return null;
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === "content_block_delta") {
          return parsed.delta?.text || null;
        }
      } catch {
        return null;
      }
    }
    return null;
  },
  supportedFeatures: {
    streaming: true,
    systemMessages: true,
    maxTokens: true,
    temperature: true,
  },
};

// Google Gemini Provider
const geminiProvider: AIProvider = {
  id: "google",
  name: "Google Gemini",
  icon: "💎",
  baseUrl: "https://generativelanguage.googleapis.com/v1/models",
  apiKeyPlaceholder: "AIza...",
  models: [
    {
      id: "gemini-1.5-pro",
      name: "Gemini 1.5 Pro",
      maxTokens: 2000000,
      costPer1kTokens: { input: 0.0035, output: 0.0105 },
    },
    {
      id: "gemini-1.5-flash",
      name: "Gemini 1.5 Flash",
      maxTokens: 1000000,
      costPer1kTokens: { input: 0.000075, output: 0.0003 },
    },
    {
      id: "gemini-pro",
      name: "Gemini Pro",
      maxTokens: 30720,
      costPer1kTokens: { input: 0.0005, output: 0.0015 },
    },
  ],
  headers: (apiKey: string) => ({
    "Content-Type": "application/json",
  }),
  formatRequest: (
    messages: ChatMessage[],
    model: string,
    options?: ChatOptions
  ) => {
    const contents = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : msg.role,
      parts: [{ text: msg.content }],
    }));

    return {
      contents,
      generationConfig: {
        ...(options?.temperature && { temperature: options.temperature }),
        ...(options?.maxTokens && { maxOutputTokens: options.maxTokens }),
      },
    };
  },
  parseResponse: (response: any) =>
    response.candidates[0]?.content?.parts[0]?.text || "",
  parseStreamChunk: (chunk: string) => {
    if (chunk.startsWith("data: ")) {
      const data = chunk.slice(6).trim();
      if (data === "[DONE]") return null;
      try {
        const parsed = JSON.parse(data);
        return parsed.candidates[0]?.content?.parts[0]?.text || null;
      } catch {
        return null;
      }
    }
    return null;
  },
  supportedFeatures: {
    streaming: true,
    systemMessages: false,
    maxTokens: true,
    temperature: true,
  },
};

export const AI_PROVIDERS: AIProvider[] = [
  openaiProvider,
  anthropicProvider,
  geminiProvider,
];

export const getProvider = (id: string): AIProvider | undefined => {
  return AI_PROVIDERS.find((provider) => provider.id === id);
};

export const getModel = (
  providerId: string,
  modelId: string
): AIModel | undefined => {
  const provider = getProvider(providerId);
  return provider?.models.find((model) => model.id === modelId);
};

// API calling utilities
export class ChatAPI {
  constructor(
    private provider: AIProvider,
    private apiKey: string
  ) {}

  async *streamChat(
    messages: ChatMessage[],
    model: string,
    options?: ChatOptions
  ): AsyncGenerator<string, void, unknown> {
    const url =
      this.provider.id === "google"
        ? `${this.provider.baseUrl}/${model}:streamGenerateContent?key=${this.apiKey}`
        : this.provider.baseUrl;

    const body = this.provider.formatRequest(messages, model, options);

    const response = await fetch(url, {
      method: "POST",
      headers: this.provider.headers(this.apiKey),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const content = this.provider.parseStreamChunk(line);
          if (content) {
            yield content;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async sendMessage(
    messages: ChatMessage[],
    model: string,
    options?: ChatOptions
  ): Promise<string> {
    let fullResponse = "";
    for await (const chunk of this.streamChat(messages, model, options)) {
      fullResponse += chunk;
    }
    return fullResponse;
  }
}

// Encryption utilities for API keys
export const encryptionUtils = {
  async encrypt(text: string, password: string = "default"): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const passwordKey = encoder.encode(password);

    const key = await crypto.subtle.importKey(
      "raw",
      passwordKey,
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      derivedKey,
      data
    );

    const result = new Uint8Array(
      salt.length + iv.length + encrypted.byteLength
    );
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encrypted), salt.length + iv.length);

    return btoa(String.fromCharCode(...result));
  },

  async decrypt(
    encryptedText: string,
    password: string = "default"
  ): Promise<string> {
    const encoder = new TextEncoder();
    const passwordKey = encoder.encode(password);

    const data = new Uint8Array(
      atob(encryptedText)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const encrypted = data.slice(28);

    const key = await crypto.subtle.importKey(
      "raw",
      passwordKey,
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      derivedKey,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  },
};
