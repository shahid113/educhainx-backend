import mongoose from "mongoose";

const NonceSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  nonce: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // expires in 5 minutes
});

export const Nonce = mongoose.model("Nonce", NonceSchema);
