import { describe, it, expect, beforeEach } from 'vitest'
import reportRepository from '../repositories/report.repo.js'
import userRepository from '../repositories/user.repo.js'
import db from '../db/client.js'
import { reports, users } from '../db/schema/schema.js'

let ID = 0;
let counter = 0;
const buildData = (overrides = {}) => {
    counter++
    return {
        userId: ID,
        title: `Test report ${counter}`,
        template: 'test template',
        status: 'draft',
        rawPhotoUrl: `test-url-${counter}`,
        transcript: `test transcript ${counter}`,
        structuredData: { key: 'value' },
        flaggedFields: { key: 'value' },
        version: 1,
        approvedAt: new Date(),
        ...overrides
    }
}

describe('reportRepository', () => {
    beforeEach(async () => {
        await db.delete(reports)
        const profile = {
            displayName: 'Test user',
            emails: [{ value: 'test@gmail.com' }],
            id: 'oqq871b9qwhf9w0y99q2376by072brvfww'
        }
        const user = await userRepository.findOrCreateFromGoogle(profile)
        ID = user.id
    })

    it('Creates a new report', async () => {
        const data = buildData()
        const report = await reportRepository.create(data)
        expect(report).not.toBeNull()
        expect(report.title).toBe(data.title)
    })

    it('Finds a user report by id', async () => {
        const data = buildData()
        const report = await reportRepository.create(data)

        const found = await reportRepository.find(report.id)
        expect(found).not.toBeNull()
        expect(found.title).toBe(data.title)
    })
    
    it('Finds all user reports by the users id', async () => {
        const data = buildData()
        const report = await reportRepository.create(data)

        await reportRepository.create({
            userId: data.userId,
            title: `Test report 1`,
            template: 'test template',
            status: 'draft',
            rawPhotoUrl: `test-url`,
            transcript: `test transcript`,
            structuredData: { key: 'value' },
            flaggedFields: { key: 'value' },
            version: 1,
            approvedAt: new Date(),
        })

        await reportRepository.create({
            userId: data.userId,
            title: `Test report 2`,
            template: 'test template',
            status: 'draft',
            rawPhotoUrl: `test-url`,
            transcript: `test transcript`,
            structuredData: { key: 'value' },
            flaggedFields: { key: 'value' },
            version: 1,
            approvedAt: new Date(),
        })

        const allUserReports = await reportRepository.findAllByUser(data.userId)
        expect(allUserReports.length).toBe(3)
        expect(allUserReports.every(r => r.userId === data.userId)).toBe(true)
    })

    it('Updates a report', async () => {
        const data = buildData()
        const createdReport = await reportRepository.create(data)

        const updated = await reportRepository.update(createdReport.id, { status: 'completed' })

        expect(updated).not.toBeNull()
        expect(updated.status).toBe('completed')
    })

    it('Deletes a report', async () => {
        const data = buildData()
        const createdReport = await reportRepository.create(data)

        const deleted = await reportRepository.delete(createdReport.id)
        expect(deleted).not.toBeNull()

        const found = await reportRepository.find(createdReport.id)
        expect(found).toBeNull()
    })

    it('Increments the version of a report', async () => {
        const data = buildData()
        const createdReport = await reportRepository.create(data)

        const incremented = await reportRepository.incrementVersion(createdReport.id)
        expect(incremented).not.toBeNull()
        expect(incremented.version).toBe(data.version + 1)
    })
})