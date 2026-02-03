import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";

import { runOcr } from "./parser.js";

function setupGoogleCredsFromEnv() {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) return null;

  const tmpPath = path.join(os.tmpdir(), "gcp.json");
  fs.writeFileSync(tmpPath, raw, { encoding: "utf8" });
  process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
  return tmpPath;
}

setupGoogleCredsFromEnv();

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const upload = multer({ storage: multer.memoryStorage() });

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/ocr", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Missing file. Use multipart/form-data with field name 'image'." });
    }

    const { text, aspects } = await runOcr(req.file.buffer);

    res.json({
      text,
      aspects
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "OCR failed",
      details: err?.message || String(err)
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
