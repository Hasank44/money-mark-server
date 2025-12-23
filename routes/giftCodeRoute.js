import { Router } from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { userGetGiftCode, userGetGiftCodeHistory } from '../controllers/giftCodeController.js';

const router = Router();
router.get('/gift-code/history', isAuthenticated, userGetGiftCodeHistory);
router.post('/redeem/code', isAuthenticated, userGetGiftCode);

export default router;