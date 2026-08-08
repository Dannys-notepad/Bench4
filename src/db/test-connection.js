import db from '#db/client.js';
import { sql } from 'drizzle-orm';

async function testConnection() {
    try {
        const result = await db.execute(sql`SELECT NOW()`);
        console.log('Database connection successful', result.rows[0]);
        process.exit(0); // Exit the process successfully
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1); // Exit the process with an error code
    }
}