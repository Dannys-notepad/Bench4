import jwt from 'jsonwebtoken'
import env from '../config/env.js'
import AppError from '../lib/AppError.js'
import asyncHandler from '../lib/asyncHandler.js'
import tokenRepository from '../repositories/token.repo.js'

const requireAuth = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided'})

    const token = authHeader.split(' ')[1];

    const tk = await tokenRepository.findByToken(token)
    if (!tk) return res.status(401).json({ message: 'This token does not seem to exist, try signing in again'})
    if (tk && tk.status === 'blacklisted') return res.status(401).json({ message: 'This token is blacklisted, try signing in again'})

    req.user = jwt.verify(token, env.SECRET_KEY);
    next();
})

export default requireAuth