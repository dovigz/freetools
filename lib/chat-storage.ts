import Dexie, { type Table } from "dexie";

export interface Conversation {
  id?: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  provider: string;
  model: string;
  // Dual model support
  secondProvider?: string;
  secondModel?: string;
  isDualMode?: boolean;
  isArchived?: boolean;
}

export interface Message {
  id?: number;
  conversationId: number;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  tokens?: number;
  isStreaming?: boolean;
  // Branching conversation support
  provider?: string;
  model?: string;
  threadId?: string; // Which conversation thread this belongs to
  parentMessageId?: number; // Which message this is replying to
  branchGroup?: string; // Groups messages that branch from the same point
}

export interface ChatSettings {
  id?: number;
  provider: string;
  apiKey: string; // Will be encrypted
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export class ChatDatabase extends Dexie {
  conversations!: Table<Conversation>;
  messages!: Table<Message>;
  settings!: Table<ChatSettings>;

  constructor() {
    super("ChatDatabase");
    this.version(1).stores({
      conversations:
        "++id, title, createdAt, updatedAt, provider, model, isArchived, isDualMode",
      messages:
        "++id, conversationId, role, timestamp, tokens, provider, model, threadId, parentMessageId, branchGroup",
      settings: "++id, provider, model",
    });
  }
}

export const db = new ChatDatabase();

// Helper functions for managing chat data
export const chatStorage = {
  // Conversations
  async createConversation(
    conversation: Omit<Conversation, "id" | "createdAt" | "updatedAt">
  ): Promise<number> {
    const now = new Date();
    return await db.conversations.add({
      ...conversation,
      createdAt: now,
      updatedAt: now,
    });
  },

  async getConversations(): Promise<Conversation[]> {
    return await db.conversations
      .orderBy("updatedAt")
      .reverse()
      .filter((c) => !c.isArchived)
      .toArray();
  },

  async updateConversation(
    id: number,
    updates: Partial<Conversation>
  ): Promise<void> {
    await db.conversations.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async deleteConversation(id: number): Promise<void> {
    await db.transaction("rw", db.conversations, db.messages, async () => {
      await db.conversations.delete(id);
      await db.messages.where("conversationId").equals(id).delete();
    });
  },

  async archiveConversation(id: number): Promise<void> {
    await db.conversations.update(id, { isArchived: true });
  },

  // Messages
  async addMessage(
    message: Omit<Message, "id" | "timestamp">
  ): Promise<number> {
    const messageId = await db.messages.add({
      ...message,
      timestamp: new Date(),
    });

    // Update conversation's updatedAt timestamp
    await db.conversations.update(message.conversationId, {
      updatedAt: new Date(),
    });

    return messageId;
  },

  async getMessages(conversationId: number): Promise<Message[]> {
    return await db.messages
      .where("conversationId")
      .equals(conversationId)
      .toArray()
      .then((messages) =>
        messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      );
  },

  async updateMessage(id: number, updates: Partial<Message>): Promise<void> {
    await db.messages.update(id, updates);
  },

  async deleteMessage(id: number): Promise<void> {
    await db.messages.delete(id);
  },

  // Settings
  async saveSettings(settings: Omit<ChatSettings, "id">): Promise<void> {
    const existing = await db.settings
      .where("provider")
      .equals(settings.provider)
      .first();
    if (existing) {
      await db.settings.update(existing.id!, settings);
    } else {
      await db.settings.add(settings);
    }
  },

  async getSettings(provider?: string): Promise<ChatSettings[]> {
    if (provider) {
      const setting = await db.settings
        .where("provider")
        .equals(provider)
        .first();
      return setting ? [setting] : [];
    }
    return await db.settings.toArray();
  },

  async deleteSettings(provider: string): Promise<void> {
    await db.settings.where("provider").equals(provider).delete();
  },

  // Search and utilities
  async searchConversations(query: string): Promise<Conversation[]> {
    return await db.conversations
      .filter(
        (c) =>
          !c.isArchived && c.title.toLowerCase().includes(query.toLowerCase())
      )
      .reverse()
      .toArray();
  },

  async searchMessages(
    query: string
  ): Promise<{ message: Message; conversation: Conversation }[]> {
    const messages = await db.messages
      .filter((m) => m.content.toLowerCase().includes(query.toLowerCase()))
      .toArray();

    const results = [];
    for (const message of messages) {
      const conversation = await db.conversations.get(message.conversationId);
      if (conversation && !conversation.isArchived) {
        results.push({ message, conversation });
      }
    }
    return results;
  },

  // Export/Import
  async exportAllData() {
    const conversations = await db.conversations.toArray();
    const messages = await db.messages.toArray();
    const settings = await db.settings.toArray();

    return {
      conversations,
      messages,
      settings,
      exportedAt: new Date().toISOString(),
      version: 1,
    };
  },

  async importData(data: any): Promise<void> {
    await db.transaction(
      "rw",
      db.conversations,
      db.messages,
      db.settings,
      async () => {
        if (data.conversations) {
          await db.conversations.bulkAdd(data.conversations);
        }
        if (data.messages) {
          await db.messages.bulkAdd(data.messages);
        }
        if (data.settings) {
          await db.settings.bulkAdd(data.settings);
        }
      }
    );
  },

  async clearAllData(): Promise<void> {
    await db.transaction(
      "rw",
      db.conversations,
      db.messages,
      db.settings,
      async () => {
        await db.conversations.clear();
        await db.messages.clear();
        await db.settings.clear();
      }
    );
  },

  // Branching conversation helpers
  async createBranchFromMessage(
    conversationId: number,
    parentMessageId: number,
    userMessage: string,
    provider: string,
    model: string
  ): Promise<{ userMessageId: number; threadId: string }> {
    const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const userMessageId = await chatStorage.addMessage({
      conversationId,
      role: "user",
      content: userMessage,
      threadId,
      parentMessageId,
      provider,
      model,
    });

    return { userMessageId, threadId };
  },

  async addBranchResponse(
    conversationId: number,
    userMessageId: number,
    threadId: string,
    response: string,
    provider: string,
    model: string,
    tokens?: number
  ): Promise<number> {
    return await chatStorage.addMessage({
      conversationId,
      role: "assistant",
      content: response,
      threadId,
      parentMessageId: userMessageId,
      provider,
      model,
      tokens,
    });
  },

  async getMessageTree(conversationId: number): Promise<Message[]> {
    const messages = await chatStorage.getMessages(conversationId);

    // Sort messages to build conversation tree
    // Main thread first (no threadId), then by timestamp
    return messages.sort((a, b) => {
      // Main thread messages first
      if (!a.threadId && b.threadId) return -1;
      if (a.threadId && !b.threadId) return 1;

      // Then by timestamp
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
  },

  async getThreadMessages(
    conversationId: number,
    threadId?: string
  ): Promise<Message[]> {
    const allMessages = await chatStorage.getMessages(conversationId);

    if (!threadId) {
      // Return main thread (messages without threadId)
      return allMessages
        .filter((m) => !m.threadId)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    // Return specific thread
    return allMessages
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  },

  async getBranchingPoint(
    conversationId: number,
    messageId: number
  ): Promise<Message[]> {
    // Get all messages that branch from the given message
    return await db.messages
      .where("conversationId")
      .equals(conversationId)
      .and((m) => m.parentMessageId === messageId)
      .toArray();
  },
};
