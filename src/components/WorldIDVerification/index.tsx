"use client";
import { Button, LiveFeedback } from "@worldcoin/mini-apps-ui-kit-react";
import {
  MiniKit,
  VerifyCommandInput,
  VerificationLevel as MiniKitVerificationLevel,
  ResponseEvent,
} from "@worldcoin/minikit-js";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { useCallback, useState } from "react";
import type {
  VerificationSuccessResponse,
  VerificationErrorResponse,
  WorldIDVerificationProps,
  VerificationStatus,
} from "@/types/verification";

/**
 * Component for World ID verification for specific actions (not for login)
 * This should only be used for actions that require proof of humanity
 * Read More: https://docs.world.org/mini-apps/commands/verify
 */
export const WorldIDVerification = ({
  action,
  signal,
  onSuccess,
  onError,
  buttonText = "Verify World ID",
  disabled = false,
}: WorldIDVerificationProps) => {
  const [isPending, setIsPending] = useState(false);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("idle");
  const { isInstalled } = useMiniKit();

  const handleVerification = useCallback(async () => {
    if (!isInstalled || isPending || disabled) {
      console.warn(
        "World ID verification blocked - MiniKit not installed, pending, or disabled"
      );
      return;
    }

    setIsPending(true);
    setVerificationStatus("verifying");
    console.log("Starting World ID verification for action:", action);

    try {
      // Set up verification command payload
      const verifyPayload: VerifyCommandInput = {
        action,
        signal,
        verification_level: MiniKitVerificationLevel.Orb, // Use Orb verification for higher security
      };

      // Send verification command
      const payload = MiniKit.commands.verify(verifyPayload);
      console.log("MiniKit verify command sent:", payload);

      // Set up response listener
      MiniKit.subscribe(
        ResponseEvent.MiniAppVerifyAction,
        async (response: VerificationErrorResponse) => {
          console.log("MiniKit verification response:", response);

          if (response.status === "success") {
            setVerificationStatus("success");
            console.log("MiniKit verification successful:", response);

            // Send verification to backend
            try {
              const verifyResponse = await fetch("/api/verify-proof", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  payload: response,
                  action,
                  signal,
                }),
              });

              if (!verifyResponse.ok) {
                throw new Error("Verification failed");
              }

              const data: VerificationSuccessResponse =
                await verifyResponse.json();
              console.log("Backend verification successful:", data);

              // Call success callback
              onSuccess?.(data);
            } catch (error) {
              console.error("Backend verification error:", error);
              setVerificationStatus("error");
              onError?.(
                error instanceof Error ? error : new Error(String(error))
              );
            }
          } else {
            console.error("MiniKit verification failed:", response.error_code);
            setVerificationStatus("error");
            onError?.(response);
          }

          setIsPending(false);
        }
      );
    } catch (error) {
      console.error("World ID verification error:", error);
      setVerificationStatus("error");
      onError?.(error instanceof Error ? error : new Error(String(error)));
      setIsPending(false);
    }
  }, [isInstalled, isPending, disabled, action, signal, onSuccess, onError]);

  // Don't render if not in World App
  if (isInstalled !== true) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <LiveFeedback
        label={{
          failed: "Verification failed",
          pending: "Verifying...",
          success: "Verified",
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
          onClick={handleVerification}
          disabled={isPending || disabled}
          size="sm"
          variant="secondary"
        >
          {verificationStatus === "verifying"
            ? "Verifying..."
            : verificationStatus === "success"
            ? "Verified"
            : verificationStatus === "error"
            ? "Verification Failed"
            : buttonText}
        </Button>
      </LiveFeedback>

      {verificationStatus === "success" && (
        <p className="text-xs text-green-600 text-center">
          ✅ World ID verified successfully!
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
