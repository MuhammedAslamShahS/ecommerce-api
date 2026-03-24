import { prisma } from "../config/db.js";

const addToWishlist = async (req, res) => {
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

    const existingInWishlist = await prisma.wishlistItem.findUnique({
        where: {
            userId_productId: {
                userId: userId,
                productId: productId,
            },
        },
    });

    if (existingInWishlist) {
        return res.status(409).json({ error: "Product alredy in the wishlist" });
    }

    const wishlistItem = await prisma.wishlistItem.create({
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
            wishlistItem,
        },
    });
};

export { addToWishlist };
