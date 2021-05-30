import fetch from 'node-fetch';
import { GuildInfo } from 'passport-discord';
import { OAuth2 } from '../database/schemas/OAuth2';
import { decrypt, Error } from '../utils';

const BOT_TOKEN = process.env.DASHBOARD_API_CLIENT_TOKEN || process.env.BOT_TOKEN;
const DISCORD_API = (endpoint: string) => 'http://discord.com/api/v8' + endpoint;

export const getBotGuilds = async () : Promise<GuildInfo[]> => {
    const response = await fetch(DISCORD_API('/users/@me/guilds'), {
        method: 'GET',
        headers: {
            Authorization: `Bot ${BOT_TOKEN}`
        }
    });

    if(response.status != 200) throw new Error(response.status, response.statusText);
    return response.json();
}

export const getUserGuilds = async (id: string) => {
    const credentials = await OAuth2.findOne({ id });
    const accessToken = decrypt(credentials.accessToken);
    
    const response = await fetch(DISCORD_API('/users/@me/guilds'), {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if(!response.ok) throw new Error(response.status, response.statusText);
    return await response.json();
}

export const getMutualGuilds = async (user: Express.User) => {
    let bot_guilds = await getBotGuilds().catch((err: Error) => {
        throw err;
    });
    
    return user.guilds.filter(uGuild => {
        let isMutual = bot_guilds.some(g => g.id == uGuild.id);
        let hasPermissions = (uGuild.permissions & 0x20) === 0x20;

        return isMutual && hasPermissions;
    });
}