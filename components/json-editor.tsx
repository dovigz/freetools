"use client";

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Download, Upload } from 'lucide-react';
import { validateJSON, formatJSON, minifyJSON } from '@/lib/json-formatter';
import { cn } from '@/lib/utils';

interface JSONEditorProps {
  value: string;
  onChange: (value: string) => void;
  onParsedChange?: (parsed: any) => void;
  className?: string;
}

export function JSONEditor({ value, onChange, onParsedChange, className }: JSONEditorProps) {
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; error?: string }>({ isValid: true });

  const handleInputChange = useCallback((newValue: string) => {
    onChange(newValue);
    
    // Validate JSON
    const validation = validateJSON(newValue);
    setValidationResult(validation);

    // Parse and notify parent if valid
    if (validation.isValid && onParsedChange) {
      try {
        const parsed = JSON.parse(newValue);
        onParsedChange(parsed);
      } catch (e) {
        // Handle edge case
      }
    }
  }, [onChange, onParsedChange]);

  const formatJson = useCallback(() => {
    if (validationResult.isValid) {
      try {
        const parsed = JSON.parse(value);
        const formatted = formatJSON(parsed, 2);
        onChange(formatted);
      } catch (e) {
        // Handle error
      }
    }
  }, [value, validationResult.isValid, onChange]);

  const minifyJson = useCallback(() => {
    if (validationResult.isValid) {
      try {
        const parsed = JSON.parse(value);
        const minified = minifyJSON(parsed);
        onChange(minified);
      } catch (e) {
        // Handle error
      }
    }
  }, [value, validationResult.isValid, onChange]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (e) {
      // Handle error
    }
  }, [value]);

  const downloadJson = useCallback(() => {
    const blob = new Blob([value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [value]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleInputChange(content);
      };
      reader.readAsText(file);
    }
    // Reset input
    event.target.value = '';
  }, [handleInputChange]);

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">JSON Input</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={validationResult.isValid ? "default" : "destructive"}>
              {validationResult.isValid ? "Valid" : "Invalid"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={formatJson}
            disabled={!validationResult.isValid}
          >
            Format
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={minifyJson}
            disabled={!validationResult.isValid}
          >
            Minify
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={copyToClipboard}
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={downloadJson}
            disabled={!value}
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button size="sm" variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-1" />
                Upload
              </span>
            </Button>
          </label>
        </div>
      </CardHeader>
      <CardContent className="h-full">
        {!validationResult.isValid && (
          <Alert className="mb-4" variant="destructive">
            <AlertDescription>
              {validationResult.error}
            </AlertDescription>
          </Alert>
        )}
        <Textarea
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Paste your JSON here..."
          className="h-full min-h-[400px] font-mono text-sm resize-none"
        />
      </CardContent>
    </Card>
  );
}