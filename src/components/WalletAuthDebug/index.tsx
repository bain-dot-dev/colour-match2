"use client";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { MiniKit } from "@worldcoin/minikit-js";
import { useState } from "react";

/**
 * Debug component to help troubleshoot wallet authentication issues
 * This component provides detailed logging and testing for wallet auth
 */
export const WalletAuthDebug = () => {
  const { isInstalled } = useMiniKit();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo((prev) => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[WalletAuthDebug] ${message}`);
  };

  const testMiniKitStatus = () => {
    addDebugInfo("=== MiniKit Status Check ===");
    addDebugInfo(`isInstalled: ${isInstalled}`);
    addDebugInfo(`MiniKit.isInstalled(): ${MiniKit.isInstalled()}`);
    addDebugInfo(
      `window.MiniKit exists: ${!!(window as unknown as { MiniKit?: unknown })
        .MiniKit}`
    );
    addDebugInfo(
      `window.WorldApp exists: ${!!(window as unknown as { WorldApp?: unknown })
        .WorldApp}`
    );
    addDebugInfo("=========================");
  };

  const testWalletAuth = async () => {
    if (!isInstalled) {
      addDebugInfo("❌ MiniKit not installed - cannot test wallet auth");
      return;
    }

    try {
      addDebugInfo("🔄 Testing wallet authentication...");

      // Test 1: Check if commandsAsync exists
      addDebugInfo(`commandsAsync exists: ${!!MiniKit.commandsAsync}`);
      addDebugInfo(
        `commandsAsync.walletAuth exists: ${!!MiniKit.commandsAsync
          ?.walletAuth}`
      );

      // Test 2: Try to get nonce
      addDebugInfo("🔄 Fetching nonce from server...");
      const nonceResponse = await fetch("/api/nonce");
      const { nonce } = await nonceResponse.json();
      addDebugInfo(`✅ Nonce received: ${nonce}`);

      // Test 3: Try wallet auth using official implementation
      addDebugInfo("🔄 Attempting wallet authentication...");
      const { commandPayload: generateMessageResult, finalPayload } =
        await MiniKit.commandsAsync.walletAuth({
          nonce: nonce,
          requestId: "0", // Optional
          expirationTime: new Date(
            new Date().getTime() + 7 * 24 * 60 * 60 * 1000
          ),
          notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
          statement: "Debug test - https://worldcoin.com/apps",
        });

      addDebugInfo(
        `✅ Wallet auth result: ${JSON.stringify(
          { generateMessageResult, finalPayload },
          null,
          2
        )}`
      );

      if (finalPayload.status === "error") {
        addDebugInfo(
          `❌ Wallet auth failed: ${finalPayload.error_code || "Unknown error"}`
        );
        return;
      }

      addDebugInfo("✅ Wallet authentication successful!");

      // Test 4: Try to get user info using official method
      addDebugInfo("🔄 Getting user info...");
      const walletAddress = finalPayload.address;
      addDebugInfo(`Wallet address from finalPayload: ${walletAddress}`);

      const userInfo = await MiniKit.getUserByAddress(walletAddress);
      addDebugInfo(`✅ User info: ${JSON.stringify(userInfo, null, 2)}`);

      // Test 5: Try SIWE verification
      addDebugInfo("🔄 Testing SIWE verification...");
      const verifyResponse = await fetch("/api/complete-siwe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      });

      const verifyData = await verifyResponse.json();
      addDebugInfo(
        `✅ SIWE verification result: ${JSON.stringify(verifyData, null, 2)}`
      );
    } catch (error) {
      addDebugInfo(`❌ Error during wallet auth test: ${error}`);
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo([]);
  };

  return (
    <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">
        🔧 Wallet Authentication Debug
      </h3>

      <div className="space-y-2 mb-4">
        <button
          onClick={testMiniKitStatus}
          className="px-3 py-1 text-xs bg-blue-200 text-blue-800 rounded hover:bg-blue-300"
        >
          Test MiniKit Status
        </button>

        <button
          onClick={testWalletAuth}
          disabled={!isInstalled}
          className="px-3 py-1 text-xs bg-green-200 text-green-800 rounded hover:bg-green-300 disabled:bg-gray-200 disabled:text-gray-500"
        >
          Test Wallet Auth
        </button>

        <button
          onClick={clearDebugInfo}
          className="px-3 py-1 text-xs bg-red-200 text-red-800 rounded hover:bg-red-300"
        >
          Clear Log
        </button>
      </div>

      <div className="text-xs text-gray-700 space-y-1 max-h-40 overflow-y-auto">
        {debugInfo.length === 0 ? (
          <p className="text-gray-500 italic">
            Click &quot;Test MiniKit Status&quot; to start debugging
          </p>
        ) : (
          debugInfo.map((info, index) => (
            <div key={index} className="font-mono text-xs">
              {info}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
