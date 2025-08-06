export function generateJSONSchema(data: any): any {
  function getType(value: any): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  function generateSchema(value: any): any {
    const type = getType(value);

    switch (type) {
      case 'null':
        return { type: 'null' };
      
      case 'boolean':
        return { type: 'boolean' };
      
      case 'number':
        return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' };
      
      case 'string':
        const schema: any = { type: 'string' };
        
        // Add format hints for common patterns
        if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
          schema.format = 'date-time';
        } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          schema.format = 'date';
        } else if (value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          schema.format = 'email';
        } else if (value.match(/^https?:\/\//)) {
          schema.format = 'uri';
        }
        
        return schema;
      
      case 'array':
        const items = value as any[];
        const schema_arr: any = { type: 'array' };
        
        if (items.length > 0) {
          // Try to infer item schema from first few items
          const sampleItems = items.slice(0, Math.min(3, items.length));
          const itemSchemas = sampleItems.map(generateSchema);
          
          // If all items have the same type, use that schema
          const firstType = itemSchemas[0]?.type;
          if (itemSchemas.every(schema => schema.type === firstType)) {
            schema_arr.items = itemSchemas[0];
          } else {
            // Mixed types, use oneOf
            schema_arr.items = {
              oneOf: itemSchemas
            };
          }
        }
        
        return schema_arr;
      
      case 'object':
        const obj = value as Record<string, any>;
        const schema_obj: any = {
          type: 'object',
          properties: {},
          required: []
        };
        
        Object.entries(obj).forEach(([key, val]) => {
          schema_obj.properties[key] = generateSchema(val);
          // Mark non-null values as required
          if (val !== null && val !== undefined) {
            schema_obj.required.push(key);
          }
        });
        
        return schema_obj;
      
      default:
        return { type: 'string' };
    }
  }

  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    ...generateSchema(data)
  };

  return schema;
}

export function formatSchemaForDisplay(schema: any): string {
  return JSON.stringify(schema, null, 2);
}