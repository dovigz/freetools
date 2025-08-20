"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  AI_PROVIDERS,
  ChatAPI,
  getProvider,
  type ChatMessage,
} from "@/lib/ai-providers";
import {
  chatStorage,
  type Conversation,
  type Message,
} from "@/lib/chat-storage";
import {
  AlertCircle,
  MessageCircle,
  Send,
  Settings,
  StopCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BranchingMessageView } from "./BranchingMessageView";
import { DualModelSelector } from "./DualModelSelector";
import { MessageBubble } from "./MessageBubble";

interface ChatAreaProps {
  conversationId: number | null;
  conversation: Conversation | null;
  onProviderSettingsOpen: () => void;
  onConversationUpdate: () => void;
}

export function ChatArea({
  conversationId,
  conversation,
  onProviderSettingsOpen,
  onConversationUpdate,
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentStreamController, setCurrentStreamController] =
    useState<AbortController | null>(null);
  const [isDualMode, setIsDualMode] = useState(false);
  const [secondProvider, setSecondProvider] = useState<string>("");
  const [secondModel, setSecondModel] = useState<string>("");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(
    null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadMessages();
    } else {
      setMessages([]);
    }

    // Reset conversation-specific state when switching conversations
    setActiveThreadId(null);
    setReplyingToMessage(null);
  }, [conversationId]);

  // Update dual mode state when conversation changes
  useEffect(() => {
    if (conversation) {
      setIsDualMode(conversation.isDualMode || false);
      setSecondProvider(conversation.secondProvider || "");
      setSecondModel(conversation.secondModel || "");
    } else {
      setIsDualMode(false);
      setSecondProvider("");
      setSecondModel("");
    }
  }, [conversation]);

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
      const conversationMessages =
        await chatStorage.getMessageTree(conversationId);
      setMessages(conversationMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setError("Failed to load conversation messages");
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
        const { encryptionUtils } = await import("@/lib/ai-providers");
        return await encryptionUtils.decrypt(settings[0].apiKey);
      }
    } catch (error) {
      console.error("Failed to get API key:", error);
    }
    return null;
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !conversationId || !conversation || isStreaming)
      return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setError(null);

    try {
      if (isDualMode && secondProvider && secondModel) {
        // Dual mode: ask both models
        await handleDualModelSend(userMessage);
      } else if (replyingToMessage && activeThreadId) {
        // Replying to a specific thread
        await handleThreadReply(userMessage);
      } else {
        // Normal single model send
        await handleSingleModelSend(userMessage);
      }
    } catch (error: any) {
      console.error("Failed to send message:", error);
      setError(`Failed to send message: ${error.message}`);
    }
  };

  const handleSingleModelSend = async (userMessage: string) => {
    if (!conversationId || !conversation) return;

    // Add user message to database
    const userMessageId = await chatStorage.addMessage({
      conversationId,
      role: "user",
      content: userMessage,
      threadId: activeThreadId || undefined,
      parentMessageId: replyingToMessage?.id,
      provider: conversation.provider,
      model: conversation.model,
    });

    // Clear reply state
    setReplyingToMessage(null);
    setActiveThreadId(null);

    // Reload messages
    await loadMessages();

    // Get and send AI response
    await sendAIResponse(
      conversation.provider,
      conversation.model,
      userMessageId
    );
  };

  const handleDualModelSend = async (userMessage: string) => {
    if (!conversationId || !conversation) return;

    // Add user message to main thread
    const userMessageId = await chatStorage.addMessage({
      conversationId,
      role: "user",
      content: userMessage,
      provider: conversation.provider,
      model: conversation.model,
    });

    await loadMessages();

    // Create branches for both models
    const { userMessageId: branch1UserId, threadId: thread1 } =
      await chatStorage.createBranchFromMessage(
        conversationId,
        userMessageId,
        userMessage,
        conversation.provider,
        conversation.model
      );

    const { userMessageId: branch2UserId, threadId: thread2 } =
      await chatStorage.createBranchFromMessage(
        conversationId,
        userMessageId,
        userMessage,
        secondProvider,
        secondModel
      );

    await loadMessages();

    // Send to both models in parallel
    await Promise.all([
      sendAIResponseToBranch(
        conversation.provider,
        conversation.model,
        branch1UserId,
        thread1
      ),
      sendAIResponseToBranch(
        secondProvider,
        secondModel,
        branch2UserId,
        thread2
      ),
    ]);
  };

  const handleThreadReply = async (userMessage: string) => {
    if (!conversationId || !replyingToMessage || !activeThreadId) return;

    // Add user message to the specific thread
    const userMessageId = await chatStorage.addMessage({
      conversationId,
      role: "user",
      content: userMessage,
      threadId: activeThreadId,
      parentMessageId: replyingToMessage.id,
      provider: replyingToMessage.provider || conversation?.provider,
      model: replyingToMessage.model || conversation?.model,
    });

    // Clear reply state
    setReplyingToMessage(null);
    const currentProvider =
      replyingToMessage.provider || conversation?.provider!;
    const currentModel = replyingToMessage.model || conversation?.model!;
    setActiveThreadId(null);

    await loadMessages();

    // Send AI response in the same thread
    await sendAIResponseToBranch(
      currentProvider,
      currentModel,
      userMessageId,
      activeThreadId!
    );
  };

  const sendAIResponse = async (
    providerId: string,
    model: string,
    userMessageId: number
  ) => {
    const apiKey = await getAPIKey(providerId);
    if (!apiKey) {
      setError(
        `No API key found for ${providerId}. Please configure it in settings.`
      );
      return;
    }

    const provider = getProvider(providerId);
    if (!provider) {
      setError(`Provider ${providerId} not found.`);
      return;
    }

    // Get context messages for this conversation
    const allMessages = await chatStorage.getThreadMessages(
      conversationId!,
      undefined
    );
    const chatMessages: ChatMessage[] = allMessages.map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));

    await streamAIResponse(
      provider,
      apiKey,
      model,
      chatMessages,
      undefined,
      userMessageId
    );
  };

  const sendAIResponseToBranch = async (
    providerId: string,
    model: string,
    userMessageId: number,
    threadId: string
  ) => {
    const apiKey = await getAPIKey(providerId);
    if (!apiKey) {
      setError(
        `No API key found for ${providerId}. Please configure it in settings.`
      );
      return;
    }

    const provider = getProvider(providerId);
    if (!provider) {
      setError(`Provider ${providerId} not found.`);
      return;
    }

    // Get context messages for this thread
    const threadMessages = await chatStorage.getThreadMessages(
      conversationId!,
      threadId
    );
    const chatMessages: ChatMessage[] = threadMessages.map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content,
    }));

    await streamAIResponse(
      provider,
      apiKey,
      model,
      chatMessages,
      threadId,
      userMessageId
    );
  };

  const streamAIResponse = async (
    provider: any,
    apiKey: string,
    model: string,
    chatMessages: ChatMessage[],
    threadId?: string,
    userMessageId?: number
  ) => {
    setIsStreaming(true);
    setStreamingMessage("");

    const controller = new AbortController();
    setCurrentStreamController(controller);

    const chatAPI = new ChatAPI(provider, apiKey);
    let fullResponse = "";

    try {
      for await (const chunk of chatAPI.streamChat(chatMessages, model)) {
        if (controller.signal.aborted) break;

        fullResponse += chunk;
        setStreamingMessage(fullResponse);
      }

      if (fullResponse && !controller.signal.aborted) {
        await chatStorage.addMessage({
          conversationId: conversationId!,
          role: "assistant",
          content: fullResponse,
          threadId,
          parentMessageId: userMessageId,
          provider: provider.id,
          model,
        });

        // Update conversation title if it's the first exchange
        const allMessages = await chatStorage.getMessages(conversationId!);
        if (allMessages.length <= 2) {
          const firstUserMessage = allMessages.find((m) => m.role === "user");
          if (firstUserMessage) {
            const title =
              firstUserMessage.content.length > 50
                ? firstUserMessage.content.substring(0, 50) + "..."
                : firstUserMessage.content;
            await chatStorage.updateConversation(conversationId!, { title });
          }
        }

        await loadMessages();
      }
    } catch (streamError: any) {
      if (!controller.signal.aborted) {
        console.error("Streaming error:", streamError);
        setError(`Error: ${streamError.message}`);
      }
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (content: string) => {
    toast.success("Message copied to clipboard!");
  };

  const handleRegenerateMessage = async (messageId: number) => {
    // Find the message and regenerate from that point
    const messageIndex = messages.findIndex((m) => m.id === messageId);
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
      console.error("Failed to update message:", error);
      toast.error("Failed to update message");
    }
  };

  const handleReplyToThread = (threadId: string | null, message: Message) => {
    setActiveThreadId(threadId);
    setReplyingToMessage(message);
    textareaRef.current?.focus();
  };

  const handleToggleDualMode = async (
    enabled: boolean,
    provider?: string,
    model?: string
  ) => {
    setIsDualMode(enabled);
    if (enabled && provider && model) {
      setSecondProvider(provider);
      setSecondModel(model);

      // Save dual mode settings to conversation
      if (conversationId) {
        await chatStorage.updateConversation(conversationId, {
          isDualMode: true,
          secondProvider: provider,
          secondModel: model,
        });
        onConversationUpdate();
      }
    } else {
      setSecondProvider("");
      setSecondModel("");

      // Save disabled dual mode to conversation
      if (conversationId) {
        await chatStorage.updateConversation(conversationId, {
          isDualMode: false,
          secondProvider: undefined,
          secondModel: undefined,
        });
        onConversationUpdate();
      }
    }
  };

  const handleSecondModelChange = async (provider: string, model: string) => {
    setSecondProvider(provider);
    setSecondModel(model);

    // Save second model settings to conversation
    if (conversationId) {
      await chatStorage.updateConversation(conversationId, {
        secondProvider: provider,
        secondModel: model,
      });
      onConversationUpdate();
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
              Chat with AI using your own API keys. Everything runs locally in
              your browser — your conversations and API keys never leave your
              device.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Supported Providers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {AI_PROVIDERS.map((provider) => (
                <div
                  key={provider.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-2xl mb-2">{provider.icon}</div>
                  <div className="text-sm font-medium text-gray-900">
                    {provider.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {provider.models.length} models
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={onProviderSettingsOpen}
              size="lg"
              className="h-11 px-6"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure API Keys
            </Button>
            <p className="text-xs text-gray-500">
              Add your API keys to start chatting. Keys are stored securely in
              your browser.
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

          <BranchingMessageView
            messages={messages}
            onCopyMessage={handleCopyMessage}
            onRegenerateMessage={handleRegenerateMessage}
            onEditMessage={handleEditMessage}
            onReplyToThread={handleReplyToThread}
          />

          {/* Streaming message */}
          {isStreaming && streamingMessage && (
            <MessageBubble
              message={{
                id: 0,
                conversationId: conversationId,
                role: "assistant",
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
                  placeholder={
                    replyingToMessage
                      ? `Reply to ${replyingToMessage.provider || conversation.provider}...`
                      : isDualMode
                        ? `Ask ${conversation.model} and ${secondModel}...`
                        : `Message ${conversation.model}...`
                  }
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

            {/* Bottom bar with model selector and shortcuts */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <div className="flex items-center space-x-2">
                {replyingToMessage ? (
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      Replying to{" "}
                      {replyingToMessage.provider || conversation.provider}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyingToMessage(null);
                        setActiveThreadId(null);
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <DualModelSelector
                    currentProvider={conversation.provider}
                    currentModel={conversation.model}
                    onModelChange={async (provider, model) => {
                      if (conversationId) {
                        await chatStorage.updateConversation(conversationId, {
                          provider,
                          model,
                        });
                        onConversationUpdate();
                      }
                    }}
                    secondProvider={secondProvider}
                    secondModel={secondModel}
                    onSecondModelChange={handleSecondModelChange}
                    isDualMode={isDualMode}
                    onToggleDualMode={handleToggleDualMode}
                    onOpenSettings={onProviderSettingsOpen}
                  />
                )}
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
