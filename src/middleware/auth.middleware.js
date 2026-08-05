import jwt from 'jsonwebtoken'
import env from '../config/env.js'
import AppError from '../lib/AppError.js'
import asyncHandler from '../lib/asyncHandler.js'
import tokenRepository from '../repositories/tokens.repo.js'

const requireAuth = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader?.startsWith('Bearer ')) throw new AppError('No token provided', 401)

    const token = authHeader.split(' ')[1];
    try {

        const token = await tokenRepository.findByToken(token)
        if (!token) throw new AppError('This token does not seem to exist, try signing in again', 401)
        if (token && token.status === 'blacklisted') throw new AppError('This token is blacklisted, try signing in again', 401)

        req.user = jwt.verify(token, env.SECRET_KEY);
        next();
    } catch (error) {
        if(error instanceof AppError) throw error
        console.error('Invalid or expired token',error)
        throw new AppError('Invalid or expired token', 401)
    }
})

export default requireAuth