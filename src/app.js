import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

// env imports
import env from './config/env.js';

// db imports
import db from './db/client.js';
import { users } from './db/schema.js';
import { eq, sql } from 'drizzle-orm';

// Resource imports
import authRoutes from './modules/auth/auth.route.js'

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended:false }));
app.use(cors());
app.use(helmet());

app.get('/', async (req, res) => {
    try {
        await db.execute(sql`SELECT 1`)
        res.json({ status: 'okay', db: 'connected' })
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message })
    }
})

//app.use('/api/v1/auth', authRoutes)

export default app;