import enforceDailyLimit from '#modules/reports/limits/enforceDailyLimit.js'
import asyncHandler from '#lib/asyncHandler.js'

export const checkDigitizedLimit = asyncHandler(async (req, res, next) => {
    await enforceDailyLimit(req.user.id, 'digitized')
    next()
})

export const checkGuidedLimit = asyncHandler(async (req, res, next) => {
    await enforceDailyLimit(req.user.id, 'guided')
    next()
})
