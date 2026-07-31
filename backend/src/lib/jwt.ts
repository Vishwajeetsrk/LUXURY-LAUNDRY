import crypto from "crypto";

let _secret: string | undefined;

export function getJwtSecret(): string {
  if (!_secret) {
    _secret = process.env.JWT_SECRET;
    if (!_secret) {
      _secret = crypto.randomBytes(32).toString("hex");
      console.warn("⚠️  JWT_SECRET not set. Using random fallback (tokens will not survive restarts). Set JWT_SECRET in your environment for production use.");
    }
  }
  return _secret;
}
