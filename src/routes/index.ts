import { Router } from 'express';
import auth from './auth';
import discord from './discord';

const router = Router();

router.get('/', (req, res) => {
    res.send({
        message: 'MieciekBot Dashboard API'
    });
});

router.use('/auth', auth);
router.use('/discord', discord);

export default router;