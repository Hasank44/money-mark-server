import { Router } from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { getAllHistory, getPayments, getSells } from '../controllers/historyController.js';


const router = Router();

router.get('/all/history', isAuthenticated, getAllHistory);
router.get('/payments', isAuthenticated, getPayments);
router.get('/sells', isAuthenticated, getSells);

export default router;