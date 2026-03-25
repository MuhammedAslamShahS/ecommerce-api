import { prisma } from "../config/db.js";

const validPaymentMethods = new Set(["cod", "upi", "card"]);
const validOrderStatuses = new Set(["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]);

const formatOrderItem = (orderItem) => ({
    id: orderItem.id,
    productId: orderItem.productId,
    title: orderItem.title,
    imageUrl: orderItem.imageUrl,
    price: orderItem.price,
    quantity: orderItem.quantity,
});

const formatOrder = (order) => {
    const formattedOrder = {
        id: order.id,
        userId: order.userId,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.orderItems.map(formatOrderItem),
    };

    if (order.user) {
        formattedOrder.user = order.user;
    }

    return formattedOrder;
};

const normalizeOrderItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        return null;
    }

    const normalizedItems = items.map((item) => ({
        productId: item?.productId,
        quantity: Number(item?.quantity),
    }));

    const hasInvalidItem = normalizedItems.some(
        (item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity < 1,
    );

    if (hasInvalidItem) {
        return null;
    }

    return normalizedItems;
};

const getOrders = async (req, res) => {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
        where: { userId },
        include: {
            orderItems: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    res.status(200).json({
        status: "Success",
        results: orders.length,
        data: {
            orders: orders.map(formatOrder),
        },
    });
};

const getAdminOrders = async (req, res) => {
    const orders = await prisma.order.findMany({
        include: {
            orderItems: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    res.status(200).json({
        status: "Success",
        results: orders.length,
        data: {
            orders: orders.map(formatOrder),
        },
    });
};

const createOrder = async (req, res) => {
    const userId = req.user.id;
    const paymentMethod = String(req.body.paymentMethod || "").trim().toLowerCase();
    const normalizedItems = normalizeOrderItems(req.body.items);

    if (!validPaymentMethods.has(paymentMethod)) {
        return res.status(400).json({ error: "Valid payment method is required" });
    }

    if (!normalizedItems) {
        return res.status(400).json({ error: "At least one valid order item is required" });
    }

    const productIds = [...new Set(normalizedItems.map((item) => item.productId))];

    const products = await prisma.product.findMany({
        where: {
            id: {
                in: productIds,
            },
        },
        select: {
            id: true,
            title: true,
            imageUrl: true,
            price: true,
            stock: true,
            isActive: true,
        },
    });

    if (products.length !== productIds.length) {
        return res.status(404).json({ error: "One or more products were not found" });
    }

    const productMap = new Map(products.map((product) => [product.id, product]));

    for (const item of normalizedItems) {
        const product = productMap.get(item.productId);

        if (!product.isActive) {
            return res.status(400).json({ error: `${product.title} is not available for ordering` });
        }

        if (product.stock < item.quantity) {
            return res.status(400).json({ error: `Not enough stock available for ${product.title}` });
        }
    }

    const totalAmount = normalizedItems.reduce((total, item) => {
        const product = productMap.get(item.productId);
        return total + product.price * item.quantity;
    }, 0);

    const order = await prisma.$transaction(async (transaction) => {
        const createdOrder = await transaction.order.create({
            data: {
                userId,
                paymentMethod,
                totalAmount,
                orderItems: {
                    create: normalizedItems.map((item) => {
                        const product = productMap.get(item.productId);

                        return {
                            productId: product.id,
                            title: product.title,
                            imageUrl: product.imageUrl,
                            price: product.price,
                            quantity: item.quantity,
                        };
                    }),
                },
            },
            include: {
                orderItems: true,
            },
        });

        for (const item of normalizedItems) {
            await transaction.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity,
                    },
                },
            });
        }

        await transaction.cartItem.deleteMany({
            where: {
                userId,
                productId: {
                    in: productIds,
                },
            },
        });

        return createdOrder;
    });

    res.status(201).json({
        status: "Success",
        message: "Order created successfully",
        data: {
            order: formatOrder(order),
        },
    });
};

const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const nextStatus = String(req.body.status || "").trim().toUpperCase();

    if (!validOrderStatuses.has(nextStatus)) {
        return res.status(400).json({ error: "Valid order status is required" });
    }

    const existingOrder = await prisma.order.findUnique({
        where: { id },
        select: { id: true },
    });

    if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
    }

    const order = await prisma.order.update({
        where: { id },
        data: {
            status: nextStatus,
        },
        include: {
            orderItems: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    res.status(200).json({
        status: "Success",
        message: "Order status updated successfully",
        data: {
            order: formatOrder(order),
        },
    });
};

export { createOrder, getAdminOrders, getOrders, updateOrderStatus };
