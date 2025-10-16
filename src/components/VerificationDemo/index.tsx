"use client";
import { AuthButton } from "../AuthButton";
import { DebugInfo } from "../DebugInfo";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";

/**
 * Demo component showing the wallet authentication flow
 * This component demonstrates how the app uses Wallet Authentication as the primary auth method
 * Read More: https://docs.world.org/mini-apps/commands/wallet-auth
 */
export const VerificationDemo = () => {
  const { isInstalled } = useMiniKit();

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Wallet Authentication
        </h1>
        <p className="text-sm text-gray-600">
          {isInstalled === true
            ? "You're in World App - ready for wallet authentication"
            : isInstalled === false
            ? "You're in a browser - World App required for authentication"
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
                <li>• Connect your World App wallet for authentication</li>
                <li>• Secure, passwordless login experience</li>
                <li>• No World ID verification required for login</li>
                <li>• Seamless native World App experience</li>
              </>
            ) : (
              <>
                <li>• Download and open World App on your device</li>
                <li>• Navigate to this app within World App</li>
                <li>• Connect your wallet to authenticate</li>
                <li>• Enjoy secure, passwordless access</li>
              </>
            )}
          </ul>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-xs font-semibold text-blue-800 mb-1">
            About Wallet Authentication:
          </h4>
          <p className="text-xs text-blue-700">
            This app uses Wallet Authentication as the primary authentication
            method. It provides secure, passwordless login using your World App
            wallet without requiring World ID verification for basic
            authentication.
          </p>
        </div>
      </div>
    </div>
  );
};
