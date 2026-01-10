import express from "express";
import {
  paymentCreate,
  paymentWebhook,
  paymentSuccess,
} from "../controllers/paymentController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/create", isAuthenticated, paymentCreate);
router.post("/verify", paymentSuccess);
router.post('/webhook', paymentWebhook);

export default router;