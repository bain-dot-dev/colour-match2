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
      <Page.Main className="flex flex-col items-center justify-start p-4 md:p-6 min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        {/* User Info Card - Matching Game Theme */}
        <div className="w-full max-w-md mb-6 p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-cyan-500/30">
          <div className="flex items-center gap-4 mb-4">
            {session.user.profilePictureUrl && (
              <div className="relative">
                <Image
                  src={session.user.profilePictureUrl}
                  alt="Profile"
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full border-2 border-cyan-400 shadow-lg shadow-cyan-500/50"
                />
                <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-pulse"></div>
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-base md:text-lg font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                {session.user.username ||
                  `0x${session.user.walletAddress?.slice(
                    2,
                    6
                  )}...${session.user.walletAddress?.slice(-4)}`}
              </h2>
              <p className="text-xs text-gray-400 font-mono break-all">
                {session.user.walletAddress?.slice(0, 6)}...
                {session.user.walletAddress?.slice(-4)}
              </p>
              {session.user.deviceOS && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  {session.user.deviceOS}
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
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold border-0 shadow-lg shadow-pink-500/30 transition-all duration-200"
            >
              Sign Out
            </Button>
          </form>
        </div>

        {/* Success Message */}
        {/* <div className="w-full max-w-md mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-sm font-semibold text-green-800 mb-2">
            ✅ Authentication Successful!
          </h3>
          <p className="text-xs text-green-700">
            You&apos;ve successfully logged in using Wallet Authentication
            (SIWE). Your session is secure and passwordless.
          </p>
        </div> */}

        {/* Game */}
        <div className="w-full">
          <ConnectFour />
        </div>
      </Page.Main>
    </>
  );
}
