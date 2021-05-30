import axios from 'axios';
import { GuildInfo } from 'passport-discord';
import { OAuth2 } from '../database/schemas/OAuth2';
import { decrypt, Error } from '../utils';
import { redis_client } from '../index';

const BOT_TOKEN = process.env.DASHBOARD_API_CLIENT_TOKEN || process.env.BOT_TOKEN;
const DISCORD_API = (endpoint: string) => 'http://discord.com/api/v8' + endpoint;

export const getBotGuilds = async () => {

    const bot_guilds = await new Promise<GuildInfo[]>((resolve, reject) => {
        redis_client.get('/bot/guilds', async (err, result) => {
            if (result) {
                resolve(JSON.parse(result));
            }
            else {
                const fetch = await axios.get<GuildInfo[]>(DISCORD_API('/users/@me/guilds'), {
                    headers: {
                        Authorization: `Bot ${BOT_TOKEN}`
                    }
                });

                redis_client.setex('/bot/guilds', 10, JSON.stringify(fetch.data));
                resolve(fetch.data);
            }
        });
    });

    return bot_guilds;
}

export const getUserGuilds = async (id: string) => {

    const credentials = await OAuth2.findOne({ id });
    const accessToken = decrypt(credentials.accessToken);

    const user_guilds = await new Promise<GuildInfo[]>((resolve, reject) => {
        redis_client.get(`/user/${id}/guilds`, async (err, result) => {
            if (result) {
                resolve(JSON.parse(result));
            }
            else {
                const fetch = await axios.get<GuildInfo[]>(DISCORD_API('/users/@me/guilds'), {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                redis_client.setex(`/user/${id}/guilds`, 10, JSON.stringify(fetch.data));
                resolve(fetch.data);
            }
        });
    });

    return user_guilds;
}

export const getMutualGuilds = async (user: Express.User) => {

    let bot_guilds = await getBotGuilds();
    let user_guilds = await getUserGuilds(user.id);
    
    return user_guilds.filter(uGuild => {
        let isMutual = bot_guilds.some(g => g.id == uGuild.id);
        let hasPermissions = (uGuild.permissions & 0x20) === 0x20;

        return isMutual && hasPermissions;
    });
}