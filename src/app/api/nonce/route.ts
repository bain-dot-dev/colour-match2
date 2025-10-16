import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  // Generate a secure nonce
  const nonce = crypto.randomUUID().replace(/-/g, "");

  // Store the nonce in a secure cookie
  const cookieStore = await cookies();
  cookieStore.set("siwe", nonce, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 5, // 5 minutes
  });

  return NextResponse.json({ nonce });
}
