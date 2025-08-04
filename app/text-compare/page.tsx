"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
// Placeholder types and functions
type DiffResult = {
  lines: Array<{
    type: string;
    leftLine: number | null;
    rightLine: number | null;
    leftContent: Array<{ type: string; text: string }>;
    rightContent: Array<{ type: string; text: string }>;
  }>;
  stats: {
    additions: number;
    deletions: number;
    modifications: number;
  };
};

const computeTextDiff = (left: string, right: string): DiffResult => {
  return {
    lines: [],
    stats: { additions: 0, deletions: 0, modifications: 0 }
  };
};

const getLineClassName = (type: string): string => {
  return "";
};

const getSegmentClassName = (type: string): string => {
  return "";
};

const renderWhitespace = (text: string): string => {
  return text;
};
import { cn } from "@/lib/utils";

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
  }, [leftText, rightText]);

  const loadSampleTexts = useCallback(() => {
    setLeftText(SAMPLE_TEXT_LEFT);
    setRightText(SAMPLE_TEXT_RIGHT);
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
                        className={cn(
                          "flex items-start gap-3 py-1 px-2 rounded text-sm min-h-[1.5rem]",
                          getLineClassName(line.type)
                        )}
                      >
                        <span className="text-xs text-muted-foreground min-w-[2rem] text-right flex-shrink-0">
                          {line.leftLine || ""}
                        </span>
                        <div className="font-mono flex-1 whitespace-pre-wrap break-all">
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
                            <span className="text-muted-foreground italic text-xs">
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
                        className={cn(
                          "flex items-start gap-3 py-1 px-2 rounded text-sm min-h-[1.5rem]",
                          getLineClassName(line.type)
                        )}
                      >
                        <span className="text-xs text-muted-foreground min-w-[2rem] text-right flex-shrink-0">
                          {line.rightLine || ""}
                        </span>
                        <div className="font-mono flex-1 whitespace-pre-wrap break-all">
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
                            <span className="text-muted-foreground italic text-xs">
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
