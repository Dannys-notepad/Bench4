import dotenv from 'dotenv/config';

const env = {
    PORT: process.env.PORT || 3000,
    SECRET_KEY: process.env.SECRET_KEY || false,
    DATABASE_URL: process.env.DATABASE_URL || false,
}

export default env;