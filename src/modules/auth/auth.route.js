import { Router } from 'express';
import passport from '../../config/oauthStrategy.js'
import jwt from 'jsonwebtoken'
import env from '../../config/env.js';

const router = Router();

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
}))

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user.id, email: req.user.email, role: req.user.role },
            env.SECRET_KEY,
            { expiresIn: '7d' }
        )

        // Options
        // A: redirect to frontend with token in query
        //return res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
        // B: return JSON if no separate frontend yet
        return res.json({ token, user: req.user })
    }
)

export default router;