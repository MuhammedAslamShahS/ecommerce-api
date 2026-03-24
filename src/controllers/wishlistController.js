import { prisma } from "../config/db.js";
import { formatProduct, productSelect } from "../utils/productFormatter.js";

const getWishlist = async (req, res) => {
    const userId = req.user.id;

    const wishlistItems = await prisma.wishlistItem.findMany({
        where: { userId },
        include: {
            product: {
                select: productSelect,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    res.status(200).json({
        status: "Success",
        results: wishlistItems.length,
        data: {
            wishlistItems: wishlistItems.map((wishlistItem) => ({
                ...wishlistItem,
                product: formatProduct(wishlistItem.product),
            })),
        },
    });
};

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

const removeFromWishlist = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    const wishlistItem = await prisma.wishlistItem.findUnique({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
    });

    if (!wishlistItem) {
        return res.status(404).json({ error: "Product not found in wishlist" });
    }

    await prisma.wishlistItem.delete({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
    });

    res.status(200).json({
        status: "Success",
        message: "Product removed from wishlist",
    });
};

export { addToWishlist, getWishlist, removeFromWishlist };
