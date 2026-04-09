/**
 * Import awards from a CSV file via Strapi REST API
 *
 * Usage: npm run import:awards <csv-file>
 *
 * Environment variables:
 *   STRAPI_URL   - Strapi server URL (default: http://localhost:1337)
 *   STRAPI_TOKEN - API token with award create permissions and staff-member read permissions
 *
 * CSV format (with header row):
 *   staffMember,year,awardName,presentingOrganization,category
 *
 * - staffMember: Required. Name of staff member (must already exist in CMS)
 * - year: Required. Year the award was given (e.g., 2024)
 * - awardName: Required. Name of the award
 * - presentingOrganization: Required. Organization that presented the award
 * - category: Required. Either "external" or "internal"
 *
 * Example:
 *   STRAPI_TOKEN=abc123 npm run import:awards ./awards.csv
 */

import * as fs from "fs";
import * as path from "path";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

interface AwardRow {
  staffMember: string;
  year: number;
  awardName: string;
  presentingOrganization: string;
  category: "external" | "internal";
}

interface StaffMember {
  documentId: string;
  name: string;
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

function parseCSV(content: string): AwardRow[] {
  const lines = content.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV must have a header row and at least one data row");
  }

  const header = parseCSVLine(lines[0]);
  const staffMemberIndex = header.findIndex(
    (h) => h.toLowerCase() === "staffmember" || h.toLowerCase() === "staff member"
  );
  const yearIndex = header.findIndex((h) => h.toLowerCase() === "year");
  const awardNameIndex = header.findIndex(
    (h) => h.toLowerCase() === "awardname" || h.toLowerCase() === "award name" || h.toLowerCase() === "award"
  );
  const presentingOrgIndex = header.findIndex(
    (h) =>
      h.toLowerCase() === "presentingorganization" ||
      h.toLowerCase() === "presenting organization" ||
      h.toLowerCase() === "organization"
  );
  const categoryIndex = header.findIndex((h) => h.toLowerCase() === "category");

  const missingColumns: string[] = [];
  if (staffMemberIndex === -1) missingColumns.push("staffMember");
  if (yearIndex === -1) missingColumns.push("year");
  if (awardNameIndex === -1) missingColumns.push("awardName");
  if (presentingOrgIndex === -1) missingColumns.push("presentingOrganization");
  if (categoryIndex === -1) missingColumns.push("category");

  if (missingColumns.length > 0) {
    throw new Error(`CSV missing required columns: ${missingColumns.join(", ")}`);
  }

  const rows: AwardRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === "")) {
      continue;
    }

    const staffMember = values[staffMemberIndex]?.trim();
    const yearStr = values[yearIndex]?.trim();
    const awardName = values[awardNameIndex]?.trim();
    const presentingOrganization = values[presentingOrgIndex]?.trim();
    const category = values[categoryIndex]?.trim().toLowerCase();

    if (!staffMember || !yearStr || !awardName || !presentingOrganization || !category) {
      console.warn(`Skipping row ${i + 1}: missing required fields`);
      continue;
    }

    const year = parseInt(yearStr, 10);
    if (isNaN(year)) {
      console.warn(`Skipping row ${i + 1}: invalid year "${yearStr}"`);
      continue;
    }

    if (category !== "external" && category !== "internal") {
      console.warn(`Skipping row ${i + 1}: category must be "external" or "internal", got "${category}"`);
      continue;
    }

    rows.push({
      staffMember,
      year,
      awardName,
      presentingOrganization,
      category,
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
    console.error("Usage: npm run import:awards <csv-file>");
    console.error("\nEnvironment variables:");
    console.error("  STRAPI_URL   - Strapi server URL (default: http://localhost:1337)");
    console.error("  STRAPI_TOKEN - API token with award create and staff-member read permissions");
    console.error("\nCSV format (with header row):");
    console.error("  staffMember,year,awardName,presentingOrganization,category");
    console.error("\nExample:");
    console.error("  STRAPI_TOKEN=abc123 npm run import:awards ./awards.csv");
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
  console.log(`Found ${rows.length} awards to import\n`);

  // Fetch all staff members to build a name -> documentId map
  const staffResponse = await fetchStrapi<{ data: StaffMember[] }>(
    "/staff-members?pagination[limit]=1000&fields[0]=name"
  );
  const staffMemberMap = new Map<string, string>();
  for (const member of staffResponse.data) {
    staffMemberMap.set(member.name.toLowerCase(), member.documentId);
  }

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    const staffMemberId = staffMemberMap.get(row.staffMember.toLowerCase());

    if (!staffMemberId) {
      console.error(`Error: Staff member "${row.staffMember}" not found in CMS`);
      errors++;
      continue;
    }

    // Check if this exact award already exists
    const existingResponse = await fetchStrapi<{ data: Array<{ documentId: string }> }>(
      `/awards?filters[staffMember][documentId][$eq]=${staffMemberId}&filters[year][$eq]=${row.year}&filters[awardName][$eq]=${encodeURIComponent(row.awardName)}`
    );

    if (existingResponse.data.length > 0) {
      console.log(`Skipping "${row.awardName}" for ${row.staffMember} (${row.year}) - already exists`);
      skipped++;
      continue;
    }

    await fetchStrapi("/awards", {
      method: "POST",
      body: JSON.stringify({
        data: {
          staffMember: staffMemberId,
          year: row.year,
          awardName: row.awardName,
          presentingOrganization: row.presentingOrganization,
          category: row.category,
        },
      }),
    });

    console.log(`Created "${row.awardName}" for ${row.staffMember} (${row.year})`);
    created++;
  }

  console.log(`\nImport complete: ${created} created, ${skipped} skipped, ${errors} errors`);

  if (errors > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Import failed:", error.message);
  process.exit(1);
});
