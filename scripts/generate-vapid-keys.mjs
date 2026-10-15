import crypto from "crypto";
import fs from "fs";
import path from "path";

// Generate standard ECDSA P-256 (prime256v1) key pair according to RFC 8292 (W3C Web Push)
const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
  namedCurve: "prime256v1",
  publicKeyEncoding: { type: "spki", format: "der" },
  privateKeyEncoding: { type: "pkcs8", format: "der" }
});

// Extract raw uncompressed 65-byte public key (starts with 0x04)
const rawPublic = publicKey.subarray(-65);
// Extract raw 32-byte private key scalar
const rawPrivate = privateKey.subarray(-32);

const vapidPublicKey = rawPublic.toString("base64url");
const vapidPrivateKey = rawPrivate.toString("base64url");

console.log("==================================================================");
console.log(" 100% FREE SOVEREIGN VAPID KEY GENERATOR (W3C Web Push standard)");
console.log("==================================================================");
console.log("\nCopy and paste these into your .env.local file:\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidPublicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${vapidPrivateKey}"`);
console.log(`VAPID_SUBJECT="mailto:support@learnnaija.ng"\n`);
console.log("==================================================================");

// Also append to .env.local if not already present
const envPath = path.resolve(process.cwd(), ".env.local");
let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";

if (!envContent.includes("NEXT_PUBLIC_VAPID_PUBLIC_KEY")) {
  envContent += `\n# Web Push VAPID Keys (100% Free Sovereign Push)\nNEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidPublicKey}"\nVAPID_PRIVATE_KEY="${vapidPrivateKey}"\nVAPID_SUBJECT="mailto:support@learnnaija.ng"\n`;
  fs.writeFileSync(envPath, envContent, "utf-8");
  console.log("-> Automatically appended to .env.local successfully!");
} else {
  console.log("-> Note: NEXT_PUBLIC_VAPID_PUBLIC_KEY already exists in .env.local.");
}
