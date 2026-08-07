import express from 'express';
import { success, error } from '../../lib/response.js'

// db imports
import db from '../../db/client.js';
import { sql } from 'drizzle-orm';

const router = express.Router();

router.get('/db', async (req, res) => {
    try{
        await db.execute(sql`SELECT 1`)
        return success(res, 'DB connected sucessfully', { status: 'ok', db: 'connected' }, 200)
    } catch (e) {
        console.error('DB connection error', e)
        return error(res, 'Server Error', {}, 500)
    }
})

export default router;