import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js'

describe('DB connection', () => {
    it('GET /health/db returns ok', async () => {
        const res = await request(app).get('/health/db');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok')
    })
})