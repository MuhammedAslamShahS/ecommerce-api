import { Router } from "express";
import { signup, login } from "./auth.controller.js";
import { validate, signupSchema, loginSchema } from "./auth.validation.js";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);

export default router;
