import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unautherized" });
    }

    const token = header.split(" ")[1];

try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
} catch (err) {
    return res.status(401).json({
        message: "Invalid or expired token",
    });
}
}



