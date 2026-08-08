import PLAN_LIMIT from '#modules/reports/limits/planLimits.config.js'
import userRepository from '#repositories/user.repo.js'
import AppError from '#lib/AppError.js'

const enforceDailyLimit = async (userId, type) => {
    const user = await userRepository.findById(userId)
    if (!user) throw new AppError('User not found', 404)

    const today = new Date().toISOString().slice(0, 10)

    if (user.usageResetAt !== today) {
        await userRepository.update(userId, {
            digitizedCountToday: 0,
            guidedCountToday: 0,
            usageResetAt: today
        })
        user.digitizedCountToday = 0
        user.guidedCountToday = 0
    }

    const limit = PLAN_LIMIT[user.plan][type]
    const current = type === 'digitized' ? user.digitizedCountToday : user.guidedCountToday

    if (current >= limit) {
        throw new AppError(`Daily ${type} report limit reached for ${user.plan} plan`, 429)
    }

    return user
}

export default enforceDailyLimit
