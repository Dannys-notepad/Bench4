import { Router } from 'express';
import passport from '../../config/oauthStrategy.js'
import jwt from 'jsonwebtoken'
import env from '../../config/env.js';
import asyncHandler from '../../lib/asyncHandler.js';

const router = Router();

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
}))

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    asyncHandler((req, res) => {
        const token = jwt.sign(
            { id: req.user.id, email: req.user.email, role: req.user.role },
            env.SECRET_KEY,
            { expiresIn: '7d' }
        )

        // Return token in json
        return res.json({ token })

        // Redirect to frontend with token in query string so it can be saved by the UI
        //return res.redirect(`/app.html?token=${token}`);
    })
)

export default router;