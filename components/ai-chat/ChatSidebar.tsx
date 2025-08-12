"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquarePlus, 
  Search, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Calendar,
  Clock,
  Settings,
  Database
} from "lucide-react";
import { chatStorage, type Conversation } from "@/lib/chat-storage";
import { AI_PROVIDERS } from "@/lib/ai-providers";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewChat: () => void;
  onConversationsChanged: () => void;
  onOpenSettings: () => void;
  onOpenDatabase: () => void;
}

interface GroupedConversations {
  today: Conversation[];
  yesterday: Conversation[];
  thisWeek: Conversation[];
  older: Conversation[];
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onConversationsChanged,
  onOpenSettings,
  onOpenDatabase,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(conversations);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<number | null>(null);
  const [editingConversation, setEditingConversation] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Filter conversations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [conversations, searchQuery]);

  // Group conversations by date
  const groupConversations = (convs: Conversation[]): GroupedConversations => {
    const groups: GroupedConversations = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    convs.forEach(conv => {
      const date = new Date(conv.updatedAt);
      if (isToday(date)) {
        groups.today.push(conv);
      } else if (isYesterday(date)) {
        groups.yesterday.push(conv);
      } else if (isThisWeek(date)) {
        groups.thisWeek.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  };

  const groupedConversations = groupConversations(filteredConversations);

  const handleDeleteConversation = async (id: number) => {
    try {
      await chatStorage.deleteConversation(id);
      onConversationsChanged();
      if (activeConversationId === id) {
        // If we're deleting the active conversation, clear the selection
        onSelectConversation(-1);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  const handleEditTitle = async (id: number, newTitle: string) => {
    if (!newTitle.trim()) return;
    
    try {
      await chatStorage.updateConversation(id, { title: newTitle.trim() });
      onConversationsChanged();
    } catch (error) {
      console.error('Failed to update conversation title:', error);
    }
    setEditingConversation(null);
    setEditTitle("");
  };

  const startEditing = (conversation: Conversation) => {
    setEditingConversation(conversation.id!);
    setEditTitle(conversation.title);
  };

  const getProviderIcon = (providerId: string) => {
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    return provider?.icon || '🤖';
  };

  const formatRelativeTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE');
    } else {
      return format(date, 'MMM d');
    }
  };

  const ConversationItem = ({ conversation }: { conversation: Conversation }) => {
    const isActive = activeConversationId === conversation.id;
    const isEditing = editingConversation === conversation.id;

    return (
      <div className={`group relative rounded-lg p-2 transition-colors ${
        isActive ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'
      }`}>
        <div className="flex items-start justify-between">
          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => !isEditing && onSelectConversation(conversation.id!)}
          >
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => handleEditTitle(conversation.id!, editTitle)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEditTitle(conversation.id!, editTitle);
                  } else if (e.key === 'Escape') {
                    setEditingConversation(null);
                    setEditTitle("");
                  }
                }}
                className="h-6 text-sm"
                autoFocus
              />
            ) : (
              <div>
                <h4 className={`text-sm font-medium truncate ${
                  isActive ? 'text-purple-900' : 'text-gray-900'
                }`}>
                  {conversation.title}
                </h4>
                <div className="flex items-center mt-1 space-x-2">
                  <Badge variant="outline" className="text-xs py-0 px-1">
                    <span className="mr-1">{getProviderIcon(conversation.provider)}</span>
                    {conversation.model}
                  </Badge>
                  <span className={`text-xs ${
                    isActive ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {formatRelativeTime(new Date(conversation.updatedAt))}
                  </span>
                </div>
              </div>
            )}
          </div>

          {!isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => startEditing(conversation)}>
                  <Edit3 className="w-3 h-3 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setConversationToDelete(conversation.id!);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };

  const ConversationGroup = ({ 
    title, 
    conversations: groupConversations, 
    icon 
  }: { 
    title: string; 
    conversations: Conversation[]; 
    icon: React.ReactNode;
  }) => {
    if (groupConversations.length === 0) return null;

    return (
      <div>
        <div className="flex items-center mb-2">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {title}
          </h3>
        </div>
        <div className="space-y-1">
          {groupConversations.map((conversation) => (
            <ConversationItem key={conversation.id} conversation={conversation} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white border-r">
        {/* Header */}
        <div className="p-3 border-b space-y-2">
          <Button 
            onClick={onNewChat} 
            variant="outline" 
            className="w-full h-8 text-sm"
          >
            <MessageSquarePlus className="w-3 h-3 mr-2" />
            New Chat
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={onOpenSettings} 
              variant="ghost" 
              className="h-8 text-xs text-gray-600 hover:text-gray-900"
            >
              <Settings className="w-3 h-3 mr-1" />
              API Keys
            </Button>
            <Button 
              onClick={onOpenDatabase} 
              variant="ghost" 
              className="h-8 text-xs text-gray-600 hover:text-gray-900"
            >
              <Database className="w-3 h-3 mr-1" />
              Local Data
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm border-gray-200"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 p-3">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-gray-400">
                {searchQuery ? (
                  <>
                    <Search className="w-6 h-6 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-500">No conversations found</p>
                    <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                  </>
                ) : (
                  <>
                    <MessageSquarePlus className="w-6 h-6 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-500">No conversations yet</p>
                    <p className="text-xs text-gray-400 mt-1">Start a new chat to begin</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <ConversationGroup
                title="Today"
                conversations={groupedConversations.today}
                icon={<Clock className="w-3 h-3" />}
              />
              <ConversationGroup
                title="Yesterday"
                conversations={groupedConversations.yesterday}
                icon={<Clock className="w-3 h-3" />}
              />
              <ConversationGroup
                title="This Week"
                conversations={groupedConversations.thisWeek}
                icon={<Calendar className="w-3 h-3" />}
              />
              <ConversationGroup
                title="Older"
                conversations={groupedConversations.older}
                icon={<Calendar className="w-3 h-3" />}
              />
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => conversationToDelete && handleDeleteConversation(conversationToDelete)}
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