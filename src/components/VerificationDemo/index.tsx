"use client";
import { AuthButton } from "../AuthButton";
import { DebugInfo } from "../DebugInfo";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";

/**
 * Demo component showing the verification flow
 * This component demonstrates how the app handles both:
 * 1. World App users (using MiniKit verification + wallet auth)
 * 2. Browser users (using World ID Kit QR code verification)
 */
export const VerificationDemo = () => {
  const { isInstalled } = useMiniKit();

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          World ID Verification
        </h1>
        <p className="text-sm text-gray-600">
          {isInstalled === true
            ? "You're in World App - using MiniKit wallet authentication"
            : isInstalled === false
            ? "You're in a browser - using World ID Kit QR code"
            : "Checking environment..."}
        </p>
      </div>

      <div className="space-y-4">
        <AuthButton />

        <DebugInfo />

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            How it works:
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            {isInstalled === true ? (
              <>
                <li>• Connect your World App wallet (primary)</li>
                <li>• Optionally verify World ID for specific actions</li>
                <li>• Seamless native experience</li>
              </>
            ) : (
              <>
                <li>• Scan QR code with World App</li>
                <li>• Verify your identity in World App</li>
                <li>• Return to browser to continue</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
