import { describe, it, expect, beforeEach } from 'vitest'
import tokenRepository from '../repositories/token.repo.js'
import userRepository from '../repositories/user.repo.js'
import db from '../db/client.js'
import { tokens, users } from '../db/schema/schema.js'

let ID = 0;
let counter = 0;
const buildData = (overrides = {}) => {
    counter++
    return {
        userId: ID,
        token: 'aooiqjqpoi9849i9qn949nnq9jq9uq9ugii9098u9jn9nw',
    }
}

describe('tokenRepository', () => {
    beforeEach(async () => {
        await db.delete(tokens)
        const profile = {
            displayName: 'Test user',
            emails: [{ value: 'test@gmail.com' }],
            id: 'oqq871b9qwhf9w0y99q2376by072brvfww'
        }
        const user = await userRepository.findOrCreateFromGoogle(profile)
        ID = user.id
    })

    it('Adds a new token', async () => {
        const data = buildData()
        const tk = await tokenRepository.add(data)
        expect(tk).not.toBeNull()
        expect(tk.token).toBe(data.token)
    })

    it('Finds by token', async () => {
        const data = buildData()
        const tk = await tokenRepository.add(data)

        const found = await tokenRepository.findByToken(tk.token)
        expect(found).not.toBeNull()
        expect(found.token).toBe(data.token)
    })
    
    it('Finds all user tokens', async () => {
        const data = buildData()
        const tk = await tokenRepository.add(data)

        await tokenRepository.add({
            userId: data.userId,
            token: 'iuiaubaihsdiashahaiufaad'
        })

        await tokenRepository.add({
            userId: data.userId,
            token: 'iuiaubaihsdiashahaiufaad'
        })

        const allUserTokens = await tokenRepository.findAllUserTokens(data.userId)
        expect(allUserTokens.length).toBe(3)
        expect(allUserTokens.every(t => t.userId === data.userId)).toBe(true)
    })

    it('Updates the status of a token', async () => {
        const data = buildData()
        const createdToken = await tokenRepository.add(data)

        const updated = await tokenRepository.blackListToken(createdToken.id, { status: 'blacklisted' })

        expect(updated).not.toBeNull()
        expect(updated.status).toBe('blacklisted')
    })
})

