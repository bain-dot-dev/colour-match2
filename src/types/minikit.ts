/**
 * MiniKit User type as defined in the official documentation
 * @see https://docs.world.org/mini-apps/commands/wallet-auth
 */
export type MiniKitUser = {
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
};

/**
 * Helper function to safely get user by address
 * Falls back to default values if MiniKit.getUserByAddress fails
 */
export async function getUserByAddressSafe(
  address: string
): Promise<MiniKitUser> {
  try {
    // Import dynamically to avoid SSR issues
    const { MiniKit } = await import("@worldcoin/minikit-js");
    const userInfo = await MiniKit.getUserByAddress(address);
    return userInfo as MiniKitUser;
  } catch (error) {
    console.warn("Failed to fetch user info from MiniKit:", error);
    // Return defaults
    return {
      walletAddress: address,
      username: `User ${address.slice(0, 6)}`,
      profilePictureUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
      permissions: {
        notifications: false,
        contacts: false,
      },
      optedIntoOptionalAnalytics: false,
    };
  }
}

/**
 * Helper function to safely get user by username
 * Falls back to null if MiniKit.getUserByUsername fails
 */
export async function getUserByUsernameSafe(
  username: string
): Promise<MiniKitUser | null> {
  try {
    // Import dynamically to avoid SSR issues
    const { MiniKit } = await import("@worldcoin/minikit-js");
    const userInfo = await MiniKit.getUserByUsername(username);
    return userInfo as MiniKitUser;
  } catch (error) {
    console.warn("Failed to fetch user info by username from MiniKit:", error);
    return null;
  }
}

/**
 * Formats user data for NextAuth credentials
 */
export function formatUserForAuth(user: MiniKitUser) {
  return {
    walletAddress: user.walletAddress || "",
    username: user.username || "Anonymous",
    profilePictureUrl:
      user.profilePictureUrl ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.walletAddress}`,
    permissions: JSON.stringify(user.permissions || {}),
    optedIntoOptionalAnalytics: String(
      user.optedIntoOptionalAnalytics || false
    ),
    worldAppVersion: String(user.worldAppVersion || ""),
    deviceOS: user.deviceOS || "world-app",
  };
}
