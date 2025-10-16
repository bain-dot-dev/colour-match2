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

  console.log("🔧 ClientProviders - App ID:", appId);
  console.log("🔧 MiniKit already installed?", MiniKit.isInstalled());

  if (!appId) {
    console.error("❌ NEXT_PUBLIC_APP_ID is not configured!");
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Error: NEXT_PUBLIC_APP_ID is missing. Please check your .env.local file.
      </div>
    );
  }

  // Install MiniKit before rendering
  // This ensures MiniKit is available immediately
  if (typeof window !== "undefined" && !MiniKit.isInstalled()) {
    console.log("📦 Installing MiniKit with App ID:", appId);
    try {
      MiniKit.install(appId);
      console.log("✅ MiniKit installed successfully");
    } catch (error) {
      console.error("❌ Failed to install MiniKit:", error);
    }
  }

  return (
    <ErudaProvider>
      <MiniKitProvider>
        <SessionProvider session={session}>{children}</SessionProvider>
      </MiniKitProvider>
    </ErudaProvider>
  );
}
