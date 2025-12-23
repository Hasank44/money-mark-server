import { Router } from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';
import { setContactByAdmin } from '../controllers/contactController.js';

const router = Router();

router.post('/set/contact', isAuthenticated, roleMiddleware('admin'), setContactByAdmin);

export default router;