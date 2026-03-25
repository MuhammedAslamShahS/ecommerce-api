import express from "express";
import {
  cancelOrder,
  createOrder,
  getOrders,
} from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getOrders);
router.post("/", createOrder);
router.patch("/:id/cancel", cancelOrder);

export default router;
