import fs from 'fs';

try {
    let schema = fs.readFileSync('shared/schema.ts', 'utf-8');

    // Replace PostgreSQL imports with SQLite equivalents + wrappers
    schema = schema.replace(
        /import \{ pgTable, text, varchar, integer, boolean, jsonb, timestamp \} from "drizzle-orm\/pg-core";/,
        `import { sqliteTable as pgTable, text, integer } from "drizzle-orm/sqlite-core";
const varchar = text;
const jsonb = (name: string) => text(name, { mode: "json" });
const boolean = (name: string) => integer(name, { mode: "boolean" });
const timestamp = (name: string) => integer(name, { mode: "timestamp" });`
    );

    // Fix array() calls - SQLite doesn't support them natively, map to JSON
    schema = schema.replace(/text\("([^"]+)"\)\.array\(\)/g, 'text("$1", { mode: "json" })');
    schema = schema.replace(/integer\("([^"]+)"\)\.array\(\)/g, 'text("$1", { mode: "json" })');

    fs.writeFileSync('shared/schema.ts', schema);

    let dbStorage = fs.readFileSync('server/dbStorage.ts', 'utf-8');
    dbStorage = dbStorage.replace(/ilike/g, 'like');
    dbStorage = dbStorage.replace(/GREATEST/g, 'MAX');
    dbStorage = dbStorage.replace(/NOW\(\)/g, "CURRENT_TIMESTAMP");
    fs.writeFileSync('server/dbStorage.ts', dbStorage);

    let db = fs.readFileSync('server/db.ts', 'utf-8');
    db = db.replace(/drizzle-orm\/node-postgres/g, 'drizzle-orm/better-sqlite3');
    db = db.replace(/import pg from "pg";/, "import Database from 'better-sqlite3';");
    db = db.replace(/export const pool = new pg.Pool\({[\s\S]*?}\);/, "");
    db = db.replace(/export const db = drizzle\(pool, \{ schema \}\);/, "const sqlite = new Database('sqlite.db');\\nexport const db = drizzle(sqlite, { schema });");
    fs.writeFileSync('server/db.ts', db);

    let indexTs = fs.readFileSync('server/index.ts', 'utf-8');
    indexTs = indexTs.replace(/connectPgSimple\(session\)/, "connectSqlite3(session)");
    indexTs = indexTs.replace(/import connectPgSimple from "connect-pg-simple";/, 'import connectSqlite3 from "connect-sqlite3";');
    indexTs = indexTs.replace(/new PgStore\(\{[\s\S]*?\}\)/, "new PgStore({ db: 'sessions.db', dir: '.', table: 'user_sessions' })");
    fs.writeFileSync('server/index.ts', indexTs);

    console.log("Migration script complete");
} catch (e) {
    console.error(e);
}
