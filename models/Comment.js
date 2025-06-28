import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  comicSlug: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Comment", commentSchema);