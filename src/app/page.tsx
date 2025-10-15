import { Page } from "@/components/PageLayout";
import { VerificationDemo } from "../components/VerificationDemo";

export default function Home() {
  return (
    <Page>
      <Page.Main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <VerificationDemo />
      </Page.Main>
    </Page>
  );
}
