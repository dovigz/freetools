"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Send, 
  Bot, 
  StopCircle, 
  AlertCircle, 
  Settings,
  MessageCircle,
  Key
} from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { chatStorage, type Message, type Conversation } from "@/lib/chat-storage";
import { AI_PROVIDERS, ChatAPI, getProvider, type ChatMessage } from "@/lib/ai-providers";
import { toast } from "sonner";

interface ChatAreaProps {
  conversationId: number | null;
  conversation: Conversation | null;
  onProviderSettingsOpen: () => void;
}

export function ChatArea({ 
  conversationId, 
  conversation,
  onProviderSettingsOpen 
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentStreamController, setCurrentStreamController] = useState<AbortController | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Focus input when conversation is selected
  useEffect(() => {
    if (conversationId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [conversationId]);

  const loadMessages = async () => {
    if (!conversationId) return;
    
    try {
      const conversationMessages = await chatStorage.getMessages(conversationId);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load conversation messages');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getAPIKey = async (providerId: string): Promise<string | null> => {
    try {
      const settings = await chatStorage.getSettings(providerId);
      if (settings.length > 0 && settings[0].apiKey) {
        // Decrypt the API key
        const { encryptionUtils } = await import('@/lib/ai-providers');
        return await encryptionUtils.decrypt(settings[0].apiKey);
      }
    } catch (error) {
      console.error('Failed to get API key:', error);
    }
    return null;
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !conversationId || !conversation || isStreaming) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setError(null);

    try {
      // Add user message to database
      const userMessageId = await chatStorage.addMessage({
        conversationId,
        role: 'user',
        content: userMessage,
      });

      // Reload messages to include the new user message
      await loadMessages();

      // Get API key for the provider
      const apiKey = await getAPIKey(conversation.provider);
      if (!apiKey) {
        setError(`No API key found for ${conversation.provider}. Please configure it in settings.`);
        return;
      }

      // Get provider configuration
      const provider = getProvider(conversation.provider);
      if (!provider) {
        setError(`Provider ${conversation.provider} not found.`);
        return;
      }

      // Prepare chat messages for API
      const allMessages = await chatStorage.getMessages(conversationId);
      const chatMessages: ChatMessage[] = allMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));

      // Initialize streaming
      setIsStreaming(true);
      setStreamingMessage("");
      
      const controller = new AbortController();
      setCurrentStreamController(controller);

      const chatAPI = new ChatAPI(provider, apiKey);
      let fullResponse = "";

      try {
        // Stream the response
        for await (const chunk of chatAPI.streamChat(chatMessages, conversation.model)) {
          if (controller.signal.aborted) break;
          
          fullResponse += chunk;
          setStreamingMessage(fullResponse);
        }

        // Save the complete AI response to database
        if (fullResponse && !controller.signal.aborted) {
          await chatStorage.addMessage({
            conversationId,
            role: 'assistant',
            content: fullResponse,
          });

          // Update conversation title if it's the first exchange
          if (allMessages.length <= 1) {
            const title = userMessage.length > 50 
              ? userMessage.substring(0, 50) + "..." 
              : userMessage;
            await chatStorage.updateConversation(conversationId, { title });
          }

          await loadMessages();
        }
      } catch (streamError: any) {
        if (!controller.signal.aborted) {
          console.error('Streaming error:', streamError);
          setError(`Error: ${streamError.message}`);
        }
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      setError(`Failed to send message: ${error.message}`);
    } finally {
      setIsStreaming(false);
      setStreamingMessage("");
      setCurrentStreamController(null);
    }
  };

  const handleStop = () => {
    if (currentStreamController) {
      currentStreamController.abort();
    }
    setIsStreaming(false);
    setStreamingMessage("");
    setCurrentStreamController(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (content: string) => {
    toast.success("Message copied to clipboard!");
  };

  const handleRegenerateMessage = async (messageId: number) => {
    // Find the message and regenerate from that point
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Get messages up to (but not including) the message to regenerate
    const previousMessages = messages.slice(0, messageIndex);
    
    // TODO: Implement regeneration logic
    toast.info("Regeneration feature coming soon!");
  };

  const handleEditMessage = async (messageId: number, newContent: string) => {
    try {
      await chatStorage.updateMessage(messageId, { content: newContent });
      await loadMessages();
      toast.success("Message updated!");
    } catch (error) {
      console.error('Failed to update message:', error);
      toast.error("Failed to update message");
    }
  };

  // Welcome screen when no conversation is selected
  if (!conversationId || !conversation) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-900 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              AI Chat
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Chat with AI using your own API keys. Everything runs locally in your browser — 
              your conversations and API keys never leave your device.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Supported Providers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {AI_PROVIDERS.map((provider) => (
                <div key={provider.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-2xl mb-2">{provider.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {provider.models.length} models
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Button onClick={onProviderSettingsOpen} size="lg" className="h-11 px-6">
              <Settings className="w-4 h-4 mr-2" />
              Configure API Keys
            </Button>
            <p className="text-xs text-gray-500">
              Add your API keys to start chatting. Keys are stored securely in your browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onCopy={handleCopyMessage}
              onRegenerate={handleRegenerateMessage}
              onEdit={handleEditMessage}
              providerInfo={{
                provider: conversation.provider,
                model: conversation.model,
              }}
            />
          ))}

          {/* Streaming message */}
          {isStreaming && streamingMessage && (
            <MessageBubble
              message={{
                id: 0,
                conversationId: conversationId,
                role: 'assistant',
                content: streamingMessage,
                timestamp: new Date(),
              }}
              isStreaming={true}
              onCopy={handleCopyMessage}
              providerInfo={{
                provider: conversation.provider,
                model: conversation.model,
              }}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-3">
            <div className="flex space-x-3">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${conversation.model}...`}
                  className="min-h-[50px] max-h-[200px] resize-none border-0 focus:ring-0 shadow-none"
                  disabled={isStreaming}
                />
              </div>
              <div className="flex flex-col justify-end space-y-2">
                {isStreaming ? (
                  <Button
                    onClick={handleStop}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <StopCircle className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isStreaming}
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                )}
              </div>
            </div>
            
            {/* Model info */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  <span className="mr-1">{AI_PROVIDERS.find(p => p.id === conversation.provider)?.icon}</span>
                  {conversation.model}
                </Badge>
              </div>
              <div className="text-xs text-gray-400">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}