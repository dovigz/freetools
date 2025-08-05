"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { diffChars, diffLines, diffWordsWithSpace } from "diff";
import { useCallback, useEffect, useState } from "react";
// Text comparison algorithm implementation
type DiffResult = {
  lines: Array<{
    type: "unchanged" | "modified" | "added" | "deleted";
    leftLine: number | null;
    rightLine: number | null;
    leftContent: Array<{
      type: "unchanged" | "added" | "deleted";
      text: string;
    }>;
    rightContent: Array<{
      type: "unchanged" | "added" | "deleted";
      text: string;
    }>;
  }>;
  stats: {
    additions: number;
    deletions: number;
    modifications: number;
  };
};

// Whitespace normalization function
function normalizeWhitespace(s: string): string {
  return s.replace(/[ \t]+/g, " ").trimEnd();
}

// Check if two strings have significant whitespace differences
function hasSignificantWhitespaceChanges(left: string, right: string): boolean {
  // If normalized versions are the same but originals differ, it's whitespace-only
  const normalizedLeft = normalizeWhitespace(left);
  const normalizedRight = normalizeWhitespace(right);
  
  return normalizedLeft === normalizedRight && left !== right;
}

// Character-level diff for precise whitespace highlighting
function charDiff(
  left: string,
  right: string
): {
  leftSegments: Array<{
    type: "unchanged" | "added" | "deleted";
    text: string;
  }>;
  rightSegments: Array<{
    type: "unchanged" | "added" | "deleted";
    text: string;
  }>;
} {
  const changes = diffChars(left, right);
  const leftSegments: Array<{
    type: "unchanged" | "added" | "deleted";
    text: string;
  }> = [];
  const rightSegments: Array<{
    type: "unchanged" | "added" | "deleted";
    text: string;
  }> = [];

  for (const change of changes) {
    if (change.added) {
      rightSegments.push({ type: "added", text: change.value });
    } else if (change.removed) {
      leftSegments.push({ type: "deleted", text: change.value });
    } else {
      leftSegments.push({ type: "unchanged", text: change.value });
      rightSegments.push({ type: "unchanged", text: change.value });
    }
  }

  return { leftSegments, rightSegments };
}

// Word-level diff using jsdiff for cleaner JSON/code highlighting
function wordDiff(
  left: string,
  right: string
): {
  leftSegments: Array<{
    type: "unchanged" | "added" | "deleted";
    text: string;
  }>;
  rightSegments: Array<{
    type: "unchanged" | "added" | "deleted";
    text: string;
  }>;
} {
  const changes = diffWordsWithSpace(left, right);
  const leftSegments: Array<{
    type: "unchanged" | "added" | "deleted";
    text: string;
  }> = [];
  const rightSegments: Array<{
    type: "unchanged" | "added" | "deleted";
    text: string;
  }> = [];

  for (const change of changes) {
    if (change.added) {
      rightSegments.push({ type: "added", text: change.value });
    } else if (change.removed) {
      leftSegments.push({ type: "deleted", text: change.value });
    } else {
      leftSegments.push({ type: "unchanged", text: change.value });
      rightSegments.push({ type: "unchanged", text: change.value });
    }
  }

  return { leftSegments, rightSegments };
}

const computeTextDiff = (left: string, right: string): DiffResult => {
  // Keep original lines for display
  const leftLines = left.split("\n");
  const rightLines = right.split("\n");

  // Normalize for comparison only
  const normalizedLeft = leftLines.map(normalizeWhitespace).join("\n");
  const normalizedRight = rightLines.map(normalizeWhitespace).join("\n");

  // Use jsdiff for line-level diffing with ignoreWhitespace for better matching
  const changes = diffLines(normalizedLeft, normalizedRight, {
    ignoreWhitespace: true,
  });

  const result: DiffResult["lines"] = [];
  const stats = { additions: 0, deletions: 0, modifications: 0 };

  let leftLineIndex = 0;
  let rightLineIndex = 0;

  for (const change of changes) {
    const lines = change.value.split("\n");
    // Remove empty last line if it exists (from split behavior)
    if (lines[lines.length - 1] === "") {
      lines.pop();
    }

    if (change.added) {
      // Added lines - use original text
      for (let i = 0; i < lines.length; i++) {
        const originalLine = rightLines[rightLineIndex + i] || lines[i];
        result.push({
          type: "added",
          leftLine: null,
          rightLine: rightLineIndex + i + 1,
          leftContent: [],
          rightContent: [{ type: "added", text: originalLine }],
        });
        stats.additions++;
      }
      rightLineIndex += lines.length;
    } else if (change.removed) {
      // Deleted lines - use original text
      for (let i = 0; i < lines.length; i++) {
        const originalLine = leftLines[leftLineIndex + i] || lines[i];
        result.push({
          type: "deleted",
          leftLine: leftLineIndex + i + 1,
          rightLine: null,
          leftContent: [{ type: "deleted", text: originalLine }],
          rightContent: [],
        });
        stats.deletions++;
      }
      leftLineIndex += lines.length;
    } else {
      // Unchanged lines - use original text, but check for whitespace-only changes
      for (let i = 0; i < lines.length; i++) {
        const originalLeftLine = leftLines[leftLineIndex + i] || lines[i];
        const originalRightLine = rightLines[rightLineIndex + i] || lines[i];
        
        // Check if this is actually a whitespace-only modification
        if (hasSignificantWhitespaceChanges(originalLeftLine, originalRightLine)) {
          // Convert to modification with character-level diff for precise whitespace highlighting
          const { leftSegments, rightSegments } = charDiff(originalLeftLine, originalRightLine);
          result.push({
            type: "modified",
            leftLine: leftLineIndex + i + 1,
            rightLine: rightLineIndex + i + 1,
            leftContent: leftSegments,
            rightContent: rightSegments,
          });
          stats.modifications++;
        } else {
          // Truly unchanged line
          result.push({
            type: "unchanged",
            leftLine: leftLineIndex + i + 1,
            rightLine: rightLineIndex + i + 1,
            leftContent: [{ type: "unchanged", text: originalLeftLine }],
            rightContent: [{ type: "unchanged", text: originalRightLine }],
          });
        }
      }
      leftLineIndex += lines.length;
      rightLineIndex += lines.length;
    }
  }

  // Post-process to identify modified lines with smart lookahead search
  const processedResult: DiffResult["lines"] = [];
  const processed = new Set<number>(); // Track processed indices

  for (let i = 0; i < result.length; i++) {
    if (processed.has(i)) continue; // Skip already processed items

    const current = result[i];

    if (current.type === "deleted") {
      // Look ahead up to 3 entries for a matching added line
      let foundMatch = false;
      for (let j = i + 1; j < Math.min(i + 4, result.length); j++) {
        if (processed.has(j)) continue;

        const candidate = result[j];
        if (candidate.type === "added") {
          const leftText = current.leftContent[0]?.text || "";
          const rightText = candidate.rightContent[0]?.text || "";

          if (leftText.trim() && rightText.trim()) {
            // Use word-level diff to determine if it's a modification
            const { leftSegments, rightSegments } = wordDiff(
              leftText,
              rightText
            );

            // Count unchanged words for better similarity scoring
            const unchangedWords = leftSegments
              .filter((s) => s.type === "unchanged")
              .reduce((sum, s) => sum + s.text.split(/\s+/).length, 0);
            const totalWords = Math.max(
              leftText.split(/\s+/).length,
              rightText.split(/\s+/).length
            );
            const similarity = totalWords > 0 ? unchangedWords / totalWords : 0;

            // Use 50% similarity threshold for more accurate detection
            if (similarity > 0.5) {
              // Treat as modification
              processedResult.push({
                type: "modified",
                leftLine: current.leftLine,
                rightLine: candidate.rightLine,
                leftContent: leftSegments,
                rightContent: rightSegments,
              });
              stats.modifications++;
              stats.deletions--;
              stats.additions--;
              processed.add(i); // Mark current as processed
              processed.add(j); // Mark matched candidate as processed
              foundMatch = true;
              break;
            }
          }
        }
      }

      if (!foundMatch) {
        processedResult.push(current);
      }
    } else {
      processedResult.push(current);
    }
  }

  return { lines: processedResult, stats };
};

const getLineClassName = (type: string): string => {
  // Only return empty string - no background colors for text content
  return "";
};

const getLineNumberClassName = (type: string): string => {
  switch (type) {
    case "added":
      return "border-l-4 border-green-500 bg-green-50 dark:bg-green-900/30";
    case "deleted":
      return "border-l-4 border-red-500 bg-red-50 dark:bg-red-900/30";
    case "modified":
      return "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/30";
    default:
      return "border-l-4 border-transparent";
  }
};

const getSegmentClassName = (type: string): string => {
  switch (type) {
    case "added":
      return "bg-green-200 dark:bg-green-800/60";
    case "deleted":
      return "bg-red-200 dark:bg-red-800/60";
    default:
      return "";
  }
};

const renderWhitespace = (text: string): string => {
  return text.replace(/ /g, "·").replace(/\t/g, "→");
};

const SAMPLE_TEXT_LEFT = `Welcome to the comparison tool
This line will be modified slightly
This line stays exactly the same
Line 4: Contains some    extra    spaces
Another unchanged line
This line will be completely removed
Extra line only on left
Final line with tabs	and	spaces
Mixed content: JSON {"key": "value"}
Line with symbols: @#$%^&*()
The quick brown fox jumps
Shared ending line`;

const SAMPLE_TEXT_RIGHT = `Welcome to the comparison tool
This line will be modified significantly  
This line stays exactly the same
Line 4: Contains some  fewer  spaces
Another unchanged line
New line inserted here instead
Final line with tabs		and		spaces
Mixed content: JSON {"key": "new_value", "added": true}  
Line with symbols: @#$%^&*()_+
The quick brown fox jumps over the lazy dog
Additional line at the end
Shared ending line`;

export default function TextCompare() {
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showWhitespace, setShowWhitespace] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedLeft = localStorage.getItem("text-compare-left");
    const savedRight = localStorage.getItem("text-compare-right");
    if (savedLeft) setLeftText(savedLeft);
    if (savedRight) setRightText(savedRight);
  }, []);

  // Save to localStorage when text changes
  useEffect(() => {
    localStorage.setItem("text-compare-left", leftText);
  }, [leftText]);

  useEffect(() => {
    localStorage.setItem("text-compare-right", rightText);
  }, [rightText]);

  const handleCompare = useCallback(() => {
    setIsComparing(true);

    // Add small delay for better UX
    setTimeout(() => {
      const result = computeTextDiff(leftText, rightText);
      setDiffResult(result);
      setIsComparing(false);
    }, 100);
  }, [leftText, rightText]);

  const handleClear = useCallback(() => {
    setLeftText("");
    setRightText("");
    setDiffResult(null);
    localStorage.removeItem("text-compare-left");
    localStorage.removeItem("text-compare-right");
  }, []);

  const handleSwitchTexts = useCallback(() => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
    setDiffResult(null); // Clear diff result when switching
  }, [leftText, rightText]);

  const loadSampleTexts = useCallback(() => {
    setLeftText(SAMPLE_TEXT_LEFT);
    setRightText(SAMPLE_TEXT_RIGHT);
    setDiffResult(null); // Clear diff result when loading samples
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Text Compare</h1>
          <p className="text-muted-foreground">
            Compare two texts and find differences line by line
          </p>
        </div>

        {/* Input Section */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Original Text</h3>
                <Badge variant="outline">
                  {leftText.split("\n").length} lines
                </Badge>
              </div>
              <Textarea
                placeholder="Enter your original text here..."
                value={leftText}
                onChange={(e) => setLeftText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Modified Text</h3>
                <Badge variant="outline">
                  {rightText.split("\n").length} lines
                </Badge>
              </div>
              <Textarea
                placeholder="Enter your modified text here..."
                value={rightText}
                onChange={(e) => setRightText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              onClick={handleCompare}
              disabled={!leftText.trim() || !rightText.trim() || isComparing}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isComparing ? "Comparing..." : "Compare!"}
            </Button>
            <Button variant="outline" onClick={handleSwitchTexts}>
              Switch Texts
            </Button>
            <Button variant="outline" onClick={loadSampleTexts}>
              Load Sample
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear All
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowWhitespace(!showWhitespace)}
              className={
                showWhitespace ? "bg-blue-100 dark:bg-blue-900/30" : ""
              }
            >
              {showWhitespace ? "Hide" : "Show"} Whitespace
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        {diffResult && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Comparison Results</h3>
              <div className="flex gap-2">
                {diffResult.stats.additions > 0 && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                    +{diffResult.stats.additions} additions
                  </Badge>
                )}
                {diffResult.stats.deletions > 0 && (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                    -{diffResult.stats.deletions} deletions
                  </Badge>
                )}
                {diffResult.stats.modifications > 0 && (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                    ~{diffResult.stats.modifications} modified
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Side - Original */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Original Text
                </h4>
                <ScrollArea className="h-[400px] w-full border rounded-md">
                  <div className="p-4">
                    {diffResult.lines.map((line, index) => (
                      <div
                        key={index}
                        className="flex items-start text-sm min-h-[1.5rem]"
                      >
                        <span
                          className={cn(
                            "text-xs text-muted-foreground min-w-[3rem] text-right flex-shrink-0 py-1 px-2 mr-2 select-none",
                            getLineNumberClassName(line.type)
                          )}
                        >
                          {line.leftLine || "\u00A0"}
                        </span>
                        <div className="font-mono flex-1 whitespace-pre-wrap break-all py-1 select-text">
                          {line.leftContent.length > 0 ? (
                            line.leftContent.map((segment, segIndex) => (
                              <span
                                key={segIndex}
                                className={getSegmentClassName(segment.type)}
                              >
                                {showWhitespace
                                  ? renderWhitespace(segment.text)
                                  : segment.text}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground italic text-xs select-none py-1">
                              (line not present)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Right Side - Modified */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Modified Text
                </h4>
                <ScrollArea className="h-[400px] w-full border rounded-md">
                  <div className="p-4">
                    {diffResult.lines.map((line, index) => (
                      <div
                        key={index}
                        className="flex items-start text-sm min-h-[1.5rem]"
                      >
                        <span
                          className={cn(
                            "text-xs text-muted-foreground min-w-[3rem] text-right flex-shrink-0 py-1 px-2 mr-2 select-none",
                            getLineNumberClassName(line.type)
                          )}
                        >
                          {line.rightLine || "\u00A0"}
                        </span>
                        <div className="font-mono flex-1 whitespace-pre-wrap break-all py-1 select-text">
                          {line.rightContent.length > 0 ? (
                            line.rightContent.map((segment, segIndex) => (
                              <span
                                key={segIndex}
                                className={getSegmentClassName(segment.type)}
                              >
                                {showWhitespace
                                  ? renderWhitespace(segment.text)
                                  : segment.text}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground italic text-xs select-none py-1">
                              (line not present)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Legend:</h4>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-200 dark:bg-red-800/60 rounded"></div>
                  <span>Deleted text</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-200 dark:bg-green-800/60 rounded"></div>
                  <span>Added text</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-500 rounded"></div>
                  <span>Modified line</span>
                </div>
                {showWhitespace && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono">·→</span>
                    <span>Spaces & tabs visible</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
