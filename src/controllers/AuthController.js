import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

// New User Register
const register = async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user alredy exists
    const userExists = await prisma.user.findUnique({
        where: { email: email },
    });

    if (userExists) {
        return res.status(400).json({ error: "User alredy exist with this email" });
    }

    //  Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    // Generate JWT Token
    const token = generateToken(user.id, res);

    res.status(201).json({
        status: "success",
        data: {
            user: {
                id: user.id,
                name: name,
                email: email,
                role: user.role,
            },
            token,
        },
    });
};

// Login User (Existing user)

const login = async (req, res) => {
    const { email, password } = req.body;

    // Check if user email exist in the table
    const user = await prisma.user.findUnique({
        where: { email: email },
    });

    if (!user) {
        return res.status(400).json({ error: "Invalid email or password" });
    }

    // Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = generateToken(user.id, res);

    res.status(201).json({
        status: "success",

        data: {
            user: {
                id: user.id,
                name: user.name,
                email: email,
                role: user.role,
            },
            token,
        },
    });
};

// logout
const logout = async (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({
        status: "success",
        message: "logged out successfully",
    });
};

const getCurrentUser = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAT: true,
            _count: {
                select: {
                    wishlistItems: true,
                    cartItems: true,
                    orders: true,
                },
            },
        },
    });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
};

export { register, login, logout, getCurrentUser };
