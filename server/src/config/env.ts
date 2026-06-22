import path from "node:path";
import dotenv from "dotenv";

const candidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "server/.env"),
  path.resolve(__dirname, "../../.env"),
];

for (const candidate of candidates) {
  dotenv.config({ path: candidate });
}
