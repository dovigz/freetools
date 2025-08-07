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
          // Sample more items for better schema inference
          const sampleSize = Math.min(5, items.length);
          const sampleItems = items.slice(0, sampleSize);
          
          // Generate schemas for sample items
          const itemSchemas = sampleItems.map(generateSchema);
          
          // Check if all items have the same structure
          const firstType = itemSchemas[0]?.type;
          
          if (firstType === 'object') {
            // For objects, merge all properties and required fields
            const mergedSchema: any = {
              type: 'object',
              properties: {},
              required: []
            };
            
            // Collect all properties from sample objects
            const allProperties = new Set<string>();
            itemSchemas.forEach(schema => {
              if (schema.properties) {
                Object.keys(schema.properties).forEach(prop => allProperties.add(prop));
              }
            });
            
            // Generate property schemas and determine which are consistently required
            allProperties.forEach(prop => {
              const propSchemas = itemSchemas
                .filter(schema => schema.properties && schema.properties[prop])
                .map(schema => schema.properties[prop]);
              
              if (propSchemas.length > 0) {
                // Use the first occurrence as the property schema
                mergedSchema.properties[prop] = propSchemas[0];
                
                // Mark as required if present in all sampled items
                const requiredInAll = itemSchemas.every(schema => 
                  schema.required && schema.required.includes(prop)
                );
                
                if (requiredInAll) {
                  mergedSchema.required.push(prop);
                }
              }
            });
            
            // Remove empty required array
            if (mergedSchema.required.length === 0) {
              delete mergedSchema.required;
            }
            
            schema_arr.items = mergedSchema;
          } else if (itemSchemas.every(schema => schema.type === firstType)) {
            // All items have the same primitive type
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
          // Mark non-null and non-undefined values as required
          if (val !== null && val !== undefined) {
            schema_obj.required.push(key);
          }
        });
        
        // Remove empty required array to clean up the schema
        if (schema_obj.required.length === 0) {
          delete schema_obj.required;
        }
        
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