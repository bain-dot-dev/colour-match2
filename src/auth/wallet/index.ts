import { MiniKit } from "@worldcoin/minikit-js";
import { signIn } from "next-auth/react";
import { getNewNonces } from "./server-helpers";

/**
 * Authenticates a user via their wallet using a nonce-based challenge-response mechanism.
 *
 * This function:
 * 1. Generates a unique nonce and signed nonce
 * 2. Requests the user to sign the nonce with their wallet via MiniKit
 * 3. Passes the result to NextAuth for verification and session creation
 *
 * The verification happens in the NextAuth authorize callback, which:
 * - Verifies the signed nonce matches
 * - Verifies the SIWE message signature
 * - Fetches user info from MiniKit
 * - Creates a session with the user data
 *
 * @returns {Promise<void>} Redirects to /home on success
 * @throws {Error} If wallet authentication fails at any step
 */
export const walletAuth = async () => {
  console.log("🔐 Starting wallet authentication...");

  // 1. Generate nonces (regular nonce and signed nonce for verification)
  const { nonce, signedNonce } = await getNewNonces();
  console.log("✅ Nonces generated");

  // 2. Request wallet authentication from user
  const result = await MiniKit.commandsAsync.walletAuth({
    nonce,
    expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
    statement: `Authenticate (${crypto.randomUUID().replace(/-/g, "")}).`,
  });

  console.log("📦 Wallet auth response:", result);

  if (!result) {
    throw new Error("No response from wallet auth");
  }

  if (result.finalPayload.status !== "success") {
    console.error(
      "❌ Wallet authentication failed:",
      result.finalPayload.error_code
    );
    throw new Error(result.finalPayload.error_code || "Wallet auth failed");
  }

  console.log("✅ Wallet signature received, signing in...");

  // 3. Sign in using next-auth (verification happens in authorize callback)
  await signIn("credentials", {
    redirectTo: "/home",
    nonce,
    signedNonce,
    finalPayloadJson: JSON.stringify(result.finalPayload),
  });
};
