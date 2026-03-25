import { prisma } from "../config/db.js";

const formatAddress = (address) => ({
    id: address.id,
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
});

const normalizeAddressPayload = (payload) => {
    return {
        fullName: String(payload.fullName || "").trim(),
        phone: String(payload.phone || "").trim(),
        line1: String(payload.line1 || "").trim(),
        line2: String(payload.line2 || "").trim(),
        city: String(payload.city || "").trim(),
        state: String(payload.state || "").trim(),
        postalCode: String(payload.postalCode || "").trim(),
        country: String(payload.country || "").trim(),
        isDefault: Boolean(payload.isDefault),
    };
};

const hasRequiredAddressFields = (addressData) => {
    return Boolean(
        addressData.fullName &&
        addressData.phone &&
        addressData.line1 &&
        addressData.city &&
        addressData.state &&
        addressData.postalCode &&
        addressData.country,
    );
};

const getAddresses = async (req, res) => {
    const addresses = await prisma.address.findMany({
        where: { userId: req.user.id },
        orderBy: [
            { isDefault: "desc" },
            { createdAt: "desc" },
        ],
    });

    res.status(200).json({
        status: "Success",
        results: addresses.length,
        data: {
            addresses: addresses.map(formatAddress),
        },
    });
};

const createAddress = async (req, res) => {
    const userId = req.user.id;
    const addressData = normalizeAddressPayload(req.body);

    if (!hasRequiredAddressFields(addressData)) {
        return res.status(400).json({ error: "All required address fields must be provided" });
    }

    const existingAddressCount = await prisma.address.count({
        where: { userId },
    });

    const shouldMakeDefault = addressData.isDefault || existingAddressCount === 0;

    const createdAddress = await prisma.$transaction(async (transaction) => {
        if (shouldMakeDefault) {
            await transaction.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }

        return transaction.address.create({
            data: {
                userId,
                ...addressData,
                isDefault: shouldMakeDefault,
            },
        });
    });

    res.status(201).json({
        status: "Success",
        message: "Address created successfully",
        data: {
            address: formatAddress(createdAddress),
        },
    });
};

const updateAddress = async (req, res) => {
    const userId = req.user.id;
    const addressId = req.params.id;
    const addressData = normalizeAddressPayload(req.body);

    if (!hasRequiredAddressFields(addressData)) {
        return res.status(400).json({ error: "All required address fields must be provided" });
    }

    const existingAddress = await prisma.address.findFirst({
        where: {
            id: addressId,
            userId,
        },
    });

    if (!existingAddress) {
        return res.status(404).json({ error: "Address not found" });
    }

    const updatedAddress = await prisma.$transaction(async (transaction) => {
        if (addressData.isDefault) {
            await transaction.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }

        return transaction.address.update({
            where: { id: addressId },
            data: {
                ...addressData,
                isDefault: addressData.isDefault || existingAddress.isDefault,
            },
        });
    });

    res.status(200).json({
        status: "Success",
        message: "Address updated successfully",
        data: {
            address: formatAddress(updatedAddress),
        },
    });
};

const deleteAddress = async (req, res) => {
    const userId = req.user.id;
    const addressId = req.params.id;

    const existingAddress = await prisma.address.findFirst({
        where: {
            id: addressId,
            userId,
        },
    });

    if (!existingAddress) {
        return res.status(404).json({ error: "Address not found" });
    }

    await prisma.$transaction(async (transaction) => {
        await transaction.address.delete({
            where: { id: addressId },
        });

        if (existingAddress.isDefault) {
            const nextAddress = await transaction.address.findFirst({
                where: { userId },
                orderBy: { createdAt: "desc" },
            });

            if (nextAddress) {
                await transaction.address.update({
                    where: { id: nextAddress.id },
                    data: { isDefault: true },
                });
            }
        }
    });

    res.status(200).json({
        status: "Success",
        message: "Address deleted successfully",
    });
};

export { createAddress, deleteAddress, getAddresses, updateAddress };
