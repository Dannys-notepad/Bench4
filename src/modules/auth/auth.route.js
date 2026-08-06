import { Router } from 'express';
import passport from '../../config/oauthStrategy.js'
import jwt from 'jsonwebtoken'
import env from '../../config/env.js';
import asyncHandler from '../../lib/asyncHandler.js';
import tokenRepository from '../../repositories/token.repo.js'

const router = Router();

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
}))

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    asyncHandler(async (req, res) => {
        const token = jwt.sign(
            { id: req.user.id, email: req.user.email, role: req.user.role },
            env.SECRET_KEY,
            { expiresIn: '7d' }
        )

        const userTokens = await tokenRepository.findAllUserTokens(req.user.id)
        if (userTokens && userTokens.length > 0) {
            const activeToken = userTokens.filter(t => t.status === 'active')
            const blackListToken = await tokenRepository.blackListToken(activeToken[0].id, { status: 'blacklisted' })
            if (!blackListToken) throw new AppError('Could not blacklist token', 400)
        }

        const saveToken = await tokenRepository.add({
            userId: req.user.id,
            token
        })
        if (!saveToken) throw new AppError('Couldn\'t save token to db', 400)

        // Return token in json
        return res.json({ token })

        // Redirect to frontend with token in query string so it can be saved by the UI
        //return res.redirect(`/app.html?token=${token}`);
    })
)

export default router;