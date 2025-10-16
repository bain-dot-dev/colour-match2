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
  const storedNonce = cookieStore.get("siwe")?.value;

  console.log("SIWE Verification - Nonce check:", {
    receivedNonce: nonce,
    storedNonce,
    match: nonce === storedNonce,
  });

  if (nonce !== storedNonce) {
    return NextResponse.json(
      {
        status: "error",
        isValid: false,
        message: "Invalid nonce - session may have expired",
      },
      { status: 400 }
    );
  }

  try {
    const validMessage = await verifySiweMessage(payload, nonce);

    console.log("SIWE Verification result:", validMessage);

    if (!validMessage.isValid) {
      return NextResponse.json(
        {
          status: "error",
          isValid: false,
          message: "Invalid signature",
        },
        { status: 400 }
      );
    }

    // Clear the nonce after successful verification
    cookieStore.delete("siwe");

    // Return user data for session creation
    return NextResponse.json({
      status: "success",
      isValid: true,
      address: payload.address,
      message: "Authentication successful",
    });
  } catch (error: unknown) {
    console.error("SIWE verification error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json(
      {
        status: "error",
        isValid: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
};
