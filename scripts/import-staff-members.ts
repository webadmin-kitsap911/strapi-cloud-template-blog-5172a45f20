/**
 * Import staff members from a CSV file via Strapi REST API
 *
 * Usage: npm run import:staff-members <csv-file>
 *
 * Environment variables:
 *   STRAPI_URL   - Strapi server URL (default: http://localhost:1337)
 *   STRAPI_TOKEN - API token with staff-member create permissions
 *
 * CSV format (with header row):
 *   name,phone,titles
 *
 * - name: Required. Staff member's full name
 * - phone: Optional. Phone number
 * - titles: Optional. Semicolon-separated list of titles (e.g., "Director;Board Member")
 *
 * Example:
 *   STRAPI_URL=http://localhost:1337 STRAPI_TOKEN=abc123 npm run import:staff-members ./staff.csv
 */

import * as fs from "fs";
import * as path from "path";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

interface StaffMemberRow {
  name: string;
  phone?: string;
  titles?: string;
}

async function fetchStrapi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${STRAPI_URL}/api${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(`Strapi API error: ${response.status} - ${JSON.stringify(error)}`);
  }

  return response.json();
}

function parseCSV(content: string): StaffMemberRow[] {
  const lines = content.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV must have a header row and at least one data row");
  }

  const header = parseCSVLine(lines[0]);
  const nameIndex = header.findIndex((h) => h.toLowerCase() === "name");
  const phoneIndex = header.findIndex((h) => h.toLowerCase() === "phone");
  const titlesIndex = header.findIndex((h) => h.toLowerCase() === "titles");

  if (nameIndex === -1) {
    throw new Error('CSV must have a "name" column');
  }

  const rows: StaffMemberRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === "")) {
      continue;
    }

    const name = values[nameIndex]?.trim();
    if (!name) {
      console.warn(`Skipping row ${i + 1}: missing name`);
      continue;
    }

    rows.push({
      name,
      phone: phoneIndex >= 0 ? values[phoneIndex]?.trim() || undefined : undefined,
      titles: titlesIndex >= 0 ? values[titlesIndex]?.trim() || undefined : undefined,
    });
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

async function main() {
  const csvFile = process.argv[2];

  if (!csvFile) {
    console.error("Usage: npm run import:staff-members <csv-file>");
    console.error("\nEnvironment variables:");
    console.error("  STRAPI_URL   - Strapi server URL (default: http://localhost:1337)");
    console.error("  STRAPI_TOKEN - API token with staff-member create permissions");
    console.error("\nCSV format (with header row):");
    console.error("  name,phone,titles");
    console.error("\nExample:");
    console.error("  STRAPI_TOKEN=abc123 npm run import:staff-members ./staff.csv");
    process.exit(1);
  }

  if (!STRAPI_TOKEN) {
    console.error("Error: STRAPI_TOKEN environment variable is required");
    process.exit(1);
  }

  const csvPath = path.resolve(csvFile);
  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`Strapi URL: ${STRAPI_URL}`);
  console.log(`Reading CSV from: ${csvPath}`);

  const content = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(content);
  console.log(`Found ${rows.length} staff members to import\n`);

  // Fetch existing staff members to check for duplicates
  const existing = await fetchStrapi<{ data: Array<{ name: string }> }>(
    "/staff-members?pagination[limit]=1000&fields[0]=name"
  );
  const existingNames = new Set(existing.data.map((s) => s.name.toLowerCase()));

  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    if (existingNames.has(row.name.toLowerCase())) {
      console.log(`Skipping "${row.name}" - already exists`);
      skipped++;
      continue;
    }

    const titles = row.titles
      ? row.titles.split(";").map((t) => ({ value: t.trim() }))
      : [];

    await fetchStrapi("/staff-members", {
      method: "POST",
      body: JSON.stringify({
        data: {
          name: row.name,
          phone: row.phone || null,
          titles,
        },
      }),
    });

    console.log(`Created "${row.name}"`);
    existingNames.add(row.name.toLowerCase());
    created++;
  }

  console.log(`\nImport complete: ${created} created, ${skipped} skipped`);
}

main().catch((error) => {
  console.error("Import failed:", error.message);
  process.exit(1);
});
