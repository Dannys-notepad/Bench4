import { Router } from 'express';
import { success } from '#lib/response.js'
import asyncHandler from '#lib/asyncHandler.js'
import AppError from '#lib/AppError.js'

import db from '#db/client.js';
import { sql } from 'drizzle-orm';

const router = Router();

router.get('/db', asyncHandler(async (req, res) => {
    await db.execute(sql`SELECT 1`)
    return success(res, 'DB connected successfully', { status: 'ok', db: 'connected' })
}))

export default router;
