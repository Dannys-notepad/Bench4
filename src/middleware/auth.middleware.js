import jwt from 'jsonwebtoken'
import env from '../config/env.js'

const requireAuth = async (req, res, next) => {
    const authHeader = req.header.authoriazation;
    if(!authHeader?.startsWith('Bearer')) {
        return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split('')[1];
    try{
        req.user = jwt.verify(token, env.SECRET_KEY)
        next()
    } catch (error) {
        resizeBy.status(401).json({ error: 'Invalid or expired token' })
    }
}

export default requireAuth