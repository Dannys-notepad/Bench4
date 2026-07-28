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
import authRoutes from './modules/auth/auth.route.js';
import healthRoutes from './modules/health/health.route.js'

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended:false }));
app.use(cors());
app.use(helmet());


app.use('/health', healthRoutes)
//app.use('/api/v1/auth', authRoutes)



export default app;