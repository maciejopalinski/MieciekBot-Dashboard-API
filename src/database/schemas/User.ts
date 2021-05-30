import mongoose from 'mongoose';
import { GuildInfo } from 'passport-discord';

export interface IUser extends mongoose.Document {
    id: string;
    username: string;
    discriminator: string;
    avatar: string;
    guilds: GuildInfo[];
}

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    discriminator: { type: String, required: true },
    avatar: { type: String, required: true },
    guilds: { type: [Object], required: true }
});

export const User = mongoose.model<IUser>('User', UserSchema, 'dashboard_users');