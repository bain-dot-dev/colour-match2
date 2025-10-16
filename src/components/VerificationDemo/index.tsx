"use client";
import { AuthButton } from "../AuthButton";
// import { DebugInfo } from "../DebugInfo";
import { WalletAuthDebug } from "../WalletAuthDebug";
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
          Authentication
        </h1>
        <p className="text-sm text-gray-600">
          {isInstalled === true
            ? "You're in World App - using wallet authentication"
            : isInstalled === false
            ? "You're in a browser - using World ID Kit QR code"
            : "Checking environment..."}
        </p>
      </div>

      <div className="space-y-4">
        <AuthButton />

        {/* <DebugInfo /> */}
        <WalletAuthDebug />

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
                <li>• Scan QR code with World App to verify identity</li>
                <li>• Complete verification in World App</li>
                <li>• Return to browser to continue</li>
                <li>
                  • Alternative: Open this app in World App for wallet auth
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-xs font-semibold text-blue-800 mb-1">
            About Authentication:
          </h4>
          <p className="text-xs text-blue-700">
            This app supports dual authentication methods: World ID Kit for
            browser users and Wallet Authentication for World App users. Both
            provide secure, passwordless login without requiring additional
            verification for basic authentication.
          </p>
        </div>
      </div>
    </div>
  );
};
