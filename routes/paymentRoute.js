import express from "express";
import {
  createPayment,
  paymentSuccess,
  paymentCancel,
} from "../controllers/paymentController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/create", isAuthenticated, createPayment);
router.post("/success/:transaction_id", paymentSuccess);
router.get("/cancel", paymentCancel);
export default router;