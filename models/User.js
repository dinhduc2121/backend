import mongoose from "mongoose";

const readingHistorySchema = new mongoose.Schema({
  slug: { type: String, required: true },
  chapter: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  followedComics: [{ type: String }],
  readingHistory: [readingHistorySchema],
  linhThach: { type: Number, default: 0 },
  tuVi: { type: String, default: "Phàm Nhân" },
  role: { type: String, enum: ["admin", "member"], default: "member" }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
