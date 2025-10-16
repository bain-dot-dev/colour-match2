"use client";
import { AuthButton } from "../AuthButton";
// import { DebugInfo } from "../DebugInfo";
import { WalletAuthDebug } from "../WalletAuthDebug";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";

/**
 * Demo component showing the wallet authentication flow
 * This component demonstrates how the app uses Wallet Authentication as the primary auth method
 * Read More: https://docs.world.org/mini-apps/commands/wallet-auth
 */
export const VerificationDemo = () => {
  const { isInstalled } = useMiniKit();
  const [debugInfo, setDebugInfo] = useState<{
    miniKitInstalled: boolean;
    windowMiniKit: boolean;
    windowWorldApp: boolean;
    userAgent: string;
    appId: string;
  } | null>(null);

  useEffect(() => {
    // Detailed environment detection
    const detection = {
      miniKitInstalled: MiniKit.isInstalled(),
      windowMiniKit:
        typeof window !== "undefined" &&
        !!(window as { MiniKit?: unknown }).MiniKit,
      windowWorldApp:
        typeof window !== "undefined" &&
        !!(window as { WorldApp?: unknown }).WorldApp,
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "SSR",
      appId: process.env.NEXT_PUBLIC_APP_ID || "not-set",
    };

    setDebugInfo(detection);

    console.log("🔍 Environment Detection:", {
      isInstalled,
      miniKitIsInstalled: MiniKit.isInstalled(),
      windowMiniKit: detection.windowMiniKit,
      windowWorldApp: detection.windowWorldApp,
      userAgent: detection.userAgent,
      appId: process.env.NEXT_PUBLIC_APP_ID,
    });

    // Additional debugging
    if (!MiniKit.isInstalled() && typeof window !== "undefined") {
      console.warn("⚠️ MiniKit is NOT installed!");
      console.warn("⚠️ This usually means:");
      console.warn("  1. You're accessing via in-app browser (not mini app)");
      console.warn("  2. App ID mismatch between code and deep link");
      console.warn("  3. MiniKit failed to initialize");
      console.warn("  App ID in code:", process.env.NEXT_PUBLIC_APP_ID);
    }
  }, [isInstalled]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Environment Detection Warning */}
      {debugInfo && !debugInfo.miniKitInstalled && (
        <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
          <h3 className="text-sm font-bold text-yellow-900 mb-2">
            ⚠️ MiniKit Not Detected
          </h3>
          <p className="text-xs text-yellow-800 mb-2">
            You&apos;re accessing this app but MiniKit is not installed. This
            means you&apos;re either:
          </p>
          <ul className="text-xs text-yellow-800 space-y-1 ml-4 list-disc">
            <li>Opening via World App&apos;s in-app browser (wrong)</li>
            <li>Opening in a regular web browser (use World ID Kit instead)</li>
            <li>App not registered in Developer Portal</li>
          </ul>
          <div className="mt-3 p-2 bg-white rounded text-xs">
            <p className="font-semibold text-gray-800 mb-1">Debug Info:</p>
            <p className="font-mono text-gray-600 text-xs">
              MiniKit: {debugInfo.miniKitInstalled ? "✅" : "❌"}
              <br />
              window.MiniKit: {debugInfo.windowMiniKit ? "✅" : "❌"}
              <br />
              window.WorldApp: {debugInfo.windowWorldApp ? "✅" : "❌"}
              <br />
              App ID:{" "}
              {debugInfo.appId
                ? debugInfo.appId.substring(0, 20) + "..."
                : "❌"}
            </p>
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Authentication
        </h1>
        <p className="text-sm text-gray-600">
          {isInstalled === true
            ? "✅ You're in World App - using wallet authentication"
            : isInstalled === false
            ? "🌐 You're in a browser - using World ID Kit QR code"
            : "🔄 Checking environment..."}
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
