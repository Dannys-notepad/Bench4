import express from 'express';

// env imports
import env from '../../config/env.js';

// db imports
import db from '../../db/client.js';
import { users } from '../../db/schema.js';
import { sql } from 'drizzle-orm';

const router = express.Router();

router.get('/db', async (req, res) => {
    try {
        await db.execute(sql`SELECT 1`)
        res.json({ status: 'ok', db: 'connected' })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
})

export default router;