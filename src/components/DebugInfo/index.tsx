"use client";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { MiniKit } from "@worldcoin/minikit-js";

/**
 * Debug component to help troubleshoot MiniKit integration
 */
export const DebugInfo = () => {
  const { isInstalled } = useMiniKit();

  const checkMiniKitStatus = () => {
    console.log("=== MiniKit Debug Info ===");
    console.log("isInstalled:", isInstalled);
    console.log("MiniKit.isInstalled():", MiniKit.isInstalled());
    console.log(
      "window.MiniKit:",
      (window as unknown as { MiniKit?: unknown }).MiniKit
    );
    console.log(
      "window.WorldApp:",
      (window as unknown as { WorldApp?: unknown }).WorldApp
    );
    console.log("Environment variables:");
    console.log("- NEXT_PUBLIC_APP_ID:", process.env.NEXT_PUBLIC_APP_ID);
    console.log("- NEXT_PUBLIC_ACTION:", process.env.NEXT_PUBLIC_ACTION);
    console.log("=========================");
  };

  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-sm font-semibold text-yellow-800 mb-2">
        🐛 Debug Information
      </h3>
      <div className="text-xs text-yellow-700 space-y-1">
        <p>
          <strong>MiniKit Status:</strong>{" "}
          {isInstalled === true
            ? "✅ Installed"
            : isInstalled === false
            ? "❌ Not Installed"
            : "⏳ Checking..."}
        </p>
        <p>
          <strong>Environment:</strong>{" "}
          {isInstalled === true ? "World App" : "Browser"}
        </p>
        <p>
          <strong>App ID:</strong>{" "}
          {process.env.NEXT_PUBLIC_APP_ID || "❌ Not set"}
        </p>
        <p>
          <strong>Action:</strong>{" "}
          {process.env.NEXT_PUBLIC_ACTION || "❌ Not set"}
        </p>
      </div>
      <button
        onClick={checkMiniKitStatus}
        className="mt-2 px-3 py-1 text-xs bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
      >
        Log Debug Info to Console
      </button>
    </div>
  );
};
