import { prisma } from "../config/db.js";
import { formatProduct, productSelect } from "../utils/productFormatter.js";

const parseQuantity = (quantity) => {
    const parsedQuantity = Number(quantity ?? 1);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
        return null;
    }

    return parsedQuantity;
};

const getCart = async (req, res) => {
    const userId = req.user.id;

    const cartItems = await prisma.cartItem.findMany({
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
        results: cartItems.length,
        data: {
            cartItems: cartItems.map((cartItem) => ({
                ...cartItem,
                product: formatProduct(cartItem.product),
            })),
        },
    });
};

const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
    const parsedQuantity = parseQuantity(quantity);

    if (!productId) {
        return res.status(400).json({ error: "Product id is required" });
    }

    if (!parsedQuantity) {
        return res.status(400).json({ error: "Quantity must be a positive integer" });
    }

    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    const existingCartItem = await prisma.cartItem.findUnique({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
    });

    if (existingCartItem) {
        const cartItem = await prisma.cartItem.update({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
            data: {
                quantity: {
                    increment: parsedQuantity,
                },
            },
            include: {
                product: {
                    select: productSelect,
                },
            },
        });

        return res.status(200).json({
            status: "Success",
            message: "Cart quantity updated",
            data: {
                cartItem: {
                    ...cartItem,
                    product: formatProduct(cartItem.product),
                },
            },
        });
    }

    const cartItem = await prisma.cartItem.create({
        data: {
            userId,
            productId,
            quantity: parsedQuantity,
        },
        include: {
            product: {
                select: productSelect,
            },
        },
    });

    res.status(201).json({
        status: "Success",
        message: "Product added to cart",
        data: {
            cartItem: {
                ...cartItem,
                product: formatProduct(cartItem.product),
            },
        },
    });
};

const updateCartItem = async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;
    const parsedQuantity = parseQuantity(quantity);

    if (!parsedQuantity) {
        return res.status(400).json({ error: "Quantity must be a positive integer" });
    }

    const existingCartItem = await prisma.cartItem.findUnique({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
    });

    if (!existingCartItem) {
        return res.status(404).json({ error: "Product not found in cart" });
    }

    const cartItem = await prisma.cartItem.update({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
        data: {
            quantity: parsedQuantity,
        },
        include: {
            product: {
                select: productSelect,
            },
        },
    });

    res.status(200).json({
        status: "Success",
        message: "Cart item updated",
        data: {
            cartItem: {
                ...cartItem,
                product: formatProduct(cartItem.product),
            },
        },
    });
};

const removeFromCart = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.id;

    const cartItem = await prisma.cartItem.findUnique({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
    });

    if (!cartItem) {
        return res.status(404).json({ error: "Product not found in cart" });
    }

    await prisma.cartItem.delete({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
    });

    res.status(200).json({
        status: "Success",
        message: "Product removed from cart",
    });
};

export { addToCart, getCart, removeFromCart, updateCartItem };
