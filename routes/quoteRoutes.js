import express from "express";
import { quotesVN } from "../quotes.js";

const router = express.Router();

router.get("/", (req, res) => {
  const randomQuote = quotesVN[Math.floor(Math.random() * quotesVN.length)];
  res.json({ quote: randomQuote });
});

export default router;
