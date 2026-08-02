import db from '../db/client.js'
import { reports } from '../db/schema/schema.js'
import { eq } from 'drizzle-orm'

const reportRepository = {
    async findAll() {
        return db.select().from(reports);
    },

    async find(id) {
        const [report] = await db.select().from(reports).where(eq(reports.id, id));
        return report ?? null
    },

    async findAllByUser(userId) {
        const report = await db.select().from(reports).where(eq(reports.userId, userId))
        return report ?? null
    },

    async create(data) {
        const [report] = await db.insert(reports).values({
            userId: data.userId,
            title: data.title,
            template: data.template,
            status: data.status,
            rawPhotoUrl: data.rawPhotoUrl,
            transcript: data.transcript,
            structuredData: data.structuredData,
            flaggedFields: data.flaggedFields,
            version: data.version,
            approvedAt: data.approvedAt
        }).returning()

        return report ?? null
    },

    async update(id, data) {
        const existing = await this.find(id)
        if (!existing) return null

        const [report] = await db.update(reports).set({
            ...data,
            updated_at: new Date()
        }).where(eq(reports.id, id)).returning()

        return report ?? null
    },

    async delete(id) {
        const existing = await this.find(id)
        if (!existing) return null 

        const [report] = await db.delete(reports).where(eq(reports.id, id)).returning()
        return report ?? null
    },

    async updateStatus(id, status) {
        const existing = await this.find(id)
        if (!existing) return null

        const [report] = await db.update(reports).set({
            status,
            updated_at: new Date()
        }).where(eq(reports.id, id)).returning()

        return report ?? null
    },

    async incrementVersion(id) {
        const existing = await this.find(id)
        if (!existing) return null

        const [report] = await db.update(reports).set({
            version: existing.version + 1,
            updated_at: new Date()
        }).where(eq(reports.id, id)).returning()

        return report ?? null
    }
}

export default reportRepository;