const productSelect = {
    id: true,
    title: true,
    description: true,
    overview: true,
    price: true,
    stock: true,
    brand: true,
    category: true,
    section: true,
    imageUrl: true,
    isActive: true,
    createdBy: true,
    createdA: true,
    brandDetails: true,
    seller: true,
};

const formatProduct = (product) => {
    if (!product) {
        return product;
    }

    return {
        id: product.id,
        title: product.title,
        description: product.description ?? product.overview ?? null,
        price: product.price,
        stock: product.stock,
        brand: product.brand ?? product.seller ?? null,
        category: product.category ?? product.brandDetails?.[1] ?? product.brandDetails?.[0] ?? null,
        section: product.section ?? null,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
        createdBy: product.createdBy,
        createdAt: product.createdA,
    };
};

const formatProducts = (products) => products.map(formatProduct);

export { formatProduct, formatProducts, productSelect };
