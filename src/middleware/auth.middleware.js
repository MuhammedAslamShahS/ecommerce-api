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


export async function refreshToken(req, res) {
  try {
    // prefer cookie named refreshToken; fallback to body.refreshToken
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const result = await service.refresh(token);
    // set new refresh token cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ user: result.user, accessToken: result.accessToken });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
}

