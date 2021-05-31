import { Router } from 'express';
import { getMutualGuilds, Error } from '../utils';
import { Guild } from '../database/schemas';
import ErrorPages from '../templates/ErrorPages';

const router = Router();

// /api/discord/@me
router.get('/@me', (req, res) => {
    if(req.user) {
        res.send(req.user);
    }
    else ErrorPages.unauthorized(res);
});

// /api/discord/guilds/mutual
router.get('/guilds/mutual', async (req, res) => {
    if(req.user) {
        getMutualGuilds(req.user)
        .then(mutualGuilds => {
            res.send(mutualGuilds);
        })
        .catch((err: Error) => {
            err.send(res);
        });
    }
    else ErrorPages.unauthorized(res);
});

// /api/discord/guilds/:id/config
router.get('/guilds/:id/config', async (req, res) => {    
    let guildID = req.params.id;

    if(req.user) {
        getMutualGuilds(req.user)
        .then(async (mutual) => {
            if(mutual.some(g => g.id == guildID)) {
                let guild = await Guild.findOne({ guildID });
                res.send(guild);
            }
            else ErrorPages.not_found(res);
        })
        .catch((err: Error) => {
            err.send(res)
        });
    }
    else ErrorPages.unauthorized(res);
});

// /api/discord/guilds/:id/api
router.get('/guilds/:id/api', async (req, res) => {
    let guildID = req.params.id;

    if(req.user) {
        getMutualGuilds(req.user)
        .then(async (mutual) => {
            res.send(mutual.find(g => g.id == guildID));
        })
        .catch((err: Error) => {
            err.send(res);
        });
    }
    else ErrorPages.unauthorized(res);
});

export default router;