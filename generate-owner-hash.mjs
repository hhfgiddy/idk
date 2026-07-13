import { createHash } from "node:crypto";
import { createInterface } from "node:readline/promises";
import {
  stdin as input,
  stdout as output,
} from "node:process";

const terminal = createInterface({
  input,
  output,
});

const rawName = await terminal.question(
  "Your login name: "
);

const rawKey = await terminal.question(
  "Your private key: "
);

terminal.close();

const name = rawName.trim().toLowerCase();
const key = rawKey.trim().toLowerCase();

if (!name || !key) {
  console.log("Name va key bo'sh bo'lishi mumkin emas.");
} else {
  const hash = createHash("sha256")
    .update(`${name}:${key}`)
    .digest("hex");

  console.log("\n.env fayliga quyidagini qo'ying:");
  console.log(`VITE_OWNER_LOGIN_HASH=${hash}`);
}