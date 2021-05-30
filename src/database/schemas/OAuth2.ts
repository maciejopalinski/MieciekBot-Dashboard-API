import mongoose from 'mongoose';

export interface ICredentials extends mongoose.Document {
    id: string;
    accessToken: string; // AES encrypted
    refreshToken: string; // AES encrypted
}

const OAuth2Schema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true }
});

export const OAuth2 = mongoose.model<ICredentials>('OAuth2', OAuth2Schema, 'dashboard_oauth2');