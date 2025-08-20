"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  chatStorage,
  type ChatSettings,
  type Conversation,
  type Message,
} from "@/lib/chat-storage";
import { format } from "date-fns";
import {
  Database,
  Download,
  HardDrive,
  MessageSquare,
  Settings as SettingsIcon,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface DatabaseViewerProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export function DatabaseViewer({
  isOpen,
  onClose,
  onDataChanged,
}: DatabaseViewerProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<ChatSettings[]>([]);
  const [dbSize, setDbSize] = useState<string>("0 KB");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: string;
    id: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDatabaseData();
      estimateDbSize();
    }
  }, [isOpen]);

  const loadDatabaseData = async () => {
    try {
      const [convos, msgs, sets] = await Promise.all([
        chatStorage.getConversations(),
        getAllMessages(),
        chatStorage.getSettings(),
      ]);

      setConversations(convos);
      setMessages(msgs);
      setSettings(sets);
    } catch (error) {
      console.error("Failed to load database data:", error);
      toast.error("Failed to load database data");
    }
  };

  const getAllMessages = async (): Promise<Message[]> => {
    // Get all conversations first, then get all messages
    const allConversations = await chatStorage.getConversations();
    const allMessages: Message[] = [];

    for (const conversation of allConversations) {
      const conversationMessages = await chatStorage.getMessages(
        conversation.id!
      );
      allMessages.push(...conversationMessages);
    }

    return allMessages;
  };

  const estimateDbSize = async () => {
    try {
      // Rough estimation based on stored data
      const data = await chatStorage.exportAllData();
      const jsonString = JSON.stringify(data);
      const sizeInBytes = new Blob([jsonString]).size;

      if (sizeInBytes < 1024) {
        setDbSize(`${sizeInBytes} B`);
      } else if (sizeInBytes < 1024 * 1024) {
        setDbSize(`${(sizeInBytes / 1024).toFixed(1)} KB`);
      } else {
        setDbSize(`${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`);
      }
    } catch (error) {
      console.error("Failed to estimate DB size:", error);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await chatStorage.deleteMessage(messageId);
      await loadDatabaseData();
      await estimateDbSize();
      onDataChanged?.(); // Notify parent components to refresh
      toast.success("Message deleted");
    } catch (error) {
      console.error("Failed to delete message:", error);
      toast.error("Failed to delete message");
    }
  };

  const handleDeleteConversation = async (conversationId: number) => {
    try {
      await chatStorage.deleteConversation(conversationId);
      await loadDatabaseData();
      await estimateDbSize();
      onDataChanged?.(); // Notify parent components to refresh
      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  const handleClearAllData = async () => {
    try {
      await chatStorage.clearAllData();
      await loadDatabaseData();
      await estimateDbSize();
      onDataChanged?.(); // Notify parent components to refresh
      toast.success("All data cleared");
    } catch (error) {
      console.error("Failed to clear data:", error);
      toast.error("Failed to clear data");
    }
  };

  const handleExportData = async () => {
    try {
      const data = await chatStorage.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-chat-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported");
    } catch (error) {
      console.error("Failed to export data:", error);
      toast.error("Failed to export data");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50">
        <div className="fixed inset-4 bg-white rounded-lg shadow-lg z-50">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Local Database Viewer</h2>
                <Badge variant="outline" className="text-xs">
                  <HardDrive className="w-3 h-3 mr-1" />
                  {dbSize}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              <Tabs defaultValue="overview" className="h-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="conversations">Conversations</TabsTrigger>
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-8 h-8 text-blue-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {conversations.length}
                            </div>
                            <div className="text-sm text-gray-500">
                              Conversations
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-8 h-8 text-green-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {messages.length}
                            </div>
                            <div className="text-sm text-gray-500">
                              Messages
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <SettingsIcon className="w-8 h-8 text-purple-600" />
                          <div>
                            <div className="text-2xl font-bold">
                              {settings.length}
                            </div>
                            <div className="text-sm text-gray-500">
                              API Keys
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-sm">Privacy Notice</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600">
                      <p>
                        All your data is stored locally in your browser using
                        IndexedDB. Nothing is sent to our servers. You can:
                      </p>
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>Export your data for backup</li>
                        <li>Delete individual messages or conversations</li>
                        <li>Clear all data to start fresh</li>
                        <li>View exactly what's stored locally</li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="conversations" className="mt-4">
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {conversations.map((conversation) => (
                        <Card key={conversation.id}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">
                                  {conversation.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {conversation.provider} • {conversation.model}{" "}
                                  •{" "}
                                  {format(
                                    new Date(conversation.updatedAt),
                                    "MMM d, yyyy"
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setItemToDelete({
                                    type: "conversation",
                                    id: conversation.id!,
                                  });
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="messages" className="mt-4">
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {messages.map((message) => (
                        <Card key={message.id}>
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {message.role}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {format(
                                      new Date(message.timestamp),
                                      "MMM d, HH:mm"
                                    )}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-700 truncate">
                                  {message.content.substring(0, 100)}...
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setItemToDelete({
                                    type: "message",
                                    id: message.id!,
                                  });
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="settings" className="mt-4">
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {settings.map((setting) => (
                        <Card key={setting.id}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">
                                  {setting.provider}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Model: {setting.model} • API Key:{" "}
                                  {setting.apiKey ? "Configured" : "Not set"}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {setting.apiKey ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {itemToDelete ? `Delete ${itemToDelete.type}` : "Clear All Data"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete
                ? `Are you sure you want to delete this ${itemToDelete.type}? This action cannot be undone.`
                : "Are you sure you want to clear all data? This will delete all conversations, messages, and settings. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (itemToDelete) {
                  if (itemToDelete.type === "conversation") {
                    await handleDeleteConversation(itemToDelete.id);
                  } else if (itemToDelete.type === "message") {
                    await handleDeleteMessage(itemToDelete.id);
                  }
                  setItemToDelete(null);
                } else {
                  await handleClearAllData();
                }
                setDeleteDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
