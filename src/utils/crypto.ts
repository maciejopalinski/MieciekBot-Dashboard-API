import CryptoJS from 'crypto-js';

export const encrypt = (input: string) => {
    return CryptoJS.AES.encrypt(input, process.env.DASHBOARD_API_COOKIE_SECRET).toString();
}

export const decrypt = (input: string) => {
    return CryptoJS.AES.decrypt(input, process.env.DASHBOARD_API_COOKIE_SECRET).toString(CryptoJS.enc.Utf8);
}