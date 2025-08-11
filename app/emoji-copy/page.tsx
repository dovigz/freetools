"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import emojiKeywords from "emojilib";
import { Clock, Copy, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import emojiData from "unicode-emoji-json/data-by-group.json";

interface EmojiItem {
  emoji: string;
  name: string;
  keywords: string[];
  group: string;
}

const RECENT_EMOJIS_KEY = "freetools-recent-emojis";
const MAX_RECENT = 20;

function useLocalStorageArray(key: string, maxItems: number = 20) {
  const getStoredArray = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const addItem = (item: string) => {
    const current = getStoredArray();
    const updated = [item, ...current.filter((i) => i !== item)].slice(
      0,
      maxItems
    );
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  };

  const removeItem = (item: string) => {
    const current = getStoredArray();
    const updated = current.filter((i) => i !== item);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  };

  return { getStoredArray, addItem, removeItem };
}

export default function EmojiCopy() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const recentEmojisStorage = useLocalStorageArray(
    RECENT_EMOJIS_KEY,
    MAX_RECENT
  );
  const recentEmojis = recentEmojisStorage.getStoredArray();

  const allEmojis = useMemo(() => {
    const emojiList: EmojiItem[] = [];

    // First, add emojis from unicode-emoji-json with proper categorization
    emojiData.forEach((category: any) => {
      const groupName = category.name;
      category.emojis.forEach((emojiObj: any) => {
        const emoji = emojiObj.emoji;
        const keywords = emojiKeywords[emoji] || [];
        emojiList.push({
          emoji,
          name: emojiObj.name || "",
          keywords,
          group: groupName,
        });
      });
    });

    // Add any missing emojis from emojilib that aren't in unicode-emoji-json
    Object.keys(emojiKeywords).forEach((emoji) => {
      if (!emojiList.find((item) => item.emoji === emoji)) {
        emojiList.push({
          emoji,
          name: emojiKeywords[emoji][0] || emoji,
          keywords: emojiKeywords[emoji],
          group: "Other",
        });
      }
    });

    return emojiList;
  }, []);

  const groups = useMemo(() => {
    const groupSet = new Set(allEmojis.map((e) => e.group));
    return ["all", ...Array.from(groupSet).sort()];
  }, [allEmojis]);

  const filteredEmojis = useMemo(() => {
    let filtered = allEmojis;

    if (selectedGroup !== "all") {
      filtered = filtered.filter((emoji) => emoji.group === selectedGroup);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (emoji) =>
          emoji.name.toLowerCase().includes(query) ||
          emoji.keywords.some((keyword) =>
            keyword.toLowerCase().includes(query)
          )
      );
    }

    return filtered;
  }, [allEmojis, searchQuery, selectedGroup]);

  const copyEmoji = (emoji: string) => {
    navigator.clipboard
      .writeText(emoji)
      .then(() => {
        recentEmojisStorage.addItem(emoji);
        setUpdateTrigger((prev) => prev + 1); // Force re-render
      })
      .catch(() => {
        toast.error("Failed to copy emoji");
      });
  };

  const removeFromRecent = (emojiToRemove: string) => {
    recentEmojisStorage.removeItem(emojiToRemove);
    setUpdateTrigger((prev) => prev + 1); // Force re-render
  };

  return (
    <div className="w-full mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Emoji Copy</h1>
        <p className="text-muted-foreground">
          Copy emojis easily with search and recent history
        </p>
      </div>
      {/* Recent Emojis */}
      {recentEmojis.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">Recently Used</h2>
            </div>
            <div className="flex flex-wrap gap-1">
              {recentEmojis.map((emoji, index) => (
                <div key={`${emoji}-${index}`} className="relative group">
                  <Button
                    variant="ghost"
                    className="h-12 w-12 text-2xl p-0 hover:bg-muted/50"
                    onClick={() => copyEmoji(emoji)}
                    title={`Copy ${emoji}`}
                  >
                    {emoji}
                  </Button>
                  <button
                    className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs select-none"
                    style={{ userSelect: "none" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      removeFromRecent(emoji);
                    }}
                    title={`Remove ${emoji} from recent`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search emojis by name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Group Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <Badge
                key={group}
                variant={selectedGroup === group ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedGroup(group)}
              >
                {group === "all" ? "All" : group}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emoji Grid */}
      <Card>
        <CardContent className="p-4">
          {filteredEmojis.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {filteredEmojis.map((emojiItem, index) => (
                <Button
                  key={`${emojiItem.emoji}-${index}`}
                  variant="ghost"
                  className="h-12 w-12 text-2xl p-0 hover:bg-muted/50 group relative"
                  onClick={() => copyEmoji(emojiItem.emoji)}
                  title={emojiItem.name || emojiItem.emoji}
                >
                  {emojiItem.emoji}
                  <Copy className="absolute inset-0 m-auto h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😅</div>
              <p className="text-muted-foreground">
                No emojis found. Try a different search term.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
