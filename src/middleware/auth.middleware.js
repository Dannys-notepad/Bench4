import jwt from 'jsonwebtoken'
import env from '../config/env.js'
import AppError from '../lib/AppError.js'
import asyncHandler from '../lib/asyncHandler.js'
import tokenRepository from '../repositories/token.repo.js'
import { error } from '../lib/response.js'

const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if(!authHeader?.startsWith('Bearer ')) return error(res, 'No token provided', {}, 401)

        const token = authHeader.split(' ')[1];

        const tk = await tokenRepository.findByToken(token)
        if (!tk) return error(res, 'This token does not seem to exist, try signing again', {}, 401)
        if (tk && tk.status === 'blacklisted') return error(res, 'This token is blacklisted, try signing in again', {}, 401)

        req.user = jwt.verify(token, env.SECRET_KEY);
        next();
    } catch (e) {
        console.error('Validation Error', e)
        return error(res, 'Server Error', {}, 500)
    }
}

export default requireAuth