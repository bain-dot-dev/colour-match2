"use client";
import { walletAuth } from "@/auth/wallet";
import { Button, LiveFeedback } from "@worldcoin/mini-apps-ui-kit-react";
import {
  IDKitWidget,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/idkit";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { useCallback, useEffect, useState } from "react";

/**
 * This component is an example of how to authenticate a user
 * We will use Next Auth for this example, but you can use any auth provider
 * Read More: https://docs.world.org/mini-apps/commands/wallet-auth
 */
export const AuthButton = () => {
  const [isPending, setIsPending] = useState(false);
  const { isInstalled } = useMiniKit();

  console.log(
    "AuthButton rendered - isInstalled:",
    isInstalled,
    "isPending:",
    isPending
  );

  const onClick = useCallback(async () => {
    console.log(
      "Login button clicked - isInstalled:",
      isInstalled,
      "isPending:",
      isPending
    );
    if (!isInstalled || isPending) {
      console.warn("Login blocked - MiniKit not installed or pending");
      return;
    }
    setIsPending(true);
    console.log("Starting wallet authentication...");
    try {
      await walletAuth();
      console.log("Wallet authentication completed successfully");
    } catch (error) {
      console.error("Wallet authentication button error", error);
      setIsPending(false);
      return;
    }

    setIsPending(false);
  }, [isInstalled, isPending]);

  useEffect(() => {
    console.log("AuthButton useEffect - isInstalled:", isInstalled);
    // Auto-authentication disabled to allow manual login testing
    // Re-enable this if you want auto-login on component mount
  }, [isInstalled]);

  // Handle World ID verification (for external browsers)
  const handleWorldIDVerify = useCallback(async (proof: ISuccessResult) => {
    console.log("World ID proof received:", proof);
    setIsPending(true);
    try {
      // Send the proof to your backend for verification
      const response = await fetch("/api/verify-proof", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: proof,
          action: process.env.NEXT_PUBLIC_ACTION || "login",
          signal: undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Verification failed");
      }

      const data = await response.json();
      console.log("World ID verification successful:", data);
    } catch (error) {
      console.error("World ID verification error:", error);
      setIsPending(false);
      throw error;
    }
  }, []);

  const onWorldIDSuccess = useCallback(() => {
    console.log("World ID success, redirecting...");
    setIsPending(false);
    window.location.href = "/home";
  }, []);

  // If outside World App, show World ID QR code authentication
  if (isInstalled === false) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-sm text-gray-600">
          Open this app in World App or verify with World ID
        </p>
        <IDKitWidget
          app_id={process.env.NEXT_PUBLIC_APP_ID as `app_${string}`}
          action={process.env.NEXT_PUBLIC_ACTION || "login"}
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
              {isPending ? "Verifying..." : "Verify with World ID"}
            </Button>
          )}
        </IDKitWidget>
        <p className="text-xs text-gray-500 text-center">
          Scan the QR code with World App to continue
        </p>
      </div>
    );
  }

  // If inside World App, show wallet authentication
  return (
    <LiveFeedback
      label={{
        failed: "Failed to login",
        pending: "Logging in",
        success: "Logged in",
      }}
      state={isPending ? "pending" : undefined}
    >
      <Button
        onClick={onClick}
        disabled={isPending}
        size="lg"
        variant="primary"
      >
        Login with Wallet
      </Button>
    </LiveFeedback>
  );
};
