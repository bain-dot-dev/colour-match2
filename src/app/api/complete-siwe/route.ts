import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from "@worldcoin/minikit-js";

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

export const POST = async (req: NextRequest) => {
  const { payload, nonce } = (await req.json()) as IRequestPayload;

  const cookieStore = await cookies();
  if (nonce != cookieStore.get("siwe")?.value) {
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: "Invalid nonce",
    });
  }

  try {
    const validMessage = await verifySiweMessage(payload, nonce);
    return NextResponse.json({
      status: "success",
      isValid: validMessage.isValid,
    });
  } catch (error: unknown) {
    // Handle errors in validation or processing
    const errorMessage =
      error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({
      status: "error",
      isValid: false,
      message: errorMessage,
    });
  }
};
