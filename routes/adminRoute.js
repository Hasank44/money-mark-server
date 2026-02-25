import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import { getAllPrices, priceUpdateByAdmin, setPriceByAdmin } from "../controllers/priceController.js";
import { contactUpdateByAdmin, getAllContacts, setContactByAdmin } from "../controllers/contactController.js";
import { createSlider, deleteSlider, getSlider, updateSlider } from "../controllers/sliderController.js";
import { singleFileUpload } from "../middlewares/uploadCloudinary.js";
import { adminLogin, adminLogout, getMeByAdmin, userGetAllByAdmin, userGetOneByAdmin, userPasswordChangeByAdmin, userUpdateByAdmin } from "../controllers/adminController.js";
import { approveGmailByAdmin, getAllGmailSellsByAdmin } from "../controllers/gmailController.js";
import { approveFacebookByAdmin, getALLFacebookSellHistory } from "../controllers/facebookController.js";
import { approveInstagramByAdmin, getAllInstagramSellHistory } from "../controllers/instagramController.js";
import { createCodeByAdmin, getAllHistoryByAmin } from "../controllers/giftCodeController.js";
import { approveAccountActiveByAdmin, getAllActiveByAdmin } from "../controllers/ActiveController.js";
import { approveTaskByAdmin, deleteTaskByAdmin, getAllTaskHistoryByAdmin, setNewTaskByAdmin, taskUpdateByAdmin, userTaskHistoryByAdmin } from "../controllers/taskAdminController.js";
import { approveWithdrawByAdmin, getAllWithdrawByAdmin } from "../controllers/withdrawController.js";
import { userWalletUpdateByAdmin } from "../controllers/userController.js";
import { approveRechargeByAdmin, getMobileRechargeByAdmin } from "../controllers/mobileRechargeController.js";
import { approvePartnerTaskByAdmin, getPartnerTasksByAdmin } from "../controllers/partnerTaskController.js";

const router = Router();
// users
router.get('/all/users', isAuthenticated, roleMiddleware('admin'), userGetAllByAdmin);
router.get('/user/:id', isAuthenticated, roleMiddleware('admin'), userGetOneByAdmin);
router.post('/user/update/:id', isAuthenticated, roleMiddleware('admin'), userUpdateByAdmin);
router.post('/change/password/:id', isAuthenticated, roleMiddleware('admin'), userPasswordChangeByAdmin);
router.post('/user/account/active/:id', isAuthenticated, roleMiddleware('admin'), approveAccountActiveByAdmin);
router.post('/user/wallet/update/:id', isAuthenticated, roleMiddleware('admin'), userWalletUpdateByAdmin);

// admins
router.post('/login', adminLogin);
router.post('/logout', isAuthenticated, roleMiddleware('admin'), adminLogout);
router.get('/me', isAuthenticated, roleMiddleware('admin'), getMeByAdmin);

// price
router.get('/prices', isAuthenticated, roleMiddleware('admin'), getAllPrices);
router.post('/set/price', isAuthenticated, roleMiddleware('admin'), setPriceByAdmin);
router.put('/update/price/:id', isAuthenticated, roleMiddleware('admin'), priceUpdateByAdmin);

// contacts
router.get('/contacts', isAuthenticated, roleMiddleware('admin'), getAllContacts);
router.post('/set/contact', isAuthenticated, roleMiddleware('admin'), setContactByAdmin);
router.put('/update/contact/:id', isAuthenticated, roleMiddleware('admin'), contactUpdateByAdmin);

// sliders
router.get('/sliders', isAuthenticated, roleMiddleware('admin'), getSlider);
router.post('/set/slider', isAuthenticated, roleMiddleware('admin'), singleFileUpload('image','money-mark'), createSlider);
router.post('/update/slider/:id', isAuthenticated, roleMiddleware('admin'), singleFileUpload('image', 'money-mark'), updateSlider);
router.delete('/delete/slider/:id', isAuthenticated, roleMiddleware('admin'), deleteSlider);

// sells
router.get('/all/gmail/history', isAuthenticated, roleMiddleware('admin'), getAllGmailSellsByAdmin);
router.post('/gmail/success/:id', isAuthenticated, roleMiddleware('admin'), approveGmailByAdmin);
router.get('/all/facebook/history', isAuthenticated, roleMiddleware('admin'), getALLFacebookSellHistory);
router.post('/facebook/success/:id', isAuthenticated, roleMiddleware('admin'), approveFacebookByAdmin);
router.get('/all/instagram/history', isAuthenticated, roleMiddleware('admin'), getAllInstagramSellHistory);
router.post('/instagram/success/:id', isAuthenticated, roleMiddleware('admin'), approveInstagramByAdmin);

// giftCodes
router.get('/all/giftCode/history', isAuthenticated, roleMiddleware('admin'), getAllHistoryByAmin);
router.post('/add/giftCode', isAuthenticated, roleMiddleware('admin'), createCodeByAdmin);

// active
router.get('/active/requests', isAuthenticated, roleMiddleware('admin'), getAllActiveByAdmin);
router.post('/active/success/:id', isAuthenticated, roleMiddleware('admin'), approveAccountActiveByAdmin);

// task-job
router.get('/task-jobs', isAuthenticated, roleMiddleware('admin'), getAllTaskHistoryByAdmin);
router.post('/add/task', isAuthenticated, roleMiddleware('admin'), setNewTaskByAdmin);
router.post('/update/task/:id', isAuthenticated, roleMiddleware('admin'), taskUpdateByAdmin);
router.delete('/delete/task/:id', isAuthenticated, roleMiddleware('admin'), deleteTaskByAdmin);
router.get('/all/tasks/history', isAuthenticated, roleMiddleware('admin'), userTaskHistoryByAdmin);
router.post('/task/request/success/:id', isAuthenticated, roleMiddleware('admin'), approveTaskByAdmin);

// payments
router.get('/withdraw/requests', isAuthenticated, roleMiddleware('admin'), getAllWithdrawByAdmin);
router.post('/withdraw/success/:id', isAuthenticated, roleMiddleware('admin'), approveWithdrawByAdmin);

// mobile recharge
router.get('/mobile-recharge/history', isAuthenticated, roleMiddleware('admin'), getMobileRechargeByAdmin);
router.post('/mobile-recharge/success/:id', isAuthenticated, roleMiddleware('admin'), approveRechargeByAdmin);

// partnerTasks
router.get('/partner/tasks', isAuthenticated, roleMiddleware('admin'), getPartnerTasksByAdmin);
router.post('/approve/partner/task/:taskId', isAuthenticated, roleMiddleware('admin'), approvePartnerTaskByAdmin);
export default router;