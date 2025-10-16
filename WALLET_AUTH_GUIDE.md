# Wallet Authentication Guide

This guide explains how Wallet Authentication (SIWE - Sign-In with Ethereum) is implemented in this application, following the official World ID Mini Apps documentation.

## 🔑 Overview

**Wallet Authentication is the PRIMARY authentication method** for this app when running inside World App. For browser users, we provide World ID Kit as an alternative.

> ⚠️ **Important**: Per official documentation, use Wallet Authentication as the primary auth flow. Do not use the Verify command for login purposes.

## 🏗️ Architecture

### Authentication Flow

```
1. User clicks "Connect Wallet" button
   ↓
2. Client fetches nonce from /api/nonce
   ↓
3. Client calls MiniKit.commandsAsync.walletAuth()
   ↓
4. World App prompts user to sign message
   ↓
5. Client receives signed message (SIWE format)
   ↓
6. Client sends signature to /api/complete-siwe for verification
   ↓
7. Server verifies signature using verifySiweMessage()
   ↓
8. Client creates NextAuth session with wallet address
   ↓
9. User is redirected to /home (protected route)
```

## 📁 Key Files

### 1. `/src/components/AuthButton/index.tsx`

- Main authentication UI component
- Handles wallet auth for World App users
- Handles World ID Kit for browser users
- Includes detailed console logging for debugging

### 2. `/src/app/api/nonce/route.ts`

- Generates secure, random nonce (at least 8 alphanumeric characters)
- Stores nonce in HTTP-only cookie
- 5-minute expiration for security

### 3. `/src/app/api/complete-siwe/route.ts`

- Verifies SIWE signature from World App
- Validates nonce matches stored value
- Returns user data for session creation
- Clears nonce after successful verification

### 4. `/src/auth/index.ts`

- NextAuth configuration
- Custom credentials provider for wallet auth
- JWT and session callbacks
- Extended User type with wallet information

### 5. `/middleware.ts`

- Route protection
- Redirects unauthenticated users to login
- Redirects authenticated users away from login page

### 6. `/src/types/minikit.ts`

- MiniKit User type definition
- Helper functions for safe user data fetching
- Credential formatting for NextAuth

## 🔧 Implementation Details

### Nonce Generation

```typescript
// Must be at least 8 alphanumeric characters
const nonce = crypto.randomUUID().replace(/-/g, "");

// Stored in secure HTTP-only cookie
cookieStore.set("siwe", nonce, {
  secure: true,
  httpOnly: true,
  sameSite: "strict",
  maxAge: 60 * 5, // 5 minutes
});
```

### Wallet Authentication Request

```typescript
const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
  nonce: nonce,
  requestId: "0",
  expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
  notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
  statement: "Sign in to this app",
});
```

### Signature Verification

```typescript
const validMessage = await verifySiweMessage(payload, nonce);

if (!validMessage.isValid) {
  throw new Error("Invalid signature");
}
```

### User Data Fetching

```typescript
// Using safe helper that falls back to defaults
const userInfo = await getUserByAddressSafe(walletAddress);

// Creates user with wallet address, username, profile pic, etc.
const authCredentials = formatUserForAuth(userInfo);
```

## 🎯 User Type

The MiniKit User object includes:

```typescript
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
```

## 🔍 Debugging

### Console Logging

The implementation includes comprehensive emoji-based logging:

- 🔐 Authentication start
- 📝 Nonce fetching
- 🔑 Signature request
- 📦 Response received
- 🔍 Server verification
- 💼 Wallet address
- 👤 User info fetching
- 🎫 Session creation
- ✅ Success
- ❌ Errors
- ⚠️ Warnings

### Common Issues

1. **"Invalid nonce" error**

   - Nonce expired (5-minute timeout)
   - Cookie not being sent (check secure/sameSite settings)
   - Multiple requests with same nonce

2. **"Invalid signature" error**

   - User rejected signing
   - Network issues during signing
   - Verification library mismatch

3. **"Failed to create session" error**

   - NextAuth configuration issue
   - Missing required credentials
   - NEXTAUTH_SECRET not set

4. **MiniKit not installed**
   - Not running in World App
   - MiniKit not initialized properly
   - Check NEXT_PUBLIC_APP_ID environment variable

### Debugging Steps

1. **Check Environment Variables**

   ```bash
   NEXTAUTH_SECRET=your-secret-here
   NEXT_PUBLIC_APP_ID=app_xxxxx
   NEXT_PUBLIC_ACTION=your-action-id
   ```

2. **Open Eruda Console** (in World App)

   - Check for emoji-logged steps
   - Look for errors in red
   - Verify nonce generation

3. **Check Network Tab**

   - `/api/nonce` returns `{ nonce: "..." }`
   - `/api/complete-siwe` returns `{ isValid: true }`

4. **Check Cookies**
   - `siwe` cookie should be set after nonce request
   - Should be HTTP-only and Secure

## ✅ Testing

### In World App

1. Open your mini app in World App
2. Click "Connect Wallet"
3. Sign the message when prompted
4. Verify redirect to /home
5. Check user info displays correctly
6. Test logout functionality

### In Browser

1. Open mini app in browser
2. Should see World ID Kit QR code
3. Scan with World App
4. Complete verification
5. Should redirect to /home

## 🚀 Next Steps

After successful authentication:

1. **Access session data**:

   ```typescript
   const session = await auth();
   console.log(session.user.walletAddress);
   ```

2. **Use MiniKit helpers**:

   ```typescript
   const user = await MiniKit.getUserByAddress(address);
   const user = await MiniKit.getUserByUsername(username);
   ```

3. **Access wallet address**:
   ```typescript
   const walletAddress = MiniKit.walletAddress;
   // or
   const walletAddress = window.MiniKit?.walletAddress;
   ```

## 📚 References

- [Official Wallet Auth Docs](https://docs.world.org/mini-apps/commands/wallet-auth)
- [SIWE Specification](https://eips.ethereum.org/EIPS/eip-4361)
- [NextAuth.js Documentation](https://authjs.dev)
- [MiniKit JS SDK](https://github.com/worldcoin/minikit-js)

## 🔒 Security Notes

1. **Nonces are single-use** - Deleted after verification
2. **HTTP-only cookies** - Client can't access nonce
3. **Secure flag required** - HTTPS only in production
4. **Short expiration** - 5-minute window
5. **Server-side verification** - Never trust client signatures
6. **CSRF protection** - SameSite cookie attribute

## 💡 Best Practices

1. Always use wallet auth as primary method
2. Provide World ID Kit as browser fallback
3. Include comprehensive error handling
4. Log all authentication steps
5. Clear nonces after use
6. Validate all server-side
7. Use TypeScript for type safety
8. Test in both World App and browser
