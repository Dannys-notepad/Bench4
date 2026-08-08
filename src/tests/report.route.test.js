import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '#app.js'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import reportRepository from '#repositories/report.repo.js'
import userRepository from '#repositories/user.repo.js'
import tokenRepository from '#repositories/token.repo.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

vi.mock('../repositories/user.repo.js', () => ({
    default: {
        findById: vi.fn(),
        update: vi.fn(),
        incrementUsage: vi.fn()
    }
}))

vi.mock('../repositories/token.repo.js', () => ({
    default: {
        findByToken: vi.fn()
    }
}))

vi.mock('../lib/queue/transcriptionQueue.js', () => ({
    enqueueTranscriptionJob: vi.fn()
}))

vi.mock('../config/upload.js', async () => {
    const mod = await import('multer')
    const multer = mod.default || mod
    return {
        upload: multer({ storage: multer.memoryStorage() })
    }
})

const mockAuth = () => {
    jwt.verify.mockReturnValue({ id: 'test-user-id' })
    tokenRepository.findByToken.mockResolvedValue({ id: 'token-1', status: 'active' })
}

describe('POST /api/reports/new/digitized', () => {
    const dummyFilePath = path.join(__dirname, 'dummy.jpg')

    beforeEach(() => {
        vi.clearAllMocks()
        mockAuth()

        userRepository.findById.mockResolvedValue({
            id: 'test-user-id',
            plan: 'free',
            digitizedCountToday: 0,
            guidedCountToday: 0,
            usageResetAt: new Date().toISOString().slice(0, 10)
        })
        userRepository.incrementUsage.mockResolvedValue({})

        if (!fs.existsSync(dummyFilePath)) {
            fs.writeFileSync(dummyFilePath, 'dummy image content')
        }
    })

    it('should return 401 if no auth token is provided', async () => {
        const res = await request(app)
            .post('/api/reports/new/digitized')
            .field('title', 'My Report')

        expect(res.status).toBe(401)
        expect(res.body.message).toBe('No token provided')
    })

    it('should return 400 if validation fails (missing title)', async () => {
        const res = await request(app)
            .post('/api/reports/new/digitized')
            .set('Authorization', 'Bearer dummy-token')
            .field('template', 'titration')
            .field('reportType', 'digitized')
            .attach('photos', dummyFilePath)

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Validation failed')
    })

    it('should return 400 if file is missing', async () => {
        const res = await request(app)
            .post('/api/reports/new/digitized')
            .set('Authorization', 'Bearer dummy-token')
            .field('title', 'My Valid Title')
            .field('template', 'titration')
            .field('reportType', 'digitized')

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('No uploaded file provided')
    })

    it('should successfully create a report and return 201', async () => {
        reportRepository.create.mockResolvedValue({
            id: 'report-123',
            title: 'My Valid Title',
            template: 'titration',
            status: 'draft',
            reportType: 'digitized',
            userId: 'test-user-id',
            rawPhotoUrls: ['iu0qb9iq', 'awoqnqiu'],
            rawPhotoPublicIds: ['oiunun0q', 'aijqoni']
        })

        const res = await request(app)
            .post('/api/reports/new/digitized')
            .set('Authorization', 'Bearer dummy-token')
            .field('title', 'My Valid Title')
            .field('template', 'titration')
            .field('reportType', 'digitized')
            .attach('photos', dummyFilePath)

        expect(res.status).toBe(201)
        expect(res.body.message).toBe('Report created successfully')
        expect(res.body.data.id).toBe('report-123')
        expect(reportRepository.create).toHaveBeenCalledOnce()
        expect(userRepository.incrementUsage).toHaveBeenCalledWith('test-user-id', 'digitized')
    })
})

describe('GET /api/reports/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockAuth()
    })

    it('should return 401 if no auth token is provided', async () => {
        const res = await request(app).get('/api/reports/123')
        expect(res.status).toBe(401)
    })
})

describe('PATCH /api/reports/:id/confirm-transcript', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockAuth()
    })

    it('should return 400 if validation fails (empty transcript)', async () => {
        const res = await request(app)
            .patch('/api/reports/123/confirm-transcript')
            .set('Authorization', 'Bearer dummy-token')
            .send({ transcript: '' })

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Validation failed')
    })
})

describe('POST /api/reports/:id/finalize', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockAuth()
    })

    it('should return 400 if validation fails (missing structuredData)', async () => {
        const res = await request(app)
            .post('/api/reports/123/finalize')
            .set('Authorization', 'Bearer dummy-token')
            .send({})

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Validation failed')
    })
})
