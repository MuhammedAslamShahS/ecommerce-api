import { prisma } from "../src/config/db.js";

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
        title: "Inception",
        overview: "A thief who steals corporate secrets through dream-sharing technology.",
        launchDate: 2010,
        brandDetails: ["Action", "Sci-Fi", "Thriller"],
        runtime: 148,
        seller: "Warner Bros",
    },
    {
        title: "The Dark Knight",
        overview: "Batman faces the Joker in a battle for Gotham's soul.",
        launchDate: 2008,
        brandDetails: ["Action", "Crime", "Drama"],
        runtime: 152,
        seller: "Warner Bros",
    },
    {
        title: "Pulp Fiction",
        overview: "The lives of two mob hitmen, a boxer, and others intertwine.",
        launchDate: 1994,
        brandDetails: ["Crime", "Drama"],
        runtime: 154,
        seller: "Miramax",
    },
    {
        title: "Interstellar",
        overview: "A team of explorers travel through a wormhole in space.",
        launchDate: 2014,
        brandDetails: ["Adventure", "Drama", "Sci-Fi"],
        runtime: 169,
        seller: "Paramount Pictures",
    },
    {
        title: "The Shawshank Redemption",
        overview: "Two imprisoned men bond over a number of years.",
        launchDate: 1994,
        brandDetails: ["Drama"],
        runtime: 142,
        seller: "Columbia Pictures",
    },
    {
        title: "Fight Club",
        overview: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club.",
        launchDate: 1999,
        brandDetails: ["Drama"],
        runtime: 139,
        seller: "20th Century Fox",
    },
    {
        title: "Forrest Gump",
        overview: "The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man.",
        launchDate: 1994,
        brandDetails: ["Drama", "Romance"],
        runtime: 142,
        seller: "Paramount Pictures",
    },
    {
        title: "The Godfather",
        overview: "The aging patriarch of an organized crime dynasty transfers control to his son.",
        launchDate: 1972,
        brandDetails: ["Crime", "Drama"],
        runtime: 175,
        seller: "Paramount Pictures",
    },
    {
        title: "Goodfellas",
        overview: "The story of Henry Hill and his life in the mob.",
        launchDate: 1990,
        brandDetails: ["Biography", "Crime", "Drama"],
        runtime: 146,
        seller: "Warner Bros",
    },
];

const main = async () => {
    console.log("seeding products...");

    const user = await prisma.user.findFirst();

    if (!user) {
        throw new Error("No user found. Register one user first, then run the seed.");
    }

    for (const product of products) {
        await prisma.product.create({
            data: {
                ...product,
                createdBy: user.id,
            },
        });
        console.log(`Create product ${product.title}`);
    }

    console.log("seeding completed!...");
};

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
