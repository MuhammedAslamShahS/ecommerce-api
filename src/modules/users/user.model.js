import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, trim: true, required: true },

        email: { type: String, trim: true, lowercase: true, unique: true, required: true },

        passwordHash: { type: String, required: true },

        role: { type: String, enum: ["user", "admin"], default: "user" },

        isEmailVerified: {type: Boolean, default: false}
    },
    { timestamps: true },
);

export default mongoose.model("User", userSchema);
