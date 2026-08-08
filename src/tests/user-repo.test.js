import { describe, it, expect, beforeEach } from 'vitest'
import userRepository from '#repositories/user.repo.js'
import db from '#db/client.js'
import { users } from '#db/schema/schema.js'

describe('userRepository', () => {
    beforeEach( async () => {
        await db.delete(users);
    })

    it('Finds a user by googleId', async () => {
        const profile = {
            displayName: 'Test user',
            emails: [{ value: 'test@gmail.com' }],
            id: 'oqq871b9qwhf9w0y99q2376by072brvfww'
        }
        const user = await userRepository.findOrCreateFromGoogle(profile)

        const found = await userRepository.findByGoogleId(user.googleId)
        expect(found).not.toBeNull()
        expect(found.username).toBe('Test user')
    })

    it('Returns null for a non existent googl ID', async () => {
        const user = await userRepository.findByGoogleId(909090909)
        expect(user).toBeNull()
    })
})