import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

// env imports
import env from './config/env.js';

// Passport oauth import
import passport from './config/oauthStrategy.js'

// db imports
// import db from './db/client.js';
// import { users } from './db/schema.js';
// import { eq, sql } from 'drizzle-orm';

// Resource imports
import authRoutes from './modules/auth/auth.route.js';
import healthRoutes from './modules/health/health.route.js'

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended:false }));
app.use(cors());
app.use(helmet());

// passport initialization
app.use(passport.initialize())

app.use('/health', healthRoutes)
app.use('/api/auth', authRoutes)



export default app;