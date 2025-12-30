import { Router } from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { multiFilesUpload, taskScreenshotUpload } from '../middlewares/uploadCloudinary.js';
import { getAvailableTasksForUser, getUserTaskHistory, userStartTask } from '../controllers/taskAdminController.js';

const router = Router();

router.get('/tasks', isAuthenticated, getAvailableTasksForUser);
router.get('/task/history', isAuthenticated, getUserTaskHistory);
router.post('/task/submit/:id', isAuthenticated, multiFilesUpload('files', 2, 'money-mark'), userStartTask);

export default router;