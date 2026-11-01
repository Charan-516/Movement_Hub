import { randomBytes } from "crypto";

/** 12 URL-safe characters, about 72 bits of randomness: not guessable. */
export function generateInviteCode() {
  return randomBytes(9).toString("base64url");
}
