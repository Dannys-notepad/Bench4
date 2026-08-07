import { Router } from 'express';
import passport from '../../config/oauthStrategy.js'
import jwt from 'jsonwebtoken'
import env from '../../config/env.js';
import tokenRepository from '../../repositories/token.repo.js'
import { success, error } from '../../lib/response.js';

const router = Router();

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
}))

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    async (req, res) => {
        try {

            const token = jwt.sign(
                { id: req.user.id, email: req.user.email },
                env.SECRET_KEY,
                { expiresIn: '7d' }
            )

            const userTokens = await tokenRepository.findAllUserTokens(req.user.id)
            if (userTokens && userTokens.length > 0) {
                const activeToken = userTokens.filter(t => t.status === 'active')
                const blackListToken = await tokenRepository.blackListToken(activeToken[0].id, { status: 'blacklisted' })
                if (!blackListToken) return error(res, 'Could not blacklist token', {}, 500)
            }

            const saveToken = await tokenRepository.add({
                userId: req.user.id,
                token
            })
            if (!saveToken) return error(res, 'Could not save token', {}, 500)

            return success(res, 'User registered', { token }, 201)

            // Redirect to frontend with token in query string so it can be saved by the UI
            //return res.redirect(`/app.html?token=${token}`);
        } catch (e) {
            console.error('Auth error', e)
            return error(res, 'Server Error', {}, 500)
        }
    }
)

export default router;