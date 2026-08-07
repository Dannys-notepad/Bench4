import enforceDailyLimit from './enforceDailyLimit.js'
import { error } from '../../../lib/response.js'

export const checkDigitizedLimit = async (req, res, next) => {
    try {
        const enforce = await enforceDailyLimit(req.user.id, 'digitized')

        if (enforce?.status) return error(res, enforce.message, {}, enforce.status)
        next()

    } catch (e) {
        console.error('Error enforcing user digitized limit', e)
        return error(res, 'Server Error', {}, 500)
    }
}

export const checkGuidedLimit = async (req, res, next) => {
    try {
        const enforce = enforceDailyLimit(req.user.id, 'guided')

        if (enforce?.status) return error(res, enforce.message, {}, enforce.status)
        next()

    } catch (e) {
        console.error('Error enforcing user guided limit', e)
        return error(res, 'Server Error', {}, 500)
    }
}