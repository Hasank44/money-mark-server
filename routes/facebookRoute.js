import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { userFacebookSell } from "../controllers/facebookController.js";


const router = Router();

router.post('/sell/facebook', isAuthenticated, userFacebookSell);

export default router;