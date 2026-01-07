import { Router } from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { getAllHistory, getPayments, getSells } from '../controllers/historyController.js';
import { getAllPrices } from '../controllers/priceController.js';


const router = Router();

router.get('/all/history', isAuthenticated, getAllHistory);
router.get('/payments', isAuthenticated, getPayments);
router.get('/sells', isAuthenticated, getSells);
router.get('/prices', isAuthenticated, getAllPrices);

export default router;