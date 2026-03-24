import express from "express";
import cors from "cors";
import { connectDB, disconnectDB } from "./config/db.js";

// import routes
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";

const app = express();

const defaultAllowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
];

const configuredOrigins = (process.env.CLIENT_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...configuredOrigins])];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow server-to-server tools and the local frontends we know about.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Origin not allowed by CORS"));
        },
        credentials: true,
    }),
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/products", productRoutes);
app.use("/auth", authRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/admin/products", adminProductRoutes);

const PORT = 5001;

await connectDB();

const server = app.listen(PORT, () => {
    console.log(`server running on PORT:${PORT}...`);
});

// Handle unhandle promise rejection (eg., database connection errors)

process.on("unhandledRejection", (err) => {
    console.error("Unhandle Rejection", err);

    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
    console.log("Uncaught Exception:", err);
    await disconnectDB();
    process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("SIGTERN received, shutting down gracefully");
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
});
