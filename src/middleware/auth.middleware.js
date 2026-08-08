import jwt from 'jsonwebtoken'
import env from '#config/env.js'
import AppError from '#lib/AppError.js'
import asyncHandler from '#lib/asyncHandler.js'
import tokenRepository from '#repositories/token.repo.js'

const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) {
        throw new AppError('No token provided', 401)
    }

    const token = authHeader.split(' ')[1]

    const tk = await tokenRepository.findByToken(token)
    if (!tk) throw new AppError('This token does not seem to exist, try signing again', 401)
    if (tk.status === 'blacklisted') throw new AppError('This token is blacklisted, try signing in again', 401)

    try {
        req.user = jwt.verify(token, env.SECRET_KEY)
    } catch (e) {
        if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
            throw new AppError('Invalid or expired token', 401)
        }
        throw e
    }

    req.tokenRecord = tk
    next()
}

export default asyncHandler(requireAuth)
