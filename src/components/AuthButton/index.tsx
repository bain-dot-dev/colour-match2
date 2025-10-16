"use client";
import { walletAuth } from "@/auth/wallet";
import { Button, LiveFeedback } from "@worldcoin/mini-apps-ui-kit-react";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { useCallback, useEffect, useState } from "react";

/**
 * Authentication component using Wallet Authentication as the primary auth flow
 * This component handles authentication for both World App users and external browsers
 * Read More: https://docs.world.org/mini-apps/commands/wallet-auth
 */
export const AuthButton = () => {
  const [isPending, setIsPending] = useState(false);
  const [authStatus, setAuthStatus] = useState<
    "idle" | "authenticating" | "success" | "error"
  >("idle");
  const { isInstalled } = useMiniKit();

  console.log(
    "AuthButton rendered - isInstalled:",
    isInstalled,
    "isPending:",
    isPending,
    "authStatus:",
    authStatus
  );

  // Wallet authentication handler for World App users
  const handleWalletAuth = useCallback(async () => {
    if (!isInstalled || isPending) {
      console.warn("Wallet auth blocked - MiniKit not installed or pending");
      return;
    }

    setIsPending(true);
    setAuthStatus("authenticating");
    console.log("Starting wallet authentication...");

    try {
      await walletAuth();
      console.log("Wallet authentication completed successfully");
      setAuthStatus("success");
    } catch (error) {
      console.error("Wallet authentication error:", error);
      setAuthStatus("error");
    } finally {
      setIsPending(false);
    }
  }, [isInstalled, isPending]);

  useEffect(() => {
    console.log("AuthButton useEffect - isInstalled:", isInstalled);
    // Auto-authentication disabled to allow manual login testing
    // Re-enable this if you want auto-login on component mount
  }, [isInstalled]);

  // If outside World App, show message to open in World App
  if (isInstalled === false) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            World App Required
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            This app uses Wallet Authentication and requires World App to
            function.
          </p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            How to get started:
          </h3>
          <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
            <li>Download World App on your mobile device</li>
            <li>Open this app within World App</li>
            <li>Connect your wallet to authenticate</li>
          </ol>
        </div>

        <a
          href="https://worldapp.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Download World App →
        </a>
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

      <LiveFeedback
        label={{
          failed: "Authentication failed",
          pending: "Connecting wallet...",
          success: "Wallet Connected",
        }}
        state={
          authStatus === "error"
            ? "failed"
            : isPending
            ? "pending"
            : authStatus === "success"
            ? "success"
            : undefined
        }
      >
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
      </LiveFeedback>

      {authStatus === "success" && (
        <p className="text-xs text-green-600 text-center">
          ✅ Wallet connected successfully! Redirecting...
        </p>
      )}
      {authStatus === "error" && (
        <p className="text-xs text-red-600 text-center">
          ❌ Connection failed. Please try again.
        </p>
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
