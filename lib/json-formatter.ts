export interface JSONNode {
  id: string;
  path: string[];
  key: string;
  value: any;
  type: "string" | "number" | "boolean" | "null" | "array" | "object";
  parent?: JSONNode;
  children?: JSONNode[];
  isExpanded?: boolean;
}

export function parseJSON(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error("Invalid JSON format");
  }
}

export function formatJSON(data: any, indent: number = 2): string {
  try {
    return JSON.stringify(data, null, indent);
  } catch (error) {
    throw new Error("Unable to format JSON");
  }
}

export function minifyJSON(data: any): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    throw new Error("Unable to minify JSON");
  }
}

export function createJSONTree(
  data: any,
  parentPath: string[] = []
): JSONNode[] {
  const nodes: JSONNode[] = [];

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const path = [...parentPath, index.toString()];
      const node: JSONNode = {
        id: path.join(".") || "root",
        path,
        key: index.toString(),
        value: item,
        type: getValueType(item),
        children: isComplexType(item) ? createJSONTree(item, path) : undefined,
        isExpanded: false,
      };
      nodes.push(node);
    });
  } else if (data && typeof data === "object") {
    Object.entries(data).forEach(([key, value]) => {
      const path = [...parentPath, key];
      const node: JSONNode = {
        id: path.join(".") || "root",
        path,
        key,
        value,
        type: getValueType(value),
        children: isComplexType(value)
          ? createJSONTree(value, path)
          : undefined,
        isExpanded: false,
      };
      nodes.push(node);
    });
  }

  return nodes;
}

function getValueType(value: any): JSONNode["type"] {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value as JSONNode["type"];
}

function isComplexType(value: any): boolean {
  return value !== null && (typeof value === "object" || Array.isArray(value));
}

export function getNodeDisplayValue(node: JSONNode): string {
  switch (node.type) {
    case "string":
      return `"${node.value}"`;
    case "number":
    case "boolean":
      return String(node.value);
    case "null":
      return "null";
    case "array":
      return `Array(${node.value.length})`;
    case "object":
      return `Object(${Object.keys(node.value).length})`;
    default:
      return String(node.value);
  }
}

export interface SearchResult {
  node: JSONNode;
  matchType: "exact" | "nested";
  matchedText?: string;
}

export function searchJSON(nodes: JSONNode[], query: string): SearchResult[] {
  if (!query) return [];

  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();

  function hasNestedMatch(node: JSONNode): boolean {
    // Check direct match first
    const keyMatch = node.key.toLowerCase().includes(queryLower);
    const valueMatch = getNodeDisplayValue(node)
      .toLowerCase()
      .includes(queryLower);

    if (keyMatch || valueMatch) {
      return true;
    }

    // Check children recursively
    if (node.children) {
      return node.children.some((child) => hasNestedMatch(child));
    }

    return false;
  }

  function searchNode(node: JSONNode) {
    const keyMatch = node.key.toLowerCase().includes(queryLower);
    const valueMatch = getNodeDisplayValue(node)
      .toLowerCase()
      .includes(queryLower);

    // Exact match (key or value contains the search term)
    if (keyMatch || valueMatch) {
      results.push({
        node,
        matchType: "exact",
        matchedText: keyMatch ? node.key : getNodeDisplayValue(node),
      });
    }
    // Nested match (this object/array contains a match somewhere inside)
    else if (
      node.children &&
      node.children.some((child) => hasNestedMatch(child))
    ) {
      results.push({
        node,
        matchType: "nested",
      });
    }

    // Continue searching children
    if (node.children) {
      node.children.forEach(searchNode);
    }
  }

  nodes.forEach(searchNode);
  return results;
}

export function getSearchHighlight(
  text: string,
  query: string
): { text: string; isHighlighted: boolean }[] {
  if (!query) return [{ text, isHighlighted: false }];

  const parts: { text: string; isHighlighted: boolean }[] = [];
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  let lastIndex = 0;
  let index = textLower.indexOf(queryLower);

  while (index !== -1) {
    // Add non-highlighted part before match
    if (index > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, index),
        isHighlighted: false,
      });
    }

    // Add highlighted match
    parts.push({
      text: text.slice(index, index + query.length),
      isHighlighted: true,
    });

    lastIndex = index + query.length;
    index = textLower.indexOf(queryLower, lastIndex);
  }

  // Add remaining non-highlighted part
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      isHighlighted: false,
    });
  }

  return parts;
}

export function validateJSON(jsonString: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    JSON.parse(jsonString);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}
