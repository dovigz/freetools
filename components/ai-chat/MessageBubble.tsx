"use client";

import { Button } from "@/components/ui/button";
import { AI_PROVIDERS } from "@/lib/ai-providers";
import { type Message } from "@/lib/chat-storage";
import { format } from "date-fns";
import { Check, Copy, Edit3, RotateCcw } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  onCopy?: (content: string) => void;
  onRegenerate?: (messageId: number) => void;
  onEdit?: (messageId: number, newContent: string) => void;
  providerInfo?: {
    provider: string;
    model: string;
  };
}

export function MessageBubble({
  message,
  isStreaming = false,
  onCopy,
  onRegenerate,
  onEdit,
  providerInfo,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      onCopy?.(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const handleEdit = () => {
    if (editContent.trim() !== message.content) {
      onEdit?.(message.id!, editContent.trim());
    }
    setIsEditing(false);
  };

  const getProviderIcon = () => {
    if (!providerInfo) return "🤖";
    const provider = AI_PROVIDERS.find((p) => p.id === providerInfo.provider);
    return provider?.icon || "🤖";
  };

  const formatTimestamp = (timestamp: Date) => {
    return format(new Date(timestamp), "HH:mm");
  };

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} group mb-4`}
    >
      <div
        className={`flex items-start space-x-3 max-w-[75%] ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
            isUser ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          {isUser ? "U" : getProviderIcon()}
        </div>

        {/* Message Content */}
        <div
          className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
        >
          {/* Message Bubble */}
          <div
            className={`rounded-lg px-4 py-3 ${
              isUser ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
            } ${isStreaming ? "opacity-80" : ""}`}
          >
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[60px] p-2 text-sm border rounded resize-none bg-white text-gray-900"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleEdit}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(message.content);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm leading-relaxed">
                {isAssistant ? (
                  <ReactMarkdown
                    components={{
                      code: ({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }) => {
                        return !inline ? (
                          <pre className="bg-gray-800 text-gray-100 rounded p-3 overflow-x-auto text-sm my-2">
                            <code {...props}>{children}</code>
                          </pre>
                        ) : (
                          <code
                            className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-sm"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-4 mb-2">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-4 mb-2">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-1">{children}</li>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div
            className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}
          >
            <span>{formatTimestamp(message.timestamp)}</span>
            {isStreaming && (
              <span className="flex items-center">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse mr-1"></div>
                Generating
              </span>
            )}
            {message.tokens && <span>{message.tokens} tokens</span>}
          </div>

          {/* Action Buttons */}
          {!isEditing && (
            <div
              className={`flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                isUser ? "flex-row-reverse" : ""
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>

              {isUser && onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              )}

              {isAssistant && onRegenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRegenerate(message.id!)}
                  className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
