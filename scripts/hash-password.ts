import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";

async function main() {
  let password = process.argv[2];
  if (!password) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    password = await rl.question("Choose your app password: ");
    rl.close();
  }
  if (!password || password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);
  const encoded = Buffer.from(hash, "utf8").toString("base64");

  console.log("\nAdd these to .env.local (and to Vercel > Project > Settings > Environment Variables):\n");
  console.log(`APP_PASSWORD_HASH=${encoded}`);
  console.log(`AUTH_SECRET=${randomBytes(32).toString("hex")}`);
  console.log(`CRON_SECRET=${randomBytes(24).toString("hex")}`);
}

main();
