/**
 * Client-side image prep: downscales + re-encodes the uploaded photo before
 * it ever hits the network. This keeps request payloads small (faster
 * upload on mobile, lower AI provider cost per section 29) and normalizes
 * output to a mime type every provider accepts.
 */

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

export interface PreparedImage {
  base64: string;
  mimeType: string;
  dataUrl: string;
  width: number;
  height: number;
}

export async function prepareImageForUpload(file: File): Promise<PreparedImage> {
  const originalDataUrl = await readFileAsDataURL(file);
  const img = await loadImage(originalDataUrl);

  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas wordt niet ondersteund in deze browser.");
  }
  ctx.drawImage(img, 0, 0, width, height);

  const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const dataUrl = canvas.toDataURL(mimeType, mimeType === "image/jpeg" ? JPEG_QUALITY : undefined);
  const base64 = dataUrl.split(",")[1] ?? "";

  return { base64, mimeType, dataUrl, width, height };
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Kon het bestand niet lezen."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Kon de afbeelding niet laden."));
    img.src = src;
  });
}
