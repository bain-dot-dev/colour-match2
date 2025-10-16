import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Page } from "@/components/PageLayout";

/**
 * Protected layout for authenticated users only
 * Middleware will handle the redirect, but this provides a server-side check as well
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Server-side authentication check
  // The middleware should already handle this, but this is a backup
  if (!session) {
    console.log("⚠️  Not authenticated - redirecting to login");
    redirect("/");
  }

  console.log("✅ Authenticated user:", {
    username: session.user?.username,
    walletAddress: session.user?.walletAddress,
  });

  return (
    <Page>
      {children}
      {/* <Page.Footer className="px-0 fixed bottom-0 w-full bg-white">
        <Navigation />
      </Page.Footer> */}
    </Page>
  );
}
