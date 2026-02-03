import { Router } from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { getMobileRechargeByUser, mobileRechargeController } from '../controllers/mobileRechargeController.js';

const router = Router();

router.get('/mobile-recharge/history', isAuthenticated, getMobileRechargeByUser);
router.post('/mobile-recharge', isAuthenticated, mobileRechargeController);

export default router;