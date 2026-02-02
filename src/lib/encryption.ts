import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  // Hash the key to ensure it's exactly 32 bytes
  return crypto.createHash("sha256").update(key).digest();
}

export function encrypt(plaintext: string): { encryptedValue: string; iv: string } {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();
  
  // Combine encrypted data with auth tag
  const combined = encrypted + authTag.toString("hex");
  
  return {
    encryptedValue: combined,
    iv: iv.toString("hex"),
  };
}

export function decrypt(encryptedValue: string, ivHex: string): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, "hex");
  
  // Split encrypted data and auth tag
  const authTag = Buffer.from(
    encryptedValue.slice(-AUTH_TAG_LENGTH * 2),
    "hex"
  );
  const encrypted = encryptedValue.slice(0, -AUTH_TAG_LENGTH * 2);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = `cos_${crypto.randomBytes(32).toString("hex")}`;
  const prefix = key.slice(0, 12);
  const hash = hashApiKey(key);
  
  return { key, prefix, hash };
}
