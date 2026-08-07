import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../app.js'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import reportRepository from '../repositories/report.repo.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 1. Mock dependencies to isolate the route logic
vi.mock('jsonwebtoken', () => ({
    default: {
        verify: vi.fn()
    }
}))

vi.mock('../repositories/report.repo.js', () => ({
    default: {
        create: vi.fn()
    }
}))

// We mock the upload config to use standard memory storage instead of Cloudinary.
// We use an async mock factory to dynamically import multer, avoiding Vitest's hoisting errors.
vi.mock('../config/upload.js', async () => {
    const mod = await import('multer')
    const multer = mod.default || mod
    return {
        upload: multer({ storage: multer.memoryStorage() })
    }
})

describe('POST /api/reports/new', () => {
    // Create a dummy file to use for uploads
    const dummyFilePath = path.join(__dirname, 'dummy.jpg')

    beforeEach(() => {
        vi.clearAllMocks()
        // Reset JWT verify to always succeed with a dummy user
        jwt.verify.mockReturnValue({ id: 'test-user-id' })

        // Ensure dummy file exists for the test
        if (!fs.existsSync(dummyFilePath)) {
            fs.writeFileSync(dummyFilePath, 'dummy image content')
        }
    })

    it('should return 401 if no auth token is provided', async () => {
        const res = await request(app)
            .post('/api/reports/new')
            .field('title', 'My Report')

        expect(res.status).toBe(401)
        expect(res.body.error).toBe('No token provided')
    })

    it('should return 401 if validation fails (missing title)', async () => {
        const res = await request(app)
            .post('/api/reports/new')
            .set('Authorization', 'Bearer dummy-token')
            .field('template', 'titration')
            .attach('photo', dummyFilePath)

        expect(res.status).toBe(401)
        expect(res.body.error).toBe('Validation failed')
    })

    it('should return 400 if file is missing', async () => {
        const res = await request(app)
            .post('/api/reports/new')
            .set('Authorization', 'Bearer dummy-token')
            .field('title', 'My Valid Title')
            .field('template', 'titration')

        expect(res.status).toBe(400)
        expect(res.body.error).toBe('No uploaded file provided')
    })

    it('should successfully create a report and return 201', async () => {
        // Mock successful DB creation
        reportRepository.create.mockResolvedValue({
            id: 'report-123',
            title: 'My Valid Title',
            template: 'titration',
            status: 'draft',
            userId: 'test-user-id',
            rawPhotoUrls: ['iu0qb9iq', 'awoqnqiu'],
            rawPhotoPublicIds: ['oiunun0q', 'aijqoni']
        })

        const res = await request(app)
            .post('/api/reports/new')
            .set('Authorization', 'Bearer dummy-token')
            .field('title', 'My Valid Title')
            .field('template', 'titration')
            .attach('photo', dummyFilePath)

        expect(res.status).toBe(201)
        expect(res.body.message).toBe('Report created successfully')
        expect(res.body.data.id).toBe('report-123')

        // Verify that the repository was called with the correct payload
        expect(reportRepository.create).toHaveBeenCalledOnce()
    })
})

describe('GET /api/reports/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        jwt.verify.mockReturnValue({ id: 1 })
    })

    it('should return 401 if no auth token is provided', async () => {
        const res = await request(app).get('/api/reports/123')
        expect(res.status).toBe(401)
    })
})

describe('PUT /api/reports/:id/confirm-transcript', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        jwt.verify.mockReturnValue({ id: 1 })
    })

    it('should return 400 if validation fails (empty transcript)', async () => {
        const res = await request(app)
            .put('/api/reports/123/confirm-transcript')
            .set('Authorization', 'Bearer dummy-token')
            .send({ transcript: '' })

        expect(res.status).toBe(400)
    })
})

describe('POST /api/reports/:id/finalize', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        jwt.verify.mockReturnValue({ id: 1 })
    })

    it('should return 400 if validation fails (missing structuredData)', async () => {
        const res = await request(app)
            .post('/api/reports/123/finalize')
            .set('Authorization', 'Bearer dummy-token')
            .send({})

        expect(res.status).toBe(400)
    })
})
