import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());
app.use(express.json());

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);

app.get("/api/v1/health", (_req, res) => {
    res.json({ ok: true, message: "API is running..." });
});

app.use(errorHandler);

export default app;
