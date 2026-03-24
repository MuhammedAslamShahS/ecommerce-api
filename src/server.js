import express from "express";
import { connectDB, disconnectDB } from "./config/db.js";

// import routes
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

const app = express();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/products", productRoutes);
app.use("/auth", authRoutes);
app.use("/wishlist", wishlistRoutes);

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
