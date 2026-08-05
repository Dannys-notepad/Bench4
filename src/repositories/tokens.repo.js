import db from '../db/client.js'
import { blackListedTokens } from '../db/schema/schema.js'
import { eq } from 'drizzle-orm'

const tokenRepository = {
    async findAll() {
        return db.select().from(tokens)
    },

    async findByToken(token) {
        const [token] = await db.select().from(tokens).where(eq(tokens.token, token))
        return token ?? null
    },

    async findAllUserTokens(userId) {
        const token = await db.select().from(tokens).where(eq(tokens.userId, userId))
        return token ?? null
    },

    async create(data) {
        const token = await db.insert(tokens).values({
            userId: data.userId,
            token: data.token
        }).returning()

        return token ?? null
    },

    async blackListToken(id, data) {
        const existing = await this.findAllUserTokens(userId)
        if(!existing) return null

        const [token] = await db.update(tokens).set({
            ...data,
            updated_at: new Date()
        }).where(eq(tokens.userId, userId))
    }


 
}

export default tokenRepository