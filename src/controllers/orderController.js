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
        shippingAddress: {
            fullName: order.shippingFullName,
            phone: order.shippingPhone,
            line1: order.shippingLine1,
            line2: order.shippingLine2,
            city: order.shippingCity,
            state: order.shippingState,
            postalCode: order.shippingPostalCode,
            country: order.shippingCountry,
        },
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

const cancelOrder = async (req, res) => {
    const userId = req.user.id;
    const orderId = req.params.id;

    const existingOrder = await prisma.order.findFirst({
        where: {
            id: orderId,
            userId,
        },
        include: {
            orderItems: true,
        },
    });

    if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
    }

    if (existingOrder.status === "CANCELLED") {
        return res.status(400).json({ error: "This order is already cancelled" });
    }

    if (!["PLACED", "PROCESSING"].includes(existingOrder.status)) {
        return res.status(400).json({
            error: "Only placed or processing orders can be cancelled",
        });
    }

    const cancelledOrder = await prisma.$transaction(async (transaction) => {
        for (const item of existingOrder.orderItems) {
            await transaction.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        increment: item.quantity,
                    },
                },
            });
        }

        return transaction.order.update({
            where: { id: orderId },
            data: {
                status: "CANCELLED",
            },
            include: {
                orderItems: true,
            },
        });
    });

    res.status(200).json({
        status: "Success",
        message: "Order cancelled successfully",
        data: {
            order: formatOrder(cancelledOrder),
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
    const addressId = String(req.body.addressId || "").trim();
    const normalizedItems = normalizeOrderItems(req.body.items);

    if (!validPaymentMethods.has(paymentMethod)) {
        return res.status(400).json({ error: "Valid payment method is required" });
    }

    if (!addressId) {
        return res.status(400).json({ error: "Delivery address is required" });
    }

    if (!normalizedItems) {
        return res.status(400).json({ error: "At least one valid order item is required" });
    }

    const selectedAddress = await prisma.address.findFirst({
        where: {
            id: addressId,
            userId,
        },
    });

    if (!selectedAddress) {
        return res.status(404).json({ error: "Selected address was not found" });
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
                shippingFullName: selectedAddress.fullName,
                shippingPhone: selectedAddress.phone,
                shippingLine1: selectedAddress.line1,
                shippingLine2: selectedAddress.line2,
                shippingCity: selectedAddress.city,
                shippingState: selectedAddress.state,
                shippingPostalCode: selectedAddress.postalCode,
                shippingCountry: selectedAddress.country,
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

export { cancelOrder, createOrder, getAdminOrders, getOrders, updateOrderStatus };
