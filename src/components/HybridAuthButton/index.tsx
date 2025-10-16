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
import { walletAuth } from "@/auth/wallet";

/**
 * Hybrid Authentication Button
 *
 * Automatically detects environment and provides the appropriate auth method:
 * - World App (Mini App): Wallet Authentication via MiniKit
 * - Browser: World ID verification via QR code
 *
 * @example
 * ```tsx
 * import { HybridAuthButton } from '@/components/HybridAuthButton';
 *
 * export default function LoginPage() {
 *   return <HybridAuthButton />;
 * }
 * ```
 */
export const HybridAuthButton = () => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { isInstalled } = useMiniKit();
  const router = useRouter();

  // Get environment variables
  const appId = process.env.NEXT_PUBLIC_APP_ID || "";
  const actionId = process.env.NEXT_PUBLIC_ACTION || "";

  /**
   * Wallet Authentication (World App users only)
   * Handles the complete wallet auth flow via the helper function
   */
  const handleWalletAuth = useCallback(async () => {
    if (!isInstalled) {
      setError("Please open this app in World App");
      return;
    }

    setIsPending(true);
    setError(null);
    setSuccess(false);

    try {
      // walletAuth() handles everything:
      // - Nonce generation
      // - MiniKit wallet signature request
      // - SIWE verification in NextAuth
      // - Session creation
      // - Redirect to /home
      await walletAuth();
      setSuccess(true);
    } catch (err) {
      console.error("❌ Wallet auth error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsPending(false);
    }
  }, [isInstalled]);

  /**
   * World ID verification (Browser users only)
   * Verifies proof and creates session
   */
  const handleWorldIDVerify = useCallback(
    async (proof: ISuccessResult) => {
      console.log("🌍 World ID proof received:", proof);
      setIsPending(true);
      setError(null);
      setSuccess(false);

      try {
        // Verify proof with backend
        const response = await fetch("/api/verify-proof", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload: proof,
            action: actionId,
            signal: "",
          }),
        });

        const data = await response.json();
        if (!data?.verifyRes?.success) {
          throw new Error("Unable to validate proof. Please try again.");
        }

        // Create session with World ID credentials
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
          setSuccess(true);
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
      } finally {
        setIsPending(false);
      }
    },
    [actionId, router]
  );

  const onWorldIDSuccess = useCallback(() => {
    console.log("✅ World ID verification successful");
    setSuccess(true);
  }, []);

  // ============================================
  // WORLD APP MODE - Wallet Authentication
  // ============================================
  if (isInstalled === true) {
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <div className="text-center">
          <div className="mb-2 px-3 py-1 bg-green-100 border border-green-300 rounded-full inline-block">
            <span className="text-xs font-semibold text-green-800">
              🌍 World App Detected
            </span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
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
          className="w-full"
        >
          {isPending
            ? "Connecting..."
            : success
            ? "✓ Connected!"
            : "Connect Wallet"}
        </Button>

        {error && <LiveFeedback state="failed">{error}</LiveFeedback>}
        {success && (
          <LiveFeedback state="success">
            Authenticated! Redirecting...
          </LiveFeedback>
        )}

        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg w-full">
          <p className="text-xs text-green-700 text-center">
            <strong>🔐 Wallet Authentication:</strong> Secure, passwordless
            login using SIWE
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // BROWSER MODE - World ID Verification
  // ============================================
  if (isInstalled === false) {
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <div className="text-center">
          <div className="mb-2 px-3 py-1 bg-blue-100 border border-blue-300 rounded-full inline-block">
            <span className="text-xs font-semibold text-blue-800">
              🌐 Browser Mode
            </span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
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
              className="w-full"
            >
              {isPending
                ? "Verifying..."
                : success
                ? "✓ Verified!"
                : "Verify with World ID"}
            </Button>
          )}
        </IDKitWidget>

        {error && <LiveFeedback state="failed">{error}</LiveFeedback>}
        {success && (
          <LiveFeedback state="success">
            Authenticated! Redirecting...
          </LiveFeedback>
        )}

        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg w-full">
          <p className="text-xs text-blue-700 text-center">
            <strong>💡 Tip:</strong> For the best experience, open this app
            directly in World App for wallet authentication
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // LOADING STATE - Environment Detection
  // ============================================
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <div className="text-center">
        <div className="mb-2 px-3 py-1 bg-gray-100 border border-gray-300 rounded-full inline-block">
          <span className="text-xs font-semibold text-gray-600">
            🔄 Detecting Environment...
          </span>
        </div>
        <p className="text-sm text-gray-600">Please wait</p>
      </div>
      <Button disabled size="lg" variant="primary" className="w-full">
        Loading...
      </Button>
    </div>
  );
};
