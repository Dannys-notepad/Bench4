import db from '../db/client.js'
import { users } from '../db/schema/schema.js'
import { eq } from 'drizzle-orm'

const userRepository = {
    async findAll() {
        return db.select().from(users)
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

    async update(userId, updates) {
        const [user] = db.update(users)
        .set(updates).where(eq(users.id, userId)).returning()

        return user ?? null
    }
}

export default userRepository;