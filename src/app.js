import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
// import path from 'path';
// import { fileURLToPath } from 'url';

// env imports
import env from '#config/env.js';

// Passport oauth import
import passport from '#config/oauthStrategy.js';

// Custom middlware imports
import notFound from '#middleware/404.middlware.js';
import errHandler from '#middleware/error.middleware.js';
import reqLogger from '#middleware/reqLogger.middleware.js';

// Resource imports
import authRoutes from '#modules/auth/auth.route.js';
import healthRoutes from '#modules/health/health.route.js';
import reportRoutes from '#modules/reports/report.route.js';

const app = express();

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet({
    //contentSecurityPolicy: false // Disabled temporarily to allow inline scripts in the HTML for testing
}))
app.use(cors())

// Request Logger should run before routes
app.use(reqLogger)

// Serve static frontend files from the public directory
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
// app.use(express.static(path.join(__dirname, '../public')));

// passport initialization
app.use(passport.initialize())

app.use('/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/reports', reportRoutes)

// Custom error handling middlewares must be placed AFTER all routes
app.use(notFound)
app.use(errHandler)

export default app;