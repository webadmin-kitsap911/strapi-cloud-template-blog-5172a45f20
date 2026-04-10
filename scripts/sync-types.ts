/**
 * Generates frontend-friendly TypeScript types from Strapi content types.
 * Run with: npm run sync-types
 */

import * as fs from 'fs';
import * as path from 'path';

const FRONTEND_TYPES_PATH = '../kitsap-911-frontend-2026/src/types/strapi.ts';
const API_CONTENT_TYPES_PATH = './src/api';
const COMPONENTS_PATH = './src/components';

interface AttributeInfo {
  type: string;
  required?: boolean;
  relation?: string;
  target?: string;
  enum?: string[];
  component?: string;
  components?: string[];
  repeatable?: boolean;
  multiple?: boolean;
  customField?: string;
}

function toPascalCase(str: string): string {
  return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function strapiTypeToTS(attr: AttributeInfo, componentTypes: Map<string, string>): string {
  switch (attr.type) {
    case 'string':
    case 'text':
    case 'richtext':
    case 'email':
    case 'password':
    case 'uid':
      return 'string';
    case 'integer':
    case 'biginteger':
    case 'float':
    case 'decimal':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
    case 'datetime':
    case 'time':
      return 'string';
    case 'json':
      return 'unknown';
    case 'enumeration':
      return attr.enum ? attr.enum.map(e => `'${e}'`).join(' | ') : 'string';
    case 'media':
      return attr.multiple ? 'StrapiMedia[]' : 'StrapiMedia';
    case 'relation':
      if (attr.target) {
        const targetName = attr.target.split('.').pop() || 'unknown';
        const pascalName = toPascalCase(targetName);
        return attr.relation?.includes('Many') ? `${pascalName}[]` : pascalName;
      }
      return 'unknown';
    case 'component':
      if (attr.component) {
        const componentType = componentTypes.get(attr.component) || 'unknown';
        return attr.repeatable ? `${componentType}[]` : componentType;
      }
      return 'unknown';
    case 'dynamiczone':
      if (attr.components && attr.components.length > 0) {
        const unionTypes = attr.components.map(c => {
          const typeName = componentTypes.get(c) || 'unknown';
          return `(${typeName} & { __component: '${c}' })`;
        });
        return `(${unionTypes.join(' | ')})[]`;
      }
      return 'unknown[]';
    case 'customField':
      // Handle specific custom fields
      if (attr.customField === 'plugin::private-file-upload.private-file') {
        return 'StrapiMedia | null';
      }
      return 'string';
    default:
      return 'unknown';
  }
}

function generateTypes(): string {
  const types: string[] = [];
  const componentTypes = new Map<string, string>();
  const componentInterfaces: string[] = [];

  // Track block theme enums for normalization
  const blockThemeEnums: string[][] = [];

  // Scan components first
  if (fs.existsSync(COMPONENTS_PATH)) {
    const categories = fs.readdirSync(COMPONENTS_PATH);

    // First pass: collect block theme enums
    for (const category of categories) {
      if (category !== 'blocks') continue;
      const categoryPath = path.join(COMPONENTS_PATH, category);
      if (!fs.statSync(categoryPath).isDirectory()) continue;

      const componentFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('.json'));
      for (const file of componentFiles) {
        const schema = JSON.parse(fs.readFileSync(path.join(categoryPath, file), 'utf-8'));
        const themeAttr = schema.attributes?.theme as AttributeInfo | undefined;
        if (themeAttr?.type === 'enumeration' && themeAttr.enum) {
          blockThemeEnums.push(themeAttr.enum);
        }
      }
    }

    // Check if all block theme enums are identical
    const normalizedBlockTheme = blockThemeEnums.length > 0 &&
      blockThemeEnums.every(e => JSON.stringify(e) === JSON.stringify(blockThemeEnums[0]))
        ? blockThemeEnums[0]
        : null;

    // First pass: register all component type names
    for (const category of categories) {
      const categoryPath = path.join(COMPONENTS_PATH, category);
      if (!fs.statSync(categoryPath).isDirectory()) continue;

      const componentFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('.json'));

      for (const file of componentFiles) {
        const componentName = file.replace('.json', '');
        const componentKey = `${category}.${componentName}`;
        const typeName = toPascalCase(category) + toPascalCase(componentName);
        componentTypes.set(componentKey, typeName);
      }
    }

    // Second pass: generate interfaces with all types available
    for (const category of categories) {
      const categoryPath = path.join(COMPONENTS_PATH, category);
      if (!fs.statSync(categoryPath).isDirectory()) continue;

      const componentFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('.json'));

      for (const file of componentFiles) {
        const componentName = file.replace('.json', '');
        const componentKey = `${category}.${componentName}`;
        const typeName = componentTypes.get(componentKey)!;

        const schema = JSON.parse(fs.readFileSync(path.join(categoryPath, file), 'utf-8'));
        const isBlockComponent = category === 'blocks';

        // Columns component children get runtime IDs
        const needsId = category === 'columns';

        const attributes = Object.entries(schema.attributes || {})
          .map(([key, value]) => {
            const attr = value as AttributeInfo;
            // Use normalized BlockTheme for theme fields in block components
            if (isBlockComponent && key === 'theme' && normalizedBlockTheme &&
                attr.type === 'enumeration' && JSON.stringify(attr.enum) === JSON.stringify(normalizedBlockTheme)) {
              const optional = !attr.required ? '?' : '';
              return `  ${key}${optional}: BlockTheme;`;
            }
            const tsType = strapiTypeToTS(attr, componentTypes);
            const optional = !attr.required ? '?' : '';
            return `  ${key}${optional}: ${tsType};`;
          })
          .join('\n');

        const idField = needsId ? '  id: number;\n' : '';
        componentInterfaces.push(`export interface ${typeName} {
${idField}${attributes}
}
`);
      }
    }

    // Add BlockTheme type if we have a normalized theme
    if (normalizedBlockTheme) {
      const themeUnion = normalizedBlockTheme.map(e => `'${e}'`).join(' | ');
      componentInterfaces.unshift(`export type BlockTheme = ${themeUnion};
`);
    }
  }

  // Base Strapi types
  types.push(`// Auto-generated from Strapi schema - do not edit manually
// Run "npm run sync-types" in the CMS project to regenerate

export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  formats: Record<string, { url: string; width: number; height: number }> | null;
  url: string;
  mime: string;
  size: number;
}

export interface StrapiMeta {
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface StrapiResponse<T> {
  data: T;
  meta: StrapiMeta;
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, never>;
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta: StrapiMeta;
}

// Base attributes for all content types
export interface StrapiBaseAttributes {
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale?: string;
}

// Components
${componentInterfaces.join('\n')}`);

  // Scan API content types
  if (fs.existsSync(API_CONTENT_TYPES_PATH)) {
    const apiDirs = fs.readdirSync(API_CONTENT_TYPES_PATH);

    for (const dir of apiDirs) {
      const schemaPath = path.join(API_CONTENT_TYPES_PATH, dir, 'content-types', dir, 'schema.json');

      if (fs.existsSync(schemaPath)) {
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
        const typeName = toPascalCase(dir);

        const attributes = Object.entries(schema.attributes || {})
          .filter(([key]) => !['createdAt', 'updatedAt', 'publishedAt', 'createdBy', 'updatedBy', 'locale', 'localizations'].includes(key))
          .map(([key, value]) => {
            const attr = value as AttributeInfo;
            const tsType = strapiTypeToTS(attr, componentTypes);
            const optional = !attr.required ? '?' : '';
            return `  ${key}${optional}: ${tsType};`;
          })
          .join('\n');

        types.push(`export interface ${typeName} extends StrapiBaseAttributes {
  id: number;
  documentId: string;
${attributes}
}
`);
      }
    }
  }

  return types.join('\n');
}

function generateNavigationPluginTypes(): string {
  // Types for strapi-plugin-navigation
  // Based on the plugin's Zod schemas in dist/server/src/schemas/navigation.d.ts
  return `
// Navigation Plugin Types (strapi-plugin-navigation)
export type NavigationItemType = 'INTERNAL' | 'EXTERNAL' | 'WRAPPER';

export interface NavigationAudience {
  id: number;
  documentId: string;
  name: string;
  key: string;
}

export interface NavigationItemRelated {
  documentId?: string;
  __type: string;
  [key: string]: unknown;
}

export interface NavigationAdditionalFields {
  wrapper_icon?: string | null;
  [key: string]: unknown;
}

export interface NavigationItem {
  id: number;
  documentId: string;
  title: string;
  type: NavigationItemType;
  path?: string | null;
  externalPath?: string | null;
  uiRouterKey: string;
  menuAttached: boolean;
  order: number;
  collapsed: boolean;
  related?: NavigationItemRelated | null;
  additionalFields?: NavigationAdditionalFields | null;
  audience?: NavigationAudience[] | null;
  autoSync?: boolean | null;
  parent?: NavigationItem | null;
  items?: NavigationItem[];
}

export interface Navigation {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  locale: string;
  visible: boolean;
  items?: NavigationItem[];
}
`;
}

function generateHelperTypeAliases(): string {
  return `
// Helper type aliases for columns block
export type ColumnLayout = BlocksColumns['layout'];
export type ColumnChildBlock = NonNullable<ColumnsColumnContent['children']>[number];
`;
}

// Generate and write types
const output = generateTypes() + generateNavigationPluginTypes() + generateHelperTypeAliases();
const outputPath = path.resolve(process.cwd(), FRONTEND_TYPES_PATH);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output);

console.log(`Types generated at: ${outputPath}`);
