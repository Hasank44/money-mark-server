import { Router } from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { userDeposit } from '../controllers/depositController.js';


const router = Router();

router.post('/deposit', isAuthenticated, userDeposit);

export default router;