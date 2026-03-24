import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("DB Connected via Prisma");
    } catch (error) {
        console.log(`Database connection error : ${error.message}`);
        process.exit(1);
    }
};
const disconnectDB = async () => {
    await prisma.$disconnect();
    console.log("DB disconnected");
};

export { prisma, connectDB, disconnectDB };
