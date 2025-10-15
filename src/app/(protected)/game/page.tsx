import { auth } from "@/auth";
import { Page } from "@/components/PageLayout";
import { ConnectFour } from "@/components/ConnectFour";
import { Marble, TopBar } from "@worldcoin/mini-apps-ui-kit-react";

/**
 * Connect Four Game Page
 * Protected route that requires authentication
 */
export default async function GamePage() {
  const session = await auth();

  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="Connect Four"
          endAdornment={
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold capitalize">
                {session?.user.username}
              </p>
              <Marble src={session?.user.profilePictureUrl} className="w-12" />
            </div>
          }
        />
      </Page.Header>
      <Page.Main className="flex flex-col items-center justify-start mb-16">
        <ConnectFour />
      </Page.Main>
    </>
  );
}
