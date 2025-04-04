import dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'local';
dotenv.config({ path: `.env.${env}` });

export default {
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET || 'adjhasdq8e99qw@323',
    dbUrl: process.env.DATABASE_URL
};