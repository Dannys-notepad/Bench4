import db from '../db/client.js'
import { tokens } from '../db/schema/schema.js'
import { eq } from 'drizzle-orm'

const tokenRepository = {
    async findAll() {
        return db.select().from(tokens)
    },

    async findByToken(token) {
        const [tk] = await db.select()
        .from(tokens).where(eq(tokens.token, token))
        
        return tk ?? null
    },

    async findAllUserTokens(userId) {
        const tk = await db.select()
        .from(tokens).where(eq(tokens.userId, userId))
        
        return tk ?? null
    },

    async add(data) {
        const [tk] = await db.insert(tokens).values({
            userId: data.userId,
            token: data.token
        }).returning()

        
        return tk ?? null
    },

    async blackListToken(id, data) {
        const [updated] = await db.update(tokens).set({
            ...data,
            updated_at: new Date()
        }).where(eq(tokens.id, id)).returning()

        return updated ?? null
    }
 
}

export default tokenRepository