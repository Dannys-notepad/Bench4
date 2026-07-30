import dotenv from 'dotenv/config';

const env = {
    PORT: process.env.PORT || 8080,
    SECRET_KEY: process.env.SECRET_KEY || false,
    DATABASE_URL: process.env.DATABASE_URL || false,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || false,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || false,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || false
}


export default env;