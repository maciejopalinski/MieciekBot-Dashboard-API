import { Router } from 'express';
import auth from './auth';
import discord from './discord';

import package_info from '../../package.json';
const version = package_info.version + (process.env.DEBUG == 'true' ? '-dev' : '');

const router = Router();

router.get('/', (req, res) => {
    res.send({
        message: 'MieciekBot Dashboard API',
        version,
    });
});

router.use('/auth', auth);
router.use('/discord', discord);

export default router;