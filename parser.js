import vision from "@google-cloud/vision";
import { extractAspectsFromText } from "./aspects.js";

function normalizeOcrText(t) {
  return (t || "")
    .replace(/\r/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/[‐-–—]/g, "-")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function runOcr(imageBuffer) {
  const client = new vision.ImageAnnotatorClient();

  const [result] = await client.textDetection({
    image: { content: imageBuffer.toString("base64") }
  });

  const rawText = result?.fullTextAnnotation?.text || "";
  const text = normalizeOcrText(rawText);

  const aspects = extractAspectsFromText(text);

  return { text, aspects };
}
