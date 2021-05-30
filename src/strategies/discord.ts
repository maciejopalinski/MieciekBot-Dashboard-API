import passport from 'passport';
import DiscordStrategy from 'passport-discord';
import { User } from '../database/schemas';
import { OAuth2 } from '../database/schemas/OAuth2';
import { encrypt } from '../utils';

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findOne({ id });
        return user ? done(null, user) : done(null, null);
    } catch (err) {
        console.error(err);
        done(err, null);
    }
})

passport.use(
    new DiscordStrategy({
        clientID: process.env.DASHBOARD_API_CLIENT_ID,
        clientSecret: process.env.DASHBOARD_API_CLIENT_SECRET,
        callbackURL: '/api/auth/redirect',
        scope: ['identify', 'guilds']
    }, async (accessToken, refreshToken, profile, done) => {
        
        let { id, username, discriminator, avatar, guilds } = profile;

        if(!profile.avatar) {
            let default_avatar_index = +profile.discriminator % 5;
            profile.avatar = `https://cdn.discordapp.com/embed/avatars/${default_avatar_index}.png`;
        }

        try {
            accessToken = encrypt(accessToken);
            refreshToken = encrypt(refreshToken);

            const findUser = await User.findOneAndUpdate({ id }, { username, discriminator, avatar, guilds });
    
            if(findUser) {
                await OAuth2.findOneAndUpdate({ id }, { accessToken, refreshToken });
                return done(null, findUser);
            }
            else {
                const newUser = await User.create({ id, username, discriminator, avatar, guilds });
                await OAuth2.create({ id, accessToken, refreshToken });

                return done(null, newUser);
            }
        } catch (err) {
            console.error(err);
            return done(err, null);
        }
    })
);