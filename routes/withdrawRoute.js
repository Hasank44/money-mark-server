import { Router } from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { userWithdraw } from '../controllers/withdrawController.js';


const router = Router();

router.post('/withdraw/request', isAuthenticated, userWithdraw);

export default router;