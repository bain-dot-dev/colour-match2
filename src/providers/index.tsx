"use client";
import { MiniKit } from "@worldcoin/minikit-js";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";
import { type ReactNode } from "react";

const ErudaProvider = dynamic(
  () => import("@/providers/Eruda").then((c) => c.ErudaProvider),
  { ssr: false }
);

// Define props for ClientProviders
interface ClientProvidersProps {
  children: ReactNode;
  session: Session | null;
}

/**
 * ClientProvider wraps the app with essential context providers.
 *
 * - ErudaProvider:
 *     - Should be used only in development.
 *     - Enables an in-browser console for logging and debugging.
 *
 * - MiniKitProvider:
 *     - Required for MiniKit functionality.
 *     - Must be configured with App ID from environment variables.
 *     - IMPORTANT: MiniKitProvider calls MiniKit.install() internally
 *
 * This component ensures both providers are available to all child components.
 */
export default function ClientProviders({
  children,
  session,
}: ClientProvidersProps) {
  const appId = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`;

  if (!appId) {
    console.error("❌ NEXT_PUBLIC_APP_ID is not configured!");
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Error: NEXT_PUBLIC_APP_ID is missing. Please check your .env.local file.
      </div>
    );
  }

  console.log("🔧 ClientProviders - App ID:", appId);
  console.log(
    "🔧 Environment:",
    typeof window !== "undefined" ? "client" : "server"
  );

  // Check if we're in World App environment
  if (typeof window !== "undefined") {
    console.log("🌍 World App Detection:", {
      hasMiniKit: !!(window as { MiniKit?: unknown }).MiniKit,
      hasWorldApp: !!(window as { WorldApp?: unknown }).WorldApp,
      miniKitInstalled: MiniKit.isInstalled(),
      userAgent: window.navigator.userAgent.substring(0, 100),
    });
  }

  // Let MiniKitProvider handle the installation
  // Do NOT call MiniKit.install() manually - it may cause conflicts
  return (
    <ErudaProvider>
      <MiniKitProvider
        props={{
          appId: appId,
        }}
      >
        <SessionProvider session={session}>{children}</SessionProvider>
      </MiniKitProvider>
    </ErudaProvider>
  );
}
