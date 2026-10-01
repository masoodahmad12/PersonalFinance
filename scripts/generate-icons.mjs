import sharp from "sharp";
import { readFile } from "node:fs/promises";

const svg = await readFile(new URL("./app-icon.svg", import.meta.url));

const outputs = [
  ["app/apple-icon.png", 180],
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
];

for (const [file, size] of outputs) {
  await sharp(svg, { density: 72 * (size / 64) }).resize(size, size).png().toFile(file);
  console.log(`${file} (${size}x${size})`);
}
