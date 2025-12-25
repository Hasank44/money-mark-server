import { Router } from 'express';
import {
    getUser, userEmailVerify, userForgetPassword, userLogin, userLogout, userOtpVerify, userPasswordChange,
    userProfileUpdate,
    userRegister, userReSendOtp, userSetNewPassword
} from '../controllers/userController.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { getAllReferredUsers } from '../controllers/teamController.js';
import { userAccountActive } from '../controllers/ActiveController.js';

const router = Router();
router.get('/me', isAuthenticated, getUser);
router.get('/my-team/:id', isAuthenticated, getAllReferredUsers);
router.post('/register', userRegister);
router.post('/email/verify/:email', userEmailVerify);
router.post('/otp/resend/:email', userReSendOtp);
router.post('/login', userLogin);
router.post('/logout', isAuthenticated, userLogout);
router.post('/forget/password', userForgetPassword);
router.post('/verify/otp/:email', userOtpVerify);
router.post('/set/new/password/:email', userSetNewPassword);
router.post('/change/password', isAuthenticated, userPasswordChange);
router.put('/update', isAuthenticated, userProfileUpdate);
router.post('/account/active', isAuthenticated, userAccountActive);

export default router;