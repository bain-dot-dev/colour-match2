"use client";
import { Button, LiveFeedback } from "@worldcoin/mini-apps-ui-kit-react";
import {
  IDKitWidget,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/idkit";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import type { AuthStatus } from "@/types/verification";
import { walletAuth } from "@/auth/wallet";

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
   * Uses the walletAuth helper which handles verification in NextAuth
   */
  const handleWalletAuth = useCallback(async () => {
    if (!isInstalled) {
      setError("Please open this app in World App");
      return;
    }

    setIsPending(true);
    setAuthStatus("authenticating");
    setError(null);

    try {
      // walletAuth handles:
      // 1. Nonce generation
      // 2. MiniKit wallet signature request
      // 3. NextAuth sign in with verification
      // 4. Redirect to /home
      await walletAuth();

      setAuthStatus("success");
      console.log("✅ Authentication successful!");
      // Note: walletAuth redirects to /home automatically
    } catch (err) {
      console.error("❌ Wallet auth error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
      setAuthStatus("error");
    } finally {
      setIsPending(false);
    }
  }, [isInstalled]);

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
