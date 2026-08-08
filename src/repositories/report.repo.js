import db from '#db/client.js'
import { reports } from '#db/schema/schema.js'
import { eq, sql } from 'drizzle-orm'

const reportRepository = {
    async findAll() {
        return db.select().from(reports);
    },

    async find(id) {
        const [report] = await db.select()
        .from(reports).where(eq(reports.id, id));

        return report ?? null
    },

    async findAllByUser(userId) {
        return db.select()
        .from(reports)
        .where(eq(reports.userId, userId))
    },

    async create(data) {
        const [report] = await db.insert(reports).values({
            userId: data.userId,
            reportType: data.reportType,

            title: data.title,
            template: data.template,
            status: data.status,

            editInstructions: data.editInstructions,
            rawPhotoUrls: data.rawPhotoUrls,
            rawPhotoPublicIds: data.rawPhotoPublicIds,
            
            structuredData: data.structuredData,
            flaggedFields: data.flaggedFields,
            aiAssisted: data.aiAssisted,
            version: data.version,
        }).returning()

        return report ?? null
    },

    async update(id, updates) {
        const [report] = await db.update(reports).set({
            ...updates,
            updated_at: new Date()
        }).where(eq(reports.id, id)).returning()

        return report ?? null
    },

    async incrementVersion(id) {
        const [report] = await db.update(reports)
        .set({
            version: sql`${reports.version} + 1`,
            updated_at: new Date()
        })
        .where(eq(reports.id, id))
        .returning()

        return report ?? null
    },

    async delete(id) { 
        const [report] = await db.delete(reports)
        .where(eq(reports.id, id)).returning()

        return report ?? null
    },
}

export default reportRepository
