import jwt from "jsonwebtoken";
import { prisma } from "../config/db.js";

const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.split(" ")[1];
    }

    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
        return null;
    }

    const jwtCookie = cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith("jwt="));

    return jwtCookie ? jwtCookie.split("=")[1] : null;
};

// Read the Token from the request
// Check if token is valid
export const authMiddleware = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);

        if (!token) {
            return res.status(401).json({ error: "Not authorized, token missing" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            return res.status(401).json({ error: "Not authorized, user not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Not authorized, token invalid" });
    }
};

export const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Admin access required" });
    }

    next();
};
