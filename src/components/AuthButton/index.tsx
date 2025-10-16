"use client";
import { Button, LiveFeedback } from "@worldcoin/mini-apps-ui-kit-react";
import {
  IDKitWidget,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/idkit";
import { MiniKit } from "@worldcoin/minikit-js";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import type { AuthStatus } from "@/types/verification";
import { getUserByAddressSafe, formatUserForAuth } from "@/types/minikit";

/**
 * Authentication component supporting both World ID Kit and Wallet Authentication
 * - Wallet Authentication for World App users (PRIMARY METHOD)
 * - World ID Kit for browser users (QR code verification)
 *
 * Per official docs: "Use Wallet Authentication as the primary auth flow"
 * @see https://docs.world.org/mini-apps/commands/wallet-auth
 */
export const AuthButton = () => {
  const [isPending, setIsPending] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const { isInstalled } = useMiniKit();
  const router = useRouter();

  // Get environment variables
  const appId = process.env.NEXT_PUBLIC_APP_ID || "";
  const actionId = process.env.NEXT_PUBLIC_ACTION || "";

  /**
   * Wallet Authentication for World App users
   * This is the PRIMARY authentication method
   */
  const handleWalletAuth = useCallback(async () => {
    if (!isInstalled) {
      setError("Please open this app in World App");
      return;
    }

    setIsPending(true);
    setAuthStatus("authenticating");
    setError(null);

    console.log("🔐 Starting Wallet Authentication...");

    try {
      // Step 1: Get nonce from server
      console.log("📝 Fetching nonce from server...");
      const nonceRes = await fetch("/api/nonce");

      if (!nonceRes.ok) {
        throw new Error("Failed to get nonce from server");
      }

      const { nonce } = await nonceRes.json();
      console.log("✅ Nonce received:", nonce);

      // Step 2: Request wallet authentication from MiniKit
      console.log("🔑 Requesting wallet signature...");
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: "0",
        expirationTime: new Date(
          new Date().getTime() + 7 * 24 * 60 * 60 * 1000
        ),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: "Sign in to this app",
      });

      console.log("📦 Wallet auth response:", finalPayload);

      // Check for errors
      if (finalPayload.status === "error") {
        console.error("❌ Wallet auth failed:", finalPayload);
        throw new Error(
          finalPayload.error_code || "Wallet authentication failed"
        );
      }

      // Step 3: Verify SIWE message on server
      console.log("🔍 Verifying signature with server...");
      const verifyRes = await fetch("/api/complete-siwe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      });

      const verifyData = await verifyRes.json();
      console.log("✅ Server verification result:", verifyData);

      if (!verifyData.isValid) {
        throw new Error(verifyData.message || "Invalid signature");
      }

      // Step 4: Get wallet address
      const walletAddress = finalPayload.address;
      console.log("💼 Wallet address:", walletAddress);

      // Step 5: Get user info from MiniKit (with safe fallback)
      console.log("👤 Fetching user info from MiniKit...");
      const userInfo = await getUserByAddressSafe(walletAddress);
      console.log("✅ User info:", userInfo);

      // Step 6: Create session with NextAuth
      console.log("🎫 Creating session...");
      const authCredentials = formatUserForAuth(userInfo);
      const result = await signIn("credentials", {
        ...authCredentials,
        redirect: false,
      });

      console.log("🎉 Sign in result:", result);

      if (result?.ok) {
        setAuthStatus("success");
        console.log("✅ Authentication successful! Redirecting...");
        router.push("/home");
        router.refresh();
      } else {
        throw new Error(result?.error || "Failed to create session");
      }
    } catch (err) {
      console.error("❌ Wallet auth error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
      setAuthStatus("error");
    } finally {
      setIsPending(false);
    }
  }, [isInstalled, router]);

  /**
   * World ID verification handler for browser users
   * This is the ALTERNATIVE method when not in World App
   */
  const verifyWithServer = useCallback(
    async (payload: ISuccessResult, signal: string) => {
      const response = await fetch("/api/verify-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload,
          action: actionId,
          signal,
        }),
      });
      const data = await response.json();
      if (!data?.verifyRes?.success) {
        throw new Error("Unable to validate proof. Please try again.");
      }
    },
    [actionId]
  );

  const handleWorldIDVerify = useCallback(
    async (proof: ISuccessResult) => {
      console.log("🌍 World ID proof received:", proof);
      setIsPending(true);
      setAuthStatus("authenticating");
      setError(null);

      try {
        // Verify with server
        await verifyWithServer(proof, "");

        // Create a basic user session for World ID verification
        const result = await signIn("credentials", {
          walletAddress: proof.nullifier_hash || proof.merkle_root || "unknown",
          username: `WorldID_${(
            proof.nullifier_hash ||
            proof.merkle_root ||
            "unknown"
          ).slice(0, 8)}`,
          profilePictureUrl:
            "https://api.dicebear.com/7.x/avataaars/svg?seed=worldid",
          permissions: JSON.stringify({}),
          optedIntoOptionalAnalytics: "false",
          worldAppVersion: "",
          deviceOS: "browser",
          redirect: false,
        });

        if (result?.ok) {
          setAuthStatus("success");
          router.push("/home");
          router.refresh();
        } else {
          throw new Error("Authentication failed");
        }
      } catch (error) {
        console.error("❌ World ID verification error:", error);
        setError(
          error instanceof Error ? error.message : "Verification failed"
        );
        setAuthStatus("error");
      } finally {
        setIsPending(false);
      }
    },
    [verifyWithServer, router]
  );

  const onWorldIDSuccess = useCallback(() => {
    console.log("✅ World ID success");
    setAuthStatus("success");
  }, []);

  // BROWSER: Show World ID Kit QR code authentication
  if (isInstalled === false) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Verify with World ID
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Scan the QR code with World App to authenticate
          </p>
        </div>

        <IDKitWidget
          app_id={appId as `app_${string}`}
          action={actionId}
          onSuccess={onWorldIDSuccess}
          handleVerify={handleWorldIDVerify}
          verification_level={VerificationLevel.Device}
        >
          {({ open }) => (
            <Button
              onClick={open}
              disabled={isPending}
              size="lg"
              variant="primary"
            >
              {authStatus === "authenticating"
                ? "Verifying..."
                : authStatus === "success"
                ? "Verified!"
                : authStatus === "error"
                ? "Try Again"
                : "Verify with World ID"}
            </Button>
          )}
        </IDKitWidget>

        {error && <LiveFeedback state="failed">{error}</LiveFeedback>}
        {authStatus === "success" && (
          <LiveFeedback state="success">
            Authenticated! Redirecting...
          </LiveFeedback>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 text-center">
            <strong>Recommended:</strong> Open this app in World App for wallet
            authentication
          </p>
        </div>
      </div>
    );
  }

  // WORLD APP: Show wallet authentication (PRIMARY METHOD)
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-sm text-gray-600">
          Sign in with your World App wallet
        </p>
      </div>

      <Button
        onClick={handleWalletAuth}
        disabled={isPending}
        size="lg"
        variant="primary"
      >
        {authStatus === "authenticating"
          ? "Connecting..."
          : authStatus === "success"
          ? "Connected!"
          : authStatus === "error"
          ? "Try Again"
          : "Connect Wallet"}
      </Button>

      {error && <LiveFeedback state="failed">{error}</LiveFeedback>}
      {authStatus === "success" && (
        <LiveFeedback state="success">
          Authenticated! Redirecting...
        </LiveFeedback>
      )}

      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-xs text-green-700 text-center">
          <strong>🔐 Wallet Authentication:</strong> Secure, passwordless login
          using SIWE
        </p>
      </div>
    </div>
  );
};
