import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { me, signup, login, refreshToken } from "./auth.controller.js";
import { validate, signupSchema, loginSchema } from "./auth.validation.js";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refreshToken); // no auth middleware; uses cookie/body
router.get("/me", requireAuth, me);

export default router;
