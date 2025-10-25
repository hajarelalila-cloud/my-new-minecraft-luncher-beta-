import crypto from "crypto"

/**
 * Normalize email address per UID2 specification
 * https://unifiedid.com/docs/getting-started/gs-normalization-encoding#email-address-normalization
 *
 * Steps:
 * 1. Trim leading/trailing whitespace
 * 2. Convert to lowercase
 * 3. Apply Gmail-specific rules:
 *    - Remove periods (.) from local part
 *    - Remove + and everything after it before @gmail.com
 *
 * @param email - Raw email address
 * @returns Normalized email address
 */
export function normalizeEmail(email: string): string {
  // 1. Trim whitespace
  let normalized = email.trim()

  // 2. Lowercase
  normalized = normalized.toLowerCase()

  // 3. Gmail-specific rules
  if (normalized.endsWith("@gmail.com")) {
    const [localPart, domain] = normalized.split("@")

    // Remove periods from local part
    let gmailLocal = localPart.replace(/\./g, "")

    // Remove + and everything after it
    const plusIndex = gmailLocal.indexOf("+")
    if (plusIndex !== -1) {
      gmailLocal = gmailLocal.substring(0, plusIndex)
    }

    normalized = `${gmailLocal}@${domain}`
  }

  return normalized
}

/**
 * Generate SHA-256 hash of normalized email, encoded as Base64
 *
 * Per UID2 specification:
 * - Normalize email first
 * - Apply SHA-256 to get bytes
 * - Base64 encode the bytes (NOT hex)
 *
 * Verify hashes at: https://unifiedid.com/examples/hashing-tool/
 *
 * @param email - Raw email address
 * @returns Base64-encoded SHA-256 hash
 */
export function hashEmail(email: string): string {
  const normalized = normalizeEmail(email)

  // SHA-256 produces a buffer of bytes
  const hashBytes = crypto.createHash("sha256").update(normalized).digest() // Returns Buffer (bytes)

  // Base64 encode the bytes
  return hashBytes.toString("base64")
}
