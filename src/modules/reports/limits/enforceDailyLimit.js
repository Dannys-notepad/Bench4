import PLAN_LIMIT from './planLimits.config.js'
import userRepository from '../../../repositories/user.repo.js'

const enforceDailyLimit = async (userId, type) => {
    try {
        const user = await userRepository.findById(userId)
        const today = new Date().toISOString().slice(0, 10);
        if(!user) return { status: 404, message: 'User not found' }

        if(user.usageResetAt !== today) {
            await userRepository.update(userId, {
                digitizedCountToday: 0,
                guidedCountToday: 0,
                usageResetAt: today
            })
            user.digitizedCounToday = 0
            user.guidedCountToday = 0
        }

        const limit = PLAN_LIMIT[user.plan][type]
        const current = type === 'digitized' ? user.digitizedCounToday : user.guidedCountToday

        if (current >= limit) {
            return {
                status: 429,
                message: `Daily ${type} report limit reached for ${user.plan}`
            }
        }

        return user
    } catch (e) {
        console.error('Error enforcing daily limit',e)
        throw e
    }
}

export default enforceDailyLimit