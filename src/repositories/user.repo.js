import db from '../db/client.js'
import { users } from '../db/schema/schema.js'
import { eq } from 'drizzle-orm'

const userRepository = {
    async findAll() {
        return db.select().from(users)
    },

    // async findById(id) {
    //     const [user] = await db.select().from(users).where(eq(users.id, id));
    //     return user ?? null
    // },

    // async create(data) {
    //     const [user] = await db.insert(users).values(data).returning();
    //     return user
    // },

    // async update(id, data) {
    //     consy [user] = await db.update(users).set({...data, update_at: new Date() }).where(eq(users.id, id)).returning()
    //     return user ?? null
    // },

    // async delete(id){
    //     const [user] = await db.delete(users).where(eq(users.id, id)).returning()
    //     return user ?? null
    // },


    // Most relevant for this application
    async findByGoogleId(googleId) {
        const [user] = await db.select().from(users).where(eq(users.googleId, googleId))
        return user ?? null
    },

    async findOrCreateFromGoogle(profile) {
        const existing = await this.findByGoogleId(profile.id)
        if (existing) return existing;

        const [user] = await db.insert(users).values({
            username: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id
        }).returning();

        return user
    }
}

export default userRepository;