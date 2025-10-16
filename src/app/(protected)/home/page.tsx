import { auth, signOut } from "@/auth";
import { Page } from "@/components/PageLayout";
import { ConnectFour } from "@/components/ConnectFour";
import { redirect } from "next/navigation";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import Image from "next/image";

/**
 * Connect Four Game Page
 * Protected route that requires authentication
 */
export default async function GamePage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <>
      <Page.Main className="flex flex-col items-center justify-start p-6">
        {/* User Info Card */}
        <div className="w-full max-w-md mb-6 p-4 bg-white rounded-lg shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            {session.user.profilePictureUrl && (
              <Image
                src={session.user.profilePictureUrl}
                alt="Profile"
                width={64}
                height={64}
                className="w-16 h-16 rounded-full border-2 border-gray-200"
              />
            )}
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">
                {session.user.username || "Anonymous"}
              </h2>
              <p className="text-xs text-gray-600 font-mono break-all">
                {session.user.walletAddress?.slice(0, 6)}...
                {session.user.walletAddress?.slice(-4)}
              </p>
              {session.user.deviceOS && (
                <p className="text-xs text-gray-500 mt-1">
                  Device: {session.user.deviceOS}
                </p>
              )}
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="w-full"
            >
              Sign Out
            </Button>
          </form>
        </div>

        {/* Success Message */}
        <div className="w-full max-w-md mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-sm font-semibold text-green-800 mb-2">
            ✅ Authentication Successful!
          </h3>
          <p className="text-xs text-green-700">
            You&apos;ve successfully logged in using Wallet Authentication
            (SIWE). Your session is secure and passwordless.
          </p>
        </div>

        {/* Game */}
        <div className="w-full">
          <ConnectFour />
        </div>
      </Page.Main>
    </>
  );
}
