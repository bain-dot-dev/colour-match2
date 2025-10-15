"use client";
import { MiniKit } from "@worldcoin/minikit-js";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import dynamic from "next/dynamic";
import { useEffect, type ReactNode } from "react";

const ErudaProvider = dynamic(
  () => import("@/providers/Eruda").then((c) => c.ErudaProvider),
  { ssr: false }
);

// Define props for ClientProviders
interface ClientProvidersProps {
  children: ReactNode;
  session: Session | null; // Use the appropriate type for session from next-auth
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
 *
 * This component ensures both providers are available to all child components.
 */
export default function ClientProviders({
  children,
  session,
}: ClientProvidersProps) {
  const appId = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`;

  console.log("ClientProviders - App ID:", appId);

  // Initialize MiniKit
  useEffect(() => {
    if (appId) {
      console.log("Installing MiniKit with App ID:", appId);
      try {
        const result = MiniKit.install(appId);
        console.log("MiniKit installation result:", result);
      } catch (error) {
        console.error("Failed to install MiniKit:", error);
      }
    }
  }, [appId]);

  if (!appId) {
    console.error("NEXT_PUBLIC_APP_ID is not configured!");
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Error: NEXT_PUBLIC_APP_ID is missing. Please check your .env.local file.
      </div>
    );
  }

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
