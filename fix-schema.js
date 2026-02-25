import fs from 'fs';

let schema = fs.readFileSync('shared/schema.ts', 'utf-8');
if (!schema.includes("randomUUID")) {
    schema = "import { randomUUID } from 'crypto';\n" + schema;
}

// Replace Postgres UUID default with Drizzle runtime $defaultFn
schema = schema.replace(/\.default\(sql\`gen_random_uuid\(\)\`\)/g, '.$defaultFn(() => randomUUID())');

// Replace Postgres text array literal '{}'::text[] with '[]' for JSON
schema = schema.replace(/sql\`'\{\}'::text\[\]\`/g, "sql`'[]'`");

// Remove .defaultNow() for timestamp which is parsed as integer 
// Wait, an integer configured as a timestamp in SQLite uses integer seconds/ms
schema = schema.replace(/\.defaultNow\(\)/g, ".$defaultFn(() => new Date())");

fs.writeFileSync('shared/schema.ts', schema);
console.log("Fixed schema syntax for SQLite");
