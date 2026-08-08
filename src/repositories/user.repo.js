import db from '#db/client.js'
import { users } from '#db/schema/schema.js'
import { eq, sql } from 'drizzle-orm'

const userRepository = {
    async findAll() {
        return db.select().from(users)
    },

    async findById(id) {
        const [user] = await db.select()
        .from(users).where(eq(users.id, id))
        return user ?? null
    },

    async findByGoogleId(googleId) {
        const [user] = await db.select()
        .from(users).where(eq(users.googleId, googleId))
        
        return user ?? null
    },

    async createFromGoogle(profile) {
        const [user] = await db.insert(users).values({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value ?? null
        }).returning();

        return user ?? null
    },

    async findOrCreateFromGoogle(profile) {
        let user = await this.findByGoogleId(profile.id)
        if (!user) user = await this.createFromGoogle(profile)
        return user
    },

    async update(userId, updates) {
        const [user] = await db.update(users)
        .set({ ...updates, updated_at: new Date() })
        .where(eq(users.id, userId)).returning()

        return user ?? null
    },

    async incrementUsage(userId, type) {
        const column = type === 'digitized'
            ? users.digitizedCountToday
            : users.guidedCountToday

        const [user] = await db.update(users)
        .set({
            [type === 'digitized' ? 'digitizedCountToday' : 'guidedCountToday']: sql`${column} + 1`,
            updated_at: new Date()
        })
        .where(eq(users.id, userId))
        .returning()

        return user ?? null
    }
}

export default userRepository
