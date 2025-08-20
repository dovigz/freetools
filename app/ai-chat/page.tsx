"use client";

import { ChatArea } from "@/components/ai-chat/ChatArea";
import { ChatSidebar } from "@/components/ai-chat/ChatSidebar";
import { DatabaseViewer } from "@/components/ai-chat/DatabaseViewer";
import { ModelSelector } from "@/components/ai-chat/ModelSelector";
import { ProviderPanel } from "@/components/ai-chat/ProviderPanel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { chatStorage, type Conversation } from "@/lib/chat-storage";
import { Database, Menu, Settings } from "lucide-react";
import { useEffect, useState } from "react";

export default function AIChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    number | null
  >(null);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [showProviderPanel, setShowProviderPanel] = useState(false);
  const [showDatabaseViewer, setShowDatabaseViewer] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Update active conversation when ID changes
  useEffect(() => {
    if (activeConversationId) {
      const conversation = conversations.find(
        (c) => c.id === activeConversationId
      );
      setActiveConversation(conversation || null);
    } else {
      setActiveConversation(null);
    }
  }, [activeConversationId, conversations]);

  const loadConversations = async () => {
    try {
      const convos = await chatStorage.getConversations();
      setConversations(convos);

      // Check if the active conversation still exists
      if (
        activeConversationId &&
        !convos.find((c) => c.id === activeConversationId)
      ) {
        setActiveConversationId(null);
        setActiveConversation(null);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const handleNewChat = async () => {
    try {
      const newConvId = await chatStorage.createConversation({
        title: "New Chat",
        provider: "openai",
        model: "gpt-4o-mini",
      });
      await loadConversations();
      setActiveConversationId(newConvId);
      setSidebarOpen(false);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const handleSelectConversation = (id: number) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden p-2">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <ChatSidebar
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  onSelectConversation={handleSelectConversation}
                  onNewChat={handleNewChat}
                  onConversationsChanged={loadConversations}
                  onOpenSettings={() => setShowProviderPanel(true)}
                  onOpenDatabase={() => setShowDatabaseViewer(true)}
                />
              </SheetContent>
            </Sheet>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">AI Chat</span>
            </div>
          </div>

          {/* Center - Model Selector */}
          {activeConversation && (
            <div className="flex items-center space-x-2">
              <ModelSelector
                currentProvider={activeConversation.provider}
                currentModel={activeConversation.model}
                onModelChange={async (provider, model) => {
                  if (activeConversationId) {
                    await chatStorage.updateConversation(activeConversationId, {
                      provider,
                      model,
                    });
                    await loadConversations();
                  }
                }}
                onOpenSettings={() => setShowProviderPanel(true)}
              />
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDatabaseViewer(true)}
              className="p-2"
              title="View Local Database"
            >
              <Database className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProviderPanel(!showProviderPanel)}
              className="p-2"
              title="Configure API Keys"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 flex-shrink-0">
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            onConversationsChanged={loadConversations}
            onOpenSettings={() => setShowProviderPanel(true)}
            onOpenDatabase={() => setShowDatabaseViewer(true)}
          />
        </div>

        {/* Chat Area */}
        <ChatArea
          conversationId={activeConversationId}
          conversation={activeConversation}
          onProviderSettingsOpen={() => setShowProviderPanel(true)}
          onConversationUpdate={loadConversations}
        />

        {/* Provider Panel */}
        <ProviderPanel
          isOpen={showProviderPanel}
          onClose={() => setShowProviderPanel(false)}
        />
      </div>

      {/* Database Viewer */}
      <DatabaseViewer
        isOpen={showDatabaseViewer}
        onClose={() => setShowDatabaseViewer(false)}
        onDataChanged={loadConversations}
      />
    </div>
  );
}
