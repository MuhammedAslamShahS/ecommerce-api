import argon2 from "argon2";
import jwt from "jsonwebtoken";
import User from "../users/user.model.js";

const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";

export async function signup({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already registered");
  const passwordHash = await argon2.hash(password);
  const user = await User.create({ name, email, passwordHash });
  const tokens = createTokens(user);
  return { user: publicUser(user), ...tokens };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");
  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) throw new Error("Invalid credentials");
  const tokens = createTokens(user);
  return { user: publicUser(user), ...tokens };
}

function createTokens(user) {
  const payload = { sub: user.id, role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TTL });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL });
  return { accessToken, refreshToken };
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
