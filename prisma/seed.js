import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
});

const userId = "856423bf-be66-45d1-98cb-dad39e070aae";
const seedUserEmail = "seed.user@example.com";
const adminUserId = "96c0e9db-d178-4d46-8833-d745d8c39b34";
const adminUserEmail = "admin@example.com";

const products = [
    {
        title: "The Matrix",
        description: "A bold product entry seeded for ecommerce testing.",
        price: 999,
        stock: 12,
        brand: "Warner Bros",
        category: "Electronics",
        imageUrl: "https://example.com/the-matrix.jpg",
    },
    {
        title: "The 2nd One",
        description: "Second seeded product for admin and customer testing.",
        price: 799,
        stock: 8,
        brand: "Hello",
        category: "Accessories",
        imageUrl: "https://example.com/the-2nd-one.jpg",
    },
    {
        title: "3",
        description: "Third seeded product.",
        price: 499,
        stock: 20,
        brand: "Brand 3",
        category: "Fashion",
        imageUrl: "https://example.com/product-3.jpg",
    },
    {
        title: "4",
        description: "Fourth seeded product.",
        price: 1299,
        stock: 5,
        brand: "Brand 4",
        category: "Home",
        imageUrl: "https://example.com/product-4.jpg",
    },
];

const main = async () => {
    console.log("seeding products...");

    const hashedPassword = await bcrypt.hash("seed123456", 10);
    const hashedAdminPassword = await bcrypt.hash("admin123456", 10);

    const seedUser = await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
            id: userId,
            name: "Seed User",
            email: seedUserEmail,
            password: hashedPassword,
        },
    });

    const adminUser = await prisma.user.upsert({
        where: { id: adminUserId },
        update: {
            role: "ADMIN",
        },
        create: {
            id: adminUserId,
            name: "Admin User",
            email: adminUserEmail,
            password: hashedAdminPassword,
            role: "ADMIN",
        },
    });

    console.log(`Using seed user ${seedUser.email}`);
    console.log(`Using admin user ${adminUser.email}`);

    // Existing products delete cheyyunnu
    // Seed rerun cheyyumbo duplicate data varathirikkan
    await prisma.product.deleteMany({
        where: { createdBy: seedUser.id },
    });

    // Array-il ulla products one by one insert cheyyunnu
    for (const product of products) {
        await prisma.product.create({
            data: {
                ...product,
                createdBy: seedUser.id,
            },
        });

        console.log(`Create product ${product.title}`);
    }

    console.log("seeding completed!..");
};

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
