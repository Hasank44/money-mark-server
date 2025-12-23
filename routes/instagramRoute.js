import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { userInstagramSell } from "../controllers/instagramController.js";

const router = Router();

router.post('/sell/instagram', isAuthenticated, userInstagramSell);

export default router;