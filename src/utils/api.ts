import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { GuildInfo } from 'passport-discord';
import { OAuth2 } from '../database/schemas/OAuth2';
import { decrypt, Error } from '../utils';
import { redis_client } from '../index';

axiosRetry(axios, {
    retryCondition: (error) => {
        if (!error.response) return false;
        return error.response.status === 429;
    },
    retryDelay: (count, error) => {
        let retry_after: number = error.response.data.retry_after;
        return retry_after * 1000;
    }
});

const BOT_TOKEN = process.env.DASHBOARD_API_CLIENT_TOKEN;
const DISCORD_API = (endpoint: string) => 'https://discord.com/api/v8' + endpoint;

const fetchGuilds = async (token_type: 'Bot' | 'Bearer', token: string) => {
    return axios.get<GuildInfo[]>(DISCORD_API('/users/@me/guilds'), {
        headers: { Authorization: `${token_type} ${token}` }
    })
    .catch((err: AxiosError) => {
        if (!err.response || err.response.status !== 429) throw new Error(500, "Internal Server Error");
        else throw new Error(err.response.status, err.response.statusText);
    });
}

export const getBotGuilds = async () => {

    const bot_guilds = await new Promise<GuildInfo[]>((resolve, reject) => {
        redis_client.get('/bot/guilds', async (err, result) => {
            if (result) resolve(JSON.parse(result));
            else {
                fetchGuilds('Bot', BOT_TOKEN).then(({ data }) => {
                    redis_client.setex('/bot/guilds', 10, JSON.stringify(data));
                    resolve(data);
                })
                .catch((err: Error) => reject(err));
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
            if (result) resolve(JSON.parse(result));
            else {
                fetchGuilds('Bearer', accessToken).then(({ data }) => {
                    redis_client.setex(`/user/${id}/guilds`, 10, JSON.stringify(data));
                    resolve(data);
                })
                .catch((err: Error) => reject(err));
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