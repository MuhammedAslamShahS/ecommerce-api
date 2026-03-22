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

// req.user is set by requireAuth; return only safe user info to avoid circular JSON
export async function me(req, res) {
    res.json({ user: req.user });
}
