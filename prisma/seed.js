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

const products = [
    {
        title: "The Matrix",
        overview: "A computer hacker learns about the true nature of reality.",
        launchDate: 1999,
        brandDetails: ["Action", "Sci-Fi"],
        runtime: 136,
        seller: "Warner Bros",
    },
    {
        title: "The 2nd One",
        overview: "Hello.............!",
        launchDate: 1999,
        brandDetails: ["Hai", "Howdy"],
        runtime: 136,
        seller: "Hello",
    },
    {
        title: "3",
        overview: "3",
        launchDate: 1999,
        brandDetails: ["3", "3"],
        runtime: 136,
        seller: "3",
    },
    {
        title: "4",
        overview: "4",
        launchDate: 1999,
        brandDetails: ["4", "4"],
        runtime: 136,
        seller: "4",
    },
];

const main = async () => {
    console.log("seeding products...");

    const hashedPassword = await bcrypt.hash("seed123456", 10);

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

    console.log(`Using seed user ${seedUser.email}`);

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
