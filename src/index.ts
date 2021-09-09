import express from 'express';
import bodyparser from 'body-parser';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import responseTime from 'response-time';
import redis from 'redis';

import routes from './routes';
import './strategies/discord';
import { IUser } from './database/schemas';
import ErrorPages from './templates/ErrorPages';

import './utils/console';

declare global {
    namespace Express {
        interface User extends IUser {}
    }
}

const DATABASE = process.env.DASHBOARD_API_DATABASE || process.env.DATABASE;
const PORT = +process.env.DASHBOARD_API_PORT || +process.env.PORT;

const app = express();
export const redis_client = redis.createClient(process.env.REDIS_URL);

mongoose.connect(DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});

app.use(bodyparser.json());

app.use(cors({
    origin: [ process.env.DASHBOARD_CLIENT_URL ],
    credentials: true
}));

app.use(session({
    secret: process.env.DASHBOARD_API_COOKIE_SECRET,
    cookie: { maxAge: 60000 * 60 * 24 },
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: DATABASE, collectionName: 'dashboard_sessions' })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(responseTime());

app.get('/', (req, res) => res.redirect('/api'));
app.use('/api', routes);
app.get('*', (req, res) => ErrorPages.not_found(res));

app.listen(PORT, () => console.info(`MieciekBot Dashboard API running on port ${PORT}`));