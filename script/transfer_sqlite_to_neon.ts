import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import Database from "better-sqlite3";
import * as schema from "../shared/schema";
import path from "path";

const SQLITE_PATH = path.resolve(process.cwd(), "sqlite.db");
const NEON_URL = "postgresql://neondb_owner:npg_6jBJGZb1awNp@ep-aged-star-anp78xdi-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

async function transfer() {
    console.log("Starting data transfer from SQLite to Neon...");

    const sqliteDb = new Database(SQLITE_PATH);
    const pgClient = postgres(NEON_URL, { ssl: "require", timeout: 10000 });
    const dbPg = drizzlePg(pgClient, { schema });

    // The physical table names in SQLite usually match the pgTable definition
    const tables = [
        { name: "users", table: schema.users },
        { name: "contents", table: schema.contents },
        { name: "quiz_questions", table: schema.quizQuestions },
        { name: "quiz_attempts", table: schema.quizAttempts },
        { name: "comments", table: schema.commentsTable },
        { name: "badges", table: schema.badges },
        { name: "user_badges", table: schema.userBadges },
        { name: "rooms", table: schema.rooms },
        { name: "room_members", table: schema.roomMembers },
        { name: "missions", table: schema.missions },
        { name: "follows", table: schema.follows },
        { name: "activities", table: schema.activities },
        { name: "room_posts", table: schema.roomPosts },
        { name: "notifications", table: schema.notifications },
        { name: "video_engagements", table: schema.videoEngagements },
        { name: "engagement_stats", table: schema.engagementStats },
        { name: "content_likes", table: schema.contentLikes },
        { name: "comment_likes", table: schema.commentLikes },
        { name: "room_post_likes", table: schema.roomPostLikes },
    ];

    for (const { name, table } of tables) {
        try {
            console.log(`Transferring table: ${name}...`);
            const rows = sqliteDb.prepare(`SELECT * FROM ${name}`).all();
            
            if (rows.length === 0) {
                console.log(`Table ${name} is empty, skipping.`);
                continue;
            }

            const sanitizedRows = rows.map(row => {
                const newRow = { ...row };
                for (const key in newRow) {
                    if (newRow[key] === null) continue;
                    
                    // Convert booleans (SQLite stores them as 0/1)
                    if (typeof newRow[key] === 'number' && (key.startsWith('is') || key === 'completed' || key === 'onboardingCompleted' || key === 'read' || key === 'liked' || key === 'commented' || key === 'saved' || key === 'shared')) {
                        newRow[key] = Boolean(newRow[key]);
                    }
                    // Parse JSON fields (Postgres expects objects, SQLite stores strings)
                    if (typeof newRow[key] === 'string' && (newRow[key].startsWith('[') || newRow[key].startsWith('{'))) {
                        try {
                            newRow[key] = JSON.parse(newRow[key]);
                        } catch (e) {}
                    }
                }
                return newRow;
            });

            // Split into chunks of 50 to avoid big payload issues
            const chunks = [];
            for (let i = 0; i < sanitizedRows.length; i += 50) {
                chunks.push(sanitizedRows.slice(i, i + 50));
            }

            for (const chunk of chunks) {
                await dbPg.insert(table).values(chunk).onConflictDoNothing();
            }
            
            console.log(`Successfully transferred ${rows.length} rows for ${name}.`);
        } catch (err) {
            console.error(`Error transferring ${name}:`, err.message);
        }
    }

    console.log("Transfer completed!");
    await pgClient.end();
    sqliteDb.close();
}

transfer().catch(console.error);
