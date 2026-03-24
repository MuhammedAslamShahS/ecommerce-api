import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
});

const userId = "856423bf-be66-45d1-98cb-dad39e070aae";

const products = [
    {
        title: "The Matrix",
        overview: "A computer hacker learns about the true nature of reality.",
        launchDate: 1999,
        brandDetails: ["Action", "Sci-Fi"],
        runtime: 136,
        seller: "Warner Bros",
        createdBy: userId,
    },
];

const main = async () => {
    console.log("seeding products...");

    // Existing products delete cheyyunnu
    // Seed rerun cheyyumbo duplicate data varathirikkan
    await prisma.product.deleteMany();

    // Array-il ulla products one by one insert cheyyunnu
    for (const product of products) {
        await prisma.product.create({
            data: product,
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
