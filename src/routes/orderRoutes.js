import express from "express";
import { createOrder, getOrders } from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getOrders);
router.post("/", createOrder);

export default router;
