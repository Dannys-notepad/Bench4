import express from 'express';
import asyncHandler from '../../lib/asyncHandler.js';
//import AppError from '../../lib/AppError.js';

// db imports
import db from '../../db/client.js';
import { sql } from 'drizzle-orm';

const router = express.Router();

router.get('/db', asyncHandler(async (req, res) => {
    await db.execute(sql`SELECT 1`)
    res.json({ status: 'ok', db: 'connected' })
}))

export default router;