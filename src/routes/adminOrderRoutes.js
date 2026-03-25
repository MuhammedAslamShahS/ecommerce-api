import express from "express";
import { getAdminOrders, updateOrderStatus } from "../controllers/orderController.js";
import { adminMiddleware, authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/", getAdminOrders);
router.patch("/:id/status", updateOrderStatus);

export default router;
