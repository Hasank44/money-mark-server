import { Router } from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { userGmailSell } from '../controllers/gmailController.js';

const router = Router();

router.post('/sell/gmail', isAuthenticated, userGmailSell);

export default router;