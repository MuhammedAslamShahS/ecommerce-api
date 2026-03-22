// Temporary in-memory products so frontend can load while real DB endpoints are built
const sampleProducts = [
    {
        id: "p1",
        title: "Sample T-Shirt",
        description: "Soft cotton tee",
        price: 19.99,
        category: "clothing",
        image: "https://via.placeholder.com/300x300.png?text=Sample+Tee",
    },
    {
        id: "p2",
        title: "Sample Sneakers",
        description: "Lightweight everyday shoes",
        price: 59.99,
        category: "shoes",
        image: "https://via.placeholder.com/300x300.png?text=Sample+Sneakers",
    },
];

export const getProducts = (_req, res) => {
    res.json(sampleProducts);
};

export const getProductById = (req, res) => {
    const product = sampleProducts.find((p) => String(p.id) === String(req.params.id));
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
};
