import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifySiweMessage } from "@worldcoin/minikit-js";
import { hashNonce } from "./wallet/client-helpers";
import { getUserByAddressSafe } from "@/types/minikit";

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    walletAddress?: string;
    username?: string;
    profilePictureUrl?: string;
    permissions?: {
      notifications: boolean;
      contacts: boolean;
    };
    optedIntoOptionalAnalytics?: boolean;
    worldAppVersion?: number;
    deviceOS?: string;
  }

  interface Session {
    user: {
      walletAddress?: string;
      username?: string;
      profilePictureUrl?: string;
      permissions?: {
        notifications: boolean;
        contacts: boolean;
      };
      optedIntoOptionalAnalytics?: boolean;
      worldAppVersion?: number;
      deviceOS?: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Wallet Authentication",
      credentials: {
        nonce: { label: "Nonce", type: "text" },
        signedNonce: { label: "Signed Nonce", type: "text" },
        finalPayloadJson: { label: "Final Payload", type: "text" },
        // Legacy support for World ID browser auth
        walletAddress: { label: "Wallet Address", type: "text" },
        username: { label: "Username", type: "text" },
        profilePictureUrl: { label: "Profile Picture URL", type: "text" },
        permissions: { label: "Permissions", type: "text" },
        optedIntoOptionalAnalytics: { label: "Analytics Opt-in", type: "text" },
        worldAppVersion: { label: "World App Version", type: "text" },
        deviceOS: { label: "Device OS", type: "text" },
      },
      authorize: async (credentials) => {
        const {
          nonce,
          signedNonce,
          finalPayloadJson,
          walletAddress,
          username,
          profilePictureUrl,
          permissions,
          optedIntoOptionalAnalytics,
          worldAppVersion,
          deviceOS,
        } = credentials as {
          nonce?: string;
          signedNonce?: string;
          finalPayloadJson?: string;
          walletAddress?: string;
          username?: string;
          profilePictureUrl?: string;
          permissions?: string;
          optedIntoOptionalAnalytics?: string;
          worldAppVersion?: string;
          deviceOS?: string;
        };

        // WALLET AUTH FLOW (World App users)
        if (nonce && signedNonce && finalPayloadJson) {
          console.log("🔐 NextAuth: Verifying wallet authentication...");

          try {
            // 1. Verify the signed nonce matches expected value
            const expectedSignedNonce = hashNonce({ nonce });
            if (signedNonce !== expectedSignedNonce) {
              console.error("❌ Nonce mismatch!");
              return null;
            }

            // 2. Parse and verify the SIWE message
            const finalPayload = JSON.parse(finalPayloadJson);
            console.log("📝 Verifying SIWE message...");

            const result = await verifySiweMessage(finalPayload, nonce);

            if (!result.isValid || !result.siweMessageData?.address) {
              console.error("❌ Invalid SIWE signature!");
              return null;
            }

            console.log("✅ SIWE verification successful!");

            // 3. Fetch user info from MiniKit (with safe fallback)
            const userInfo = await getUserByAddressSafe(finalPayload.address);
            console.log("👤 User info:", userInfo);

            return {
              id: finalPayload.address,
              walletAddress: finalPayload.address,
              username: userInfo.username,
              profilePictureUrl: userInfo.profilePictureUrl,
              permissions: userInfo.permissions,
              optedIntoOptionalAnalytics: userInfo.optedIntoOptionalAnalytics,
              worldAppVersion: userInfo.worldAppVersion,
              deviceOS: userInfo.deviceOS,
            };
          } catch (error) {
            console.error("❌ Wallet auth verification failed:", error);
            return null;
          }
        }

        // WORLD ID BROWSER FLOW (fallback for browser users)
        if (walletAddress) {
          console.log("🌍 NextAuth: World ID browser authentication");
          return {
            id: walletAddress,
            walletAddress,
            username,
            profilePictureUrl,
            permissions: permissions ? JSON.parse(permissions) : undefined,
            optedIntoOptionalAnalytics: optedIntoOptionalAnalytics === "true",
            worldAppVersion: worldAppVersion
              ? parseInt(worldAppVersion)
              : undefined,
            deviceOS,
          };
        }

        console.error("❌ No valid credentials provided");
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.walletAddress = user.walletAddress;
        token.username = user.username;
        token.profilePictureUrl = user.profilePictureUrl;
        token.permissions = user.permissions;
        token.optedIntoOptionalAnalytics = user.optedIntoOptionalAnalytics;
        token.worldAppVersion = user.worldAppVersion;
        token.deviceOS = user.deviceOS;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token.userId) {
        session.user.id = token.userId as string;
        session.user.walletAddress = token.walletAddress as string;
        session.user.username = token.username as string;
        session.user.profilePictureUrl = token.profilePictureUrl as string;
        session.user.permissions = token.permissions as {
          notifications: boolean;
          contacts: boolean;
        };
        session.user.optedIntoOptionalAnalytics =
          token.optedIntoOptionalAnalytics as boolean;
        session.user.worldAppVersion = token.worldAppVersion as number;
        session.user.deviceOS = token.deviceOS as string;
      }
      return session;
    },
  },
});
