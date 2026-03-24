import express from "express";
import { addToWishlist } from "../controllers/wishlistController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", addToWishlist);

// router.post("/login", login);
// router.post("/logout", logout);

export default router;
