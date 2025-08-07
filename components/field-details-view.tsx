"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface FieldDetailsViewProps {
  fieldName: string;
  value: any;
  className?: string;
}

export function FieldDetailsView({
  fieldName,
  value,
  className,
}: FieldDetailsViewProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const getValueType = (val: any): string => {
    if (val === null) return "null";
    if (typeof val === "number") {
      return Number.isInteger(val) ? "integer" : "number";
    }
    return typeof val;
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case "string":
        return "📝";
      case "integer":
      case "number":
        return "🔢";
      case "boolean":
        return value ? "✅" : "❌";
      case "null":
        return "⚪";
      default:
        return "❓";
    }
  };

  const formatValue = (val: any): string => {
    if (val === null) return "null";
    if (typeof val === "string") return `"${val}"`;
    return String(val);
  };

  const getValueDetails = (val: any, type: string) => {
    const details: Array<{ label: string; value: string }> = [];

    if (type === "string") {
      details.push({ label: "Length", value: `${val.length} characters` });

      // Detect common formats
      if (val.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        details.push({ label: "Format", value: "Date-time" });
      } else if (val.match(/^\d{4}-\d{2}-\d{2}$/)) {
        details.push({ label: "Format", value: "Date" });
      } else if (val.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        details.push({ label: "Format", value: "Email" });
      } else if (val.match(/^https?:\/\//)) {
        details.push({ label: "Format", value: "URL" });
      } else if (
        val.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        )
      ) {
        details.push({ label: "Format", value: "UUID" });
      } else {
        details.push({ label: "Format", value: "Text" });
      }

      // Character analysis
      if (val.length > 0) {
        const hasSpaces = val.includes(" ");
        const hasNumbers = /\d/.test(val);
        const hasSpecialChars = /[^a-zA-Z0-9\s]/.test(val);

        const characteristics = [];
        if (hasNumbers) characteristics.push("numbers");
        if (hasSpecialChars) characteristics.push("special chars");
        if (hasSpaces) characteristics.push("spaces");

        if (characteristics.length > 0) {
          details.push({
            label: "Contains",
            value: characteristics.join(", "),
          });
        }
      }
    } else if (type === "number" || type === "integer") {
      if (type === "number") {
        const decimalPlaces = val.toString().split(".")[1]?.length || 0;
        details.push({
          label: "Decimal places",
          value: decimalPlaces.toString(),
        });
      }

      details.push({
        label: "Sign",
        value: val >= 0 ? "Positive" : "Negative",
      });

      if (type === "integer") {
        details.push({
          label: "Range",
          value: val >= 0 ? "Non-negative integer" : "Negative integer",
        });
      }
    } else if (type === "boolean") {
      details.push({ label: "State", value: val ? "True" : "False" });
    }

    return details;
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      // Handle error silently
    }
  };

  const type = getValueType(value);
  const formattedValue = formatValue(value);
  const details = getValueDetails(value, type);

  return (
    <div
      className={cn(
        "w-96 bg-slate-900 border-r border-slate-600 flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="p-3 border-b border-slate-600">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-slate-700"
            onClick={() => copyToClipboard(fieldName, "header-path")}
            title="Copy JSON path"
          >
            {copied === "header-path" ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-slate-400 hover:text-white" />
            )}
          </Button>
          <h3 className="font-semibold text-white text-sm truncate flex-1">
            {fieldName}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Value Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Value</label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs hover:bg-slate-700"
              onClick={() =>
                copyToClipboard(value?.toString() || "null", "value")
              }
            >
              {copied === "value" ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <div className="p-3 bg-slate-800 rounded-md border border-slate-700">
            <pre className="text-sm text-slate-200 font-mono whitespace-pre-wrap break-all">
              {formattedValue}
            </pre>
          </div>
        </div>

        {/* Raw Value (for strings) */}
        {type === "string" && value !== formattedValue && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">
                Raw Value
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs hover:bg-slate-700"
                onClick={() => copyToClipboard(value, "raw")}
              >
                {copied === "raw" ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
            <div className="p-3 bg-slate-800 rounded-md border border-slate-700">
              <pre className="text-sm text-slate-200 font-mono whitespace-pre-wrap break-all">
                {value}
              </pre>
            </div>
          </div>
        )}

        {/* Details */}
        {details.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Details
            </label>
            <div className="space-y-2">
              {details.map((detail, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-1"
                >
                  <span className="text-sm text-slate-400">
                    {detail.label}:
                  </span>
                  <span className="text-sm text-slate-200 font-mono">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* JSON Path */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">
              JSON Path
            </label>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-slate-700"
              onClick={() => copyToClipboard(fieldName, "path")}
            >
              {copied === "path" ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <div className="p-2 bg-slate-800 rounded-md border border-slate-700">
            <code className="text-sm text-blue-300 font-mono">{fieldName}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
