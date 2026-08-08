import { Router } from 'express';
import passport from '#config/oauthStrategy.js'
import jwt from 'jsonwebtoken'
import env from '#config/env.js';
import tokenRepository from '#repositories/token.repo.js'
import { success } from '#lib/response.js';
import AppError from '#lib/AppError.js';
import asyncHandler from '#lib/asyncHandler.js';
import requireAuth from '#middleware/auth.middleware.js';

const router = Router();

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
}))

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    asyncHandler(async (req, res) => {
        const token = jwt.sign(
            { id: req.user.id, email: req.user.email },
            env.SECRET_KEY,
            { expiresIn: '7d' }
        )

        const userTokens = await tokenRepository.findAllUserTokens(req.user.id)
        if (userTokens?.length > 0) {
            const activeToken = userTokens.find(t => t.status === 'active')
            if (activeToken) {
                const blackListToken = await tokenRepository.blackListToken(activeToken.id, { status: 'blacklisted' })
                if (!blackListToken) throw new AppError('Could not blacklist token', 500)
            }
        }

        const saveToken = await tokenRepository.add({
            userId: req.user.id,
            token
        })
        if (!saveToken) throw new AppError('Could not save token', 500)

        return success(res, 'User registered', { token }, 201)
    })
)

router.post('/logout', requireAuth, asyncHandler(async (req, res) => {
    const blacklisted = await tokenRepository.blackListToken(req.tokenRecord.id, { status: 'blacklisted' })
    if (!blacklisted) throw new AppError('Could not logout', 500)

    return success(res, 'Logged out successfully')
}))

export default router;
