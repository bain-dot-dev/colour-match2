"use client";
import { walletAuth } from "@/auth/wallet";
import { Button, LiveFeedback } from "@worldcoin/mini-apps-ui-kit-react";
import {
  IDKitWidget,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/idkit";
import {
  MiniKit,
  VerifyCommandInput,
  VerificationLevel as MiniKitVerificationLevel,
  ResponseEvent,
} from "@worldcoin/minikit-js";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { useCallback, useEffect, useState } from "react";

/**
 * This component is an example of how to authenticate a user
 * We will use Next Auth for this example, but you can use any auth provider
 * Read More: https://docs.world.org/mini-apps/commands/wallet-auth
 */
export const AuthButton = () => {
  const [isPending, setIsPending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "success" | "error"
  >("idle");
  const { isInstalled } = useMiniKit();

  console.log(
    "AuthButton rendered - isInstalled:",
    isInstalled,
    "isPending:",
    isPending,
    "verificationStatus:",
    verificationStatus
  );

  // MiniKit verification for World App users
  const handleMiniKitVerification = useCallback(async () => {
    if (!isInstalled || isPending) {
      console.warn(
        "MiniKit verification blocked - MiniKit not installed or pending"
      );
      return;
    }

    setIsPending(true);
    setVerificationStatus("verifying");
    console.log("Starting MiniKit World ID verification...");

    try {
      // Set up verification command payload
      const verifyPayload: VerifyCommandInput = {
        action: process.env.NEXT_PUBLIC_ACTION || "login",
        signal: undefined, // Optional additional data
        verification_level: MiniKitVerificationLevel.Orb, // Use Orb verification for higher security
      };

      // Send verification command
      const payload = MiniKit.commands.verify(verifyPayload);
      console.log("MiniKit verify command sent:", payload);

      // Set up response listener
      MiniKit.subscribe(ResponseEvent.MiniAppVerifyAction, async (response) => {
        console.log("MiniKit verification response:", response);

        if (response.status === "success") {
          setVerificationStatus("success");
          console.log("MiniKit verification successful:", response);

          // Proceed with wallet authentication after successful verification
          try {
            await walletAuth();
            console.log(
              "Wallet authentication completed successfully after verification"
            );
          } catch (error) {
            console.error(
              "Wallet authentication error after verification:",
              error
            );
            setVerificationStatus("error");
          }
        } else {
          console.error("MiniKit verification failed:", response.error_code);
          setVerificationStatus("error");
        }

        setIsPending(false);
      });
    } catch (error) {
      console.error("MiniKit verification error:", error);
      setVerificationStatus("error");
      setIsPending(false);
    }
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
    setVerificationStatus("verifying");

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
      setVerificationStatus("success");

      // Redirect to home after successful verification
      setTimeout(() => {
        window.location.href = "/home";
      }, 1000);
    } catch (error) {
      console.error("World ID verification error:", error);
      setVerificationStatus("error");
      setIsPending(false);
      throw error;
    }
  }, []);

  const onWorldIDSuccess = useCallback(() => {
    console.log("World ID success, redirecting...");
    setIsPending(false);
    setVerificationStatus("success");
    // Small delay to show success state before redirect
    setTimeout(() => {
      window.location.href = "/home";
    }, 1000);
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
              {verificationStatus === "verifying"
                ? "Verifying..."
                : verificationStatus === "success"
                ? "Verified!"
                : verificationStatus === "error"
                ? "Verification Failed"
                : "Verify with World ID"}
            </Button>
          )}
        </IDKitWidget>
        <p className="text-xs text-gray-500 text-center">
          Scan the QR code with World App to continue
        </p>
        {verificationStatus === "success" && (
          <p className="text-xs text-green-600 text-center">
            ✅ Verification successful! Redirecting...
          </p>
        )}
        {verificationStatus === "error" && (
          <p className="text-xs text-red-600 text-center">
            ❌ Verification failed. Please try again.
          </p>
        )}
      </div>
    );
  }

  // If inside World App, show World ID verification + wallet authentication
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-sm text-gray-600">
        Verify your identity and connect your wallet
      </p>

      <LiveFeedback
        label={{
          failed: "Verification failed",
          pending:
            verificationStatus === "verifying"
              ? "Verifying identity..."
              : "Processing...",
          success: "Verified & Connected",
        }}
        state={
          verificationStatus === "error"
            ? "failed"
            : isPending
            ? "pending"
            : verificationStatus === "success"
            ? "success"
            : undefined
        }
      >
        <Button
          onClick={handleMiniKitVerification}
          disabled={isPending}
          size="lg"
          variant="primary"
        >
          {verificationStatus === "verifying"
            ? "Verifying Identity..."
            : verificationStatus === "success"
            ? "Verified & Connected"
            : verificationStatus === "error"
            ? "Verification Failed"
            : "Verify Identity & Connect Wallet"}
        </Button>
      </LiveFeedback>

      {verificationStatus === "success" && (
        <p className="text-xs text-green-600 text-center">
          ✅ Identity verified! Wallet connected successfully.
        </p>
      )}
      {verificationStatus === "error" && (
        <p className="text-xs text-red-600 text-center">
          ❌ Verification failed. Please try again.
        </p>
      )}
    </div>
  );
};
