import * as service from "./auth.service.js";


export async function signup(req, res) {
    try {
        const result = await service.signup(req.validated);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export async function login(req, res) {
    try {
        const result = await service.login(req.validated);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export async function refreshToken(req, res) {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        const result = await service.refresh(token);

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

// req.user is set by requireAuth; return only safe user info to avoid circular JSON
export async function me(req, res) {
    res.json({ user: req.user });
}
