"use client";

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Link, AlertCircle, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { validateJSON, parseJSON } from '@/lib/json-formatter';

interface JSONImportDialogProps {
  onImport: (data: any) => void;
  trigger?: React.ReactNode;
}

export function JSONImportDialog({ onImport, trigger }: JSONImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; error?: string }>({ isValid: true });
  const [loading, setLoading] = useState(false);

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
        setOpen(false);
        setJsonInput('');
        setValidationResult({ isValid: true });
      } catch (e) {
        setValidationResult({ isValid: false, error: 'Failed to parse JSON' });
      }
    }
  }, [jsonInput, validationResult.isValid, onImport]);

  const handleUrlImport = useCallback(async () => {
    if (!urlInput.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(urlInput);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      onImport(data);
      setOpen(false);
      setUrlInput('');
    } catch (e) {
      setValidationResult({ 
        isValid: false, 
        error: `Failed to fetch from URL: ${e instanceof Error ? e.message : 'Unknown error'}` 
      });
    } finally {
      setLoading(false);
    }
  }, [urlInput, onImport]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
    event.target.value = '';
  }, [handleJsonChange]);

  const examples = [
    {
      name: 'Sample User',
      json: JSON.stringify({
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "country": "USA"
        },
        "preferences": {
          "theme": "dark",
          "notifications": true
        }
      }, null, 2)
    },
    {
      name: 'API Response',
      json: JSON.stringify({
        "status": "success",
        "data": {
          "users": [
            {"id": 1, "name": "Alice"},
            {"id": 2, "name": "Bob"}
          ],
          "pagination": {
            "page": 1,
            "total": 2,
            "hasMore": false
          }
        }
      }, null, 2)
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
            <Upload className="w-4 h-4 mr-2" />
            Import JSON
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] bg-slate-800 border-slate-600">
        <DialogHeader>
          <DialogTitle className="text-white">Import JSON</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700 border border-slate-600">
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
              <label className="text-sm font-medium text-slate-300">Paste JSON</label>
              <Textarea
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                placeholder="Paste your JSON here..."
                className="min-h-[200px] bg-slate-700 border-slate-600 text-white font-mono text-sm"
              />
            </div>

            {!validationResult.isValid && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationResult.error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
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
              >
                <Check className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Upload JSON File</label>
              <div 
                className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors"
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type === 'application/json') {
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
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">Drop your JSON file here or click to browse</p>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md inline-block transition-colors"
                >
                  Choose File
                </label>
              </div>
            </div>

            {jsonInput && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Preview</label>
                <Textarea
                  value={jsonInput}
                  readOnly
                  className="min-h-[100px] bg-slate-700 border-slate-600 text-white font-mono text-sm"
                />
                
                {!validationResult.isValid && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{validationResult.error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleImportJson}
                  disabled={!validationResult.isValid}
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}