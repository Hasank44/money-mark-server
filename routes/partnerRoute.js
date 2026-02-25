import { Router } from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { createPartnerController } from '../controllers/partnerController.js';
import { createPartnerTask, getPartnerTaskByUser } from '../controllers/partnerTaskController.js';


const router = Router();

router.get('/partner/tasks', isAuthenticated, getPartnerTaskByUser);
router.post('/create/partner/task', isAuthenticated, createPartnerTask);
router.post('/create/partner', isAuthenticated, createPartnerController);

export default router;