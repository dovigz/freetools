"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageBubble } from "./MessageBubble";
import { 
  GitBranch, 
  MessageSquare, 
  ArrowRight,
  Plus
} from "lucide-react";
import { type Message } from "@/lib/chat-storage";
import { AI_PROVIDERS } from "@/lib/ai-providers";

interface MessageThread {
  id: string;
  messages: Message[];
  provider: string;
  model: string;
}

interface BranchingMessageViewProps {
  messages: Message[];
  onCopyMessage: (content: string) => void;
  onRegenerateMessage: (messageId: number) => void;
  onEditMessage: (messageId: number, newContent: string) => void;
  onReplyToThread: (threadId: string | null, message: Message) => void;
}

export function BranchingMessageView({
  messages,
  onCopyMessage,
  onRegenerateMessage,
  onEditMessage,
  onReplyToThread,
}: BranchingMessageViewProps) {
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());

  // Group messages into threads
  const groupMessagesByThread = (): { mainThread: Message[]; branches: MessageThread[] } => {
    const mainThread: Message[] = [];
    const branchMap: Record<string, Message[]> = {};

    messages.forEach(message => {
      if (!message.threadId) {
        mainThread.push(message);
      } else {
        if (!branchMap[message.threadId]) {
          branchMap[message.threadId] = [];
        }
        branchMap[message.threadId].push(message);
      }
    });

    const branches: MessageThread[] = Object.entries(branchMap).map(([threadId, threadMessages]) => {
      const firstMessage = threadMessages[0];
      return {
        id: threadId,
        messages: threadMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
        provider: firstMessage.provider || 'unknown',
        model: firstMessage.model || 'unknown',
      };
    });

    return { 
      mainThread: mainThread.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
      branches 
    };
  };

  const { mainThread, branches } = groupMessagesByThread();

  const toggleBranch = (threadId: string) => {
    const newExpanded = new Set(expandedBranches);
    if (newExpanded.has(threadId)) {
      newExpanded.delete(threadId);
    } else {
      newExpanded.add(threadId);
    }
    setExpandedBranches(newExpanded);
  };

  const getProviderIcon = (providerId: string) => {
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    return provider?.icon || '🤖';
  };

  const findBranchesForMessage = (messageId: number): MessageThread[] => {
    return branches.filter(branch => 
      branch.messages.some(m => m.parentMessageId === messageId)
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Thread */}
      {mainThread.map((message, index) => {
        const messageBranches = findBranchesForMessage(message.id!);
        const hasReplies = messageBranches.length > 0;

        return (
          <div key={message.id} className="relative">
            {/* Main Message */}
            <div className="relative">
              <MessageBubble
                message={message}
                onCopy={onCopyMessage}
                onRegenerate={onRegenerateMessage}
                onEdit={onEditMessage}
                providerInfo={message.provider ? {
                  provider: message.provider,
                  model: message.model || ''
                } : undefined}
              />

              {/* Reply button for assistant messages */}
              {message.role === 'assistant' && (
                <div className="absolute -bottom-2 left-12">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReplyToThread(null, message)}
                    className="h-6 px-2 text-xs bg-white border shadow-sm hover:bg-gray-50"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                </div>
              )}
            </div>

            {/* Branch Indicator & Controls */}
            {hasReplies && (
              <div className="ml-8 mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-px bg-gray-300"></div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      messageBranches.forEach(branch => toggleBranch(branch.id));
                    }}
                    className="h-6 px-2 text-xs text-gray-600 hover:text-gray-900"
                  >
                    <GitBranch className="w-3 h-3 mr-1" />
                    {messageBranches.length} conversation{messageBranches.length !== 1 ? 's' : ''}
                  </Button>
                </div>

                {/* Show branch previews */}
                <div className="mt-2 space-y-1">
                  {messageBranches.map(branch => (
                    <div key={branch.id} className="ml-4">
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border-l-2 border-gray-300">
                        <Badge variant="outline" className="text-xs">
                          <span className="mr-1">{getProviderIcon(branch.provider)}</span>
                          {branch.model}
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {branch.messages.length} message{branch.messages.length !== 1 ? 's' : ''}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBranch(branch.id)}
                          className="h-5 px-1 text-xs ml-auto"
                        >
                          {expandedBranches.has(branch.id) ? 'Collapse' : 'Expand'}
                        </Button>
                      </div>

                      {/* Expanded Branch Messages */}
                      {expandedBranches.has(branch.id) && (
                        <div className="ml-4 mt-2 pl-4 border-l-2 border-blue-200 space-y-3">
                          {branch.messages.map(branchMessage => (
                            <div key={branchMessage.id} className="relative">
                              <MessageBubble
                                message={branchMessage}
                                onCopy={onCopyMessage}
                                onRegenerate={onRegenerateMessage}
                                onEdit={onEditMessage}
                                providerInfo={{
                                  provider: branch.provider,
                                  model: branch.model,
                                }}
                              />

                              {/* Continue this thread button */}
                              {branchMessage.role === 'assistant' && 
                               branchMessage === branch.messages[branch.messages.length - 1] && (
                                <div className="absolute -bottom-2 left-12">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onReplyToThread(branch.id, branchMessage)}
                                    className="h-6 px-2 text-xs bg-white border shadow-sm hover:bg-gray-50"
                                  >
                                    <ArrowRight className="w-3 h-3 mr-1" />
                                    Continue
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Show if no messages */}
      {mainThread.length === 0 && branches.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>No messages yet. Start a conversation!</p>
        </div>
      )}
    </div>
  );
}