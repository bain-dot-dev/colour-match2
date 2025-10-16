"use client";
import { Button, LiveFeedback } from "@worldcoin/mini-apps-ui-kit-react";
import {
  IDKitWidget,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/idkit";
import { MiniKit } from "@worldcoin/minikit-js";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

/**
 * Authentication component supporting both World ID Kit and Wallet Authentication
 * - World ID Kit for browser users (QR code verification)
 * - Wallet Authentication for World App users
 * Based on the working authentication guide
 */
export const AuthButton = () => {
  const [isPending, setIsPending] = useState(false);
  const [authStatus, setAuthStatus] = useState<
    "idle" | "authenticating" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const { isInstalled } = useMiniKit();
  const router = useRouter();

  console.log(
    "AuthButton rendered - isInstalled:",
    isInstalled,
    "isPending:",
    isPending,
    "authStatus:",
    authStatus
  );

  // Get environment variables
  const appId = process.env.NEXT_PUBLIC_APP_ID || "";
  const actionId = process.env.NEXT_PUBLIC_ACTION || "";

  const verifyWithServer = useCallback(
    async (payload: ISuccessResult, signal: string) => {
      const response = await fetch("/api/verify-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  // Wallet Authentication for World App users
  const handleWalletAuth = useCallback(async () => {
    if (!isInstalled) {
      setError("MiniKit is not installed. Please install it first.");
      return;
    }

    setIsPending(true);
    setAuthStatus("authenticating");
    setError(null);
    console.log("Starting wallet authentication...");

    try {
      // Get nonce from server
      const nonceResponse = await fetch("/api/nonce");
      const { nonce } = await nonceResponse.json();

      // Request wallet authentication
      const authResult = await MiniKit.requestWalletAuth({
        nonce,
        message: `Sign in to Connect Four\n\nNonce: ${nonce}`,
      });

      if (authResult.success) {
        // Verify SIWE message
        const verifyResponse = await fetch("/api/complete-siwe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload: authResult.payload,
            nonce,
          }),
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.isValid) {
          // Get user info from MiniKit
          const userInfo = await MiniKit.getUserByAddress(
            authResult.payload.address
          );

          // Sign in with NextAuth
          const result = await signIn("credentials", {
            walletAddress: authResult.payload.address,
            username: userInfo?.username || "Anonymous",
            profilePictureUrl: userInfo?.profilePictureUrl,
            permissions: JSON.stringify(userInfo?.permissions || {}),
            optedIntoOptionalAnalytics:
              userInfo?.optedIntoOptionalAnalytics?.toString() || "false",
            worldAppVersion: userInfo?.worldAppVersion?.toString(),
            deviceOS: userInfo?.deviceOS,
            redirect: false,
          });

          if (result?.ok) {
            setAuthStatus("success");
            router.push("/home");
          } else {
            setError("Authentication failed. Please try again.");
            setAuthStatus("error");
          }
        } else {
          setError("Invalid signature. Please try again.");
          setAuthStatus("error");
        }
      } else {
        setError("Wallet authentication failed. Please try again.");
        setAuthStatus("error");
      }
    } catch (err) {
      console.error("Wallet auth error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
      setAuthStatus("error");
    } finally {
      setIsPending(false);
    }
  }, [isInstalled, router]);

  // World ID verification handler for browser users
  const handleWorldIDVerify = useCallback(
    async (proof: ISuccessResult) => {
      console.log("World ID proof received:", proof);
      setIsPending(true);
      setAuthStatus("authenticating");
      setError(null);

      try {
        // Verify with server
        await verifyWithServer(proof, "");

        // Create a basic user session for World ID verification
        const result = await signIn("credentials", {
          walletAddress: proof.nullifier_hash || proof.merkle_root || "unknown",
          username: `User_${(
            proof.nullifier_hash ||
            proof.merkle_root ||
            "unknown"
          ).slice(0, 8)}`,
          profilePictureUrl:
            "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
          permissions: JSON.stringify({}),
          optedIntoOptionalAnalytics: "false",
          worldAppVersion: "",
          deviceOS: "browser",
          redirect: false,
        });

        if (result?.ok) {
          setAuthStatus("success");
          router.push("/home");
        } else {
          setError("Authentication failed. Please try again.");
          setAuthStatus("error");
        }
      } catch (error) {
        console.error("World ID verification error:", error);
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
    console.log("World ID success, redirecting...");
    setIsPending(false);
    setAuthStatus("success");
    // NextAuth will handle the redirect automatically
  }, []);

  useEffect(() => {
    console.log("AuthButton useEffect - isInstalled:", isInstalled);
    // Auto-authentication disabled to allow manual login testing
    // Re-enable this if you want auto-login on component mount
  }, [isInstalled]);

  // If outside World App, show World ID Kit QR code authentication
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
                ? "Verification Failed"
                : "Verify with World ID"}
            </Button>
          )}
        </IDKitWidget>

        <p className="text-xs text-gray-500 text-center">
          Scan the QR code with World App to continue
        </p>

        {error && <LiveFeedback variant="error">{error}</LiveFeedback>}

        {authStatus === "success" && (
          <LiveFeedback variant="success">
            Authentication successful! Redirecting...
          </LiveFeedback>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 text-center">
            <strong>Alternative:</strong> Open this app in World App for wallet
            authentication
          </p>
        </div>
      </div>
    );
  }

  // If inside World App, show wallet authentication
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-sm text-gray-600">
          Authenticate using your World App wallet to get started
        </p>
      </div>

      <Button
        onClick={handleWalletAuth}
        disabled={isPending}
        size="lg"
        variant="primary"
      >
        {authStatus === "authenticating"
          ? "Connecting Wallet..."
          : authStatus === "success"
          ? "Wallet Connected"
          : authStatus === "error"
          ? "Connection Failed"
          : "Connect Wallet"}
      </Button>

      {error && <LiveFeedback variant="error">{error}</LiveFeedback>}

      {authStatus === "success" && (
        <LiveFeedback variant="success">
          Authentication successful! Redirecting...
        </LiveFeedback>
      )}

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          <strong>Note:</strong> This app uses Wallet Authentication for secure,
          passwordless login. No World ID verification required for
          authentication.
        </p>
      </div>
    </div>
  );
};
