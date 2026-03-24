import { prisma } from "../config/db.js";

const productSelect = {
    id: true,
    title: true,
    overview: true,
    launchDate: true,
    brandDetails: true,
    runtime: true,
    seller: true,
    imageUrl: true,
    createdBy: true,
    createdA: true,
};

const parseLaunchDate = (launchDate) => {
    if (launchDate === undefined) {
        return undefined;
    }

    const parsedLaunchDate = Number(launchDate);

    if (!Number.isInteger(parsedLaunchDate)) {
        return null;
    }

    return parsedLaunchDate;
};

const parseRuntime = (runtime) => {
    if (runtime === undefined || runtime === null || runtime === "") {
        return undefined;
    }

    const parsedRuntime = Number(runtime);

    if (!Number.isInteger(parsedRuntime) || parsedRuntime < 1) {
        return null;
    }

    return parsedRuntime;
};

const parseBrandDetails = (brandDetails) => {
    if (brandDetails === undefined) {
        return undefined;
    }

    if (!Array.isArray(brandDetails)) {
        return null;
    }

    return brandDetails;
};

const buildProductData = ({ title, overview, launchDate, brandDetails, runtime, seller, imageUrl }) => {
    const parsedLaunchDate = parseLaunchDate(launchDate);
    const parsedRuntime = parseRuntime(runtime);
    const parsedBrandDetails = parseBrandDetails(brandDetails);

    if (launchDate !== undefined && parsedLaunchDate === null) {
        return { error: "Launch date must be an integer" };
    }

    if (runtime !== undefined && parsedRuntime === null) {
        return { error: "Runtime must be a positive integer" };
    }

    if (brandDetails !== undefined && parsedBrandDetails === null) {
        return { error: "Brand details must be an array" };
    }

    const data = {};

    if (title !== undefined) {
        data.title = title;
    }

    if (overview !== undefined) {
        data.overview = overview;
    }

    if (parsedLaunchDate !== undefined) {
        data.launchDate = parsedLaunchDate;
    }

    if (parsedBrandDetails !== undefined) {
        data.brandDetails = parsedBrandDetails;
    }

    if (parsedRuntime !== undefined) {
        data.runtime = parsedRuntime;
    }

    if (seller !== undefined) {
        data.seller = seller;
    }

    if (imageUrl !== undefined) {
        data.imageUrl = imageUrl;
    }

    return { data };
};

const getProducts = async (req, res) => {
    const products = await prisma.product.findMany({
        select: productSelect,
        orderBy: {
            createdA: "desc",
        },
    });

    res.status(200).json({
        status: "Success",
        results: products.length,
        data: {
            products,
        },
    });
};

const getProductById = async (req, res) => {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
        where: { id },
        select: productSelect,
    });

    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({
        status: "Success",
        data: {
            product,
        },
    });
};

const createProduct = async (req, res) => {
    const { title, overview, launchDate, brandDetails, runtime, seller, imageUrl } = req.body;

    if (!title || launchDate === undefined) {
        return res.status(400).json({ error: "Title and launch date are required" });
    }

    const { data, error } = buildProductData({
        title,
        overview,
        launchDate,
        brandDetails: brandDetails ?? [],
        runtime,
        seller,
        imageUrl,
    });

    if (error) {
        return res.status(400).json({ error });
    }

    const product = await prisma.product.create({
        data: {
            ...data,
            createdBy: req.user.id,
        },
        select: productSelect,
    });

    res.status(201).json({
        status: "Success",
        message: "Product created successfully",
        data: {
            product,
        },
    });
};

const updateProduct = async (req, res) => {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
        where: { id },
        select: { id: true },
    });

    if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
    }

    const { data, error } = buildProductData(req.body);

    if (error) {
        return res.status(400).json({ error });
    }

    if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: "No product fields provided for update" });
    }

    const product = await prisma.product.update({
        where: { id },
        data,
        select: productSelect,
    });

    res.status(200).json({
        status: "Success",
        message: "Product updated successfully",
        data: {
            product,
        },
    });
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
        where: { id },
        select: { id: true },
    });

    if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
    }

    await prisma.product.delete({
        where: { id },
    });

    res.status(200).json({
        status: "Success",
        message: "Product deleted successfully",
    });
};

export { createProduct, deleteProduct, getProductById, getProducts, updateProduct };
