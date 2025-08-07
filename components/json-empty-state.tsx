"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { parseJSON, validateJSON } from "@/lib/json-formatter";
import { AlertCircle, Check, FileText, Upload } from "lucide-react";
import { useCallback, useState } from "react";

interface JSONEmptyStateProps {
  onImport: (data: any) => void;
}

export function JSONEmptyState({ onImport }: JSONEmptyStateProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    error?: string;
  }>({ isValid: true });

  const handleJsonChange = useCallback((value: string) => {
    setJsonInput(value);
    const validation = validateJSON(value);
    setValidationResult(validation);
  }, []);

  const handleImportJson = useCallback(() => {
    if (validationResult.isValid && jsonInput.trim()) {
      try {
        const parsed = parseJSON(jsonInput);
        onImport(parsed);
      } catch (e) {
        setValidationResult({ isValid: false, error: "Failed to parse JSON" });
      }
    }
  }, [jsonInput, validationResult.isValid, onImport]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          handleJsonChange(content);
        };
        reader.readAsText(file);
      }
      // Reset input
      event.target.value = "";
    },
    [handleJsonChange]
  );

  const examples = [
    {
      name: "Sample User",
      json: JSON.stringify(
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          address: {
            street: "123 Main St",
            city: "New York",
            country: "USA",
          },
          preferences: {
            theme: "dark",
            notifications: true,
          },
        },
        null,
        2
      ),
    },
    {
      name: "API Response",
      json: JSON.stringify(
        {
          status: "success",
          data: {
            users: [
              { id: 1, name: "Alice" },
              { id: 2, name: "Bob" },
            ],
            pagination: {
              page: 1,
              total: 2,
              hasMore: false,
            },
          },
        },
        null,
        2
      ),
    },
  ];

  return (
    <div className="h-full flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-2xl bg-slate-800 border border-slate-600 rounded-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Import JSON</h2>
          <p className="text-slate-400">
            Paste your JSON data below to get started
          </p>
        </div>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700 border border-slate-600 mb-6">
            <TabsTrigger
              value="text"
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-600 hover:text-white transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Text
            </TabsTrigger>
            <TabsTrigger
              value="file"
              className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-600 hover:text-white transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              File
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                placeholder="Paste your JSON here..."
                className="min-h-[300px] bg-slate-700 border-slate-600 text-white font-mono text-sm resize-none"
              />
            </div>

            {!validationResult.isValid && (
              <Alert
                variant="destructive"
                className="bg-red-900/50 border-red-500"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationResult.error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Try an example:</p>
                <div className="flex gap-2">
                  {examples.map((example) => (
                    <Button
                      key={example.name}
                      size="sm"
                      variant="outline"
                      className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                      onClick={() => handleJsonChange(example.json)}
                    >
                      {example.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleImportJson}
                disabled={!validationResult.isValid || !jsonInput.trim()}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Check className="w-4 h-4 mr-2" />
                Import JSON
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div
              className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center hover:border-slate-500 transition-colors"
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.type === "application/json") {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const content = event.target?.result as string;
                    handleJsonChange(content);
                  };
                  reader.readAsText(file);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => e.preventDefault()}
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">
                Drop your JSON file here or click to browse
              </p>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg inline-block transition-colors"
              >
                Choose File
              </label>
            </div>

            {jsonInput && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Preview
                  </label>
                  <Textarea
                    value={jsonInput}
                    readOnly
                    className="min-h-[200px] bg-slate-700 border-slate-600 text-white font-mono text-sm"
                  />
                </div>

                {!validationResult.isValid && (
                  <Alert
                    variant="destructive"
                    className="bg-red-900/50 border-red-500"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {validationResult.error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleImportJson}
                  disabled={!validationResult.isValid}
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                  size="lg"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Import JSON
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
