import { Router } from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { getAllManage, manageUpdateByAdmin, setManageByAdmin } from '../controllers/manageController.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/manages', isAuthenticated, getAllManage);
router.post('/set/new/manage', isAuthenticated, roleMiddleware('admin'), setManageByAdmin);
router.put('/update/manage/:id', isAuthenticated, roleMiddleware('admin'), manageUpdateByAdmin);

export default router;