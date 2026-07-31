import crypto from "crypto";

function getSecretKey(): string {
  return process.env.API_SECRET_KEY || "fallback_mem_exe_secret_key_84589aff";
}

/**
 * Generates a deterministic, HMAC-signed API key for a given userId.
 * Key format: mem_live_<userId>_<signature>
 */
export function generateUserApiKey(userId: string): string {
  const hmac = crypto.createHmac("sha256", getSecretKey());
  hmac.update(userId);
  const signature = hmac.digest("hex").slice(0, 24);
  return `mem_live_${userId}_${signature}`;
}

/**
 * Cryptographically verifies an API Key and extracts the userId if authentic.
 * Returns the userId if valid, or null if invalid/tampered.
 */
export function verifyAndExtractUserIdFromApiKey(apiKey: string): string | null {
  if (!apiKey || typeof apiKey !== "string" || !apiKey.startsWith("mem_live_")) {
    return null;
  }

  // Token structure: mem_live_<userId>_<signature>
  const body = apiKey.replace("mem_live_", "");
  const lastUnderscoreIndex = body.lastIndexOf("_");

  if (lastUnderscoreIndex === -1) {
    return null;
  }

  const userId = body.slice(0, lastUnderscoreIndex);
  const providedSignature = body.slice(lastUnderscoreIndex + 1);

  if (!userId || !providedSignature) {
    return null;
  }

  // Re-calculate expected signature using HMAC-SHA256
  const hmac = crypto.createHmac("sha256", getSecretKey());

  hmac.update(userId);
  const expectedSignature = hmac.digest("hex").slice(0, 24);

  // Timing-safe comparison to prevent timing attacks
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  const isValid = crypto.timingSafeEqual(providedBuffer, expectedBuffer);
  return isValid ? userId : null;
}
