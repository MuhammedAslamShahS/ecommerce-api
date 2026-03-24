import { prisma } from "../config/db.js";

const addToWatchlist = async (req, res) => {
    const { productId, status, rating, notes } = req.body;
    const userId = req.user.id;

    // Verify product exists
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    // Check if alredy added

    const existingInWatchlist = await prisma.watchlistItem.findUnique({
        where: {
            userId_productId: {
                userId: userId,
                productId: productId,
            },
        },
    });

    if (existingInWatchlist) {
        return res.status(409).json({ error: "Product alredy in the watchlist" });
    }

    const watchlistItem = await prisma.watchlistItem.create({
        data: {
            userId,
            productId,
            status: status || "PLANNED",
            rating,
            notes,
        },
    });

    res.status(201).json({
        status: "Success",
        data: {
            watchlistItem,
        },
    });
};

export { addToWatchlist };
