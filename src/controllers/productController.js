import { prisma } from "../config/db.js";
import { formatProduct, formatProducts, productSelect } from "../utils/productFormatter.js";

const PRODUCT_SECTIONS = ["NEW IN", "SALES", "COLLECTIONS", "WEDDING", "DEALS"];

const parsePrice = (price) => {
    if (price === undefined) {
        return undefined;
    }

    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return null;
    }

    return parsedPrice;
};

const parseStock = (stock) => {
    if (stock === undefined) {
        return undefined;
    }

    const parsedStock = Number(stock);

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
        return null;
    }

    return parsedStock;
};

const parseIsActive = (isActive) => {
    if (isActive === undefined) {
        return undefined;
    }

    if (typeof isActive !== "boolean") {
        return null;
    }

    return isActive;
};

const parseSection = (section) => {
    if (section === undefined) {
        return undefined;
    }

    if (section === null || section === "") {
        return "";
    }

    if (typeof section !== "string") {
        return null;
    }

    const normalizedSection = section.trim().toUpperCase();

    if (!PRODUCT_SECTIONS.includes(normalizedSection)) {
        return null;
    }

    return normalizedSection;
};

const buildProductData = ({ title, description, brand, category, section, price, stock, imageUrl, isActive }) => {
    const parsedPrice = parsePrice(price);
    const parsedStock = parseStock(stock);
    const parsedIsActive = parseIsActive(isActive);
    const parsedSection = parseSection(section);

    if (price !== undefined && parsedPrice === null) {
        return { error: "Price must be a valid positive number" };
    }

    if (stock !== undefined && parsedStock === null) {
        return { error: "Stock must be a non-negative integer" };
    }

    if (isActive !== undefined && parsedIsActive === null) {
        return { error: "isActive must be true or false" };
    }

    if (section !== undefined && parsedSection === null) {
        return { error: `Section must be one of: ${PRODUCT_SECTIONS.join(", ")}` };
    }

    const data = {};

    if (title !== undefined) {
        data.title = title;
    }

    if (description !== undefined) {
        data.description = description;
        data.overview = description;
    }

    if (brand !== undefined) {
        data.brand = brand;
        data.seller = brand;
    }

    if (category !== undefined) {
        data.category = category;
        data.brandDetails = category ? [category] : [];
    }

    if (parsedSection !== undefined) {
        data.section = parsedSection || null;
    }

    if (parsedPrice !== undefined) {
        data.price = parsedPrice;
    }

    if (parsedStock !== undefined) {
        data.stock = parsedStock;
    }

    if (imageUrl !== undefined) {
        data.imageUrl = imageUrl;
    }

    if (parsedIsActive !== undefined) {
        data.isActive = parsedIsActive;
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
            products: formatProducts(products),
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
            product: formatProduct(product),
        },
    });
};

const createProduct = async (req, res) => {
    const { title, description, price, stock, brand, category, section, imageUrl, isActive } = req.body;

    if (!title || price === undefined) {
        return res.status(400).json({ error: "Title and price are required" });
    }

    const { data, error } = buildProductData({
        title,
        description,
        price,
        stock,
        brand,
        category,
        section,
        imageUrl,
        isActive: isActive ?? true,
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
            product: formatProduct(product),
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
            product: formatProduct(product),
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
