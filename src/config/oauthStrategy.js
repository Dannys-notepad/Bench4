import passport from 'passport';
import  { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userRepository from '../repositories/user.repo.js';
import env from './env.js'

passport.use(new GoogleStrategy(
    {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL
    },
    async (assessToken, refreshToken, profile, done) => {
        try {
            const user = await userRepository.findOrCreateFromGoogle(profile);
            done(null, user)
        } catch(error) {
            done(error, null)
        }
    }
))

export default passport;