import { Router } from 'express';
import passport from 'passport';
import { User, OAuth2 } from '../database/schemas';
import ErrorPages from '../templates/ErrorPages';

const router = Router();

// /api/auth/login
router.get('/login', passport.authenticate('discord'));

// /api/auth/redirect
router.get('/redirect', passport.authenticate('discord'), (req, res) => {
    res.redirect(process.env.DASHBOARD_CLIENT_URL + '/dashboard');
});

// /api/auth/logout
router.get('/logout', async (req, res) => {
    if(req.user) {
        const id = req.user.id;
        await (await User.findOne({ id })).delete();
        await (await OAuth2.findOne({ id })).delete();

        req.session.destroy(() => {
            res.redirect(process.env.DASHBOARD_CLIENT_URL + '/');
        });
    }
    else ErrorPages.unauthorized(res);
});

export default router;