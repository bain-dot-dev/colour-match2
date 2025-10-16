# Wallet Authentication - Usage Guide (New Implementation)

## 🚀 Quick Start

### Using Wallet Auth in Any Component

```typescript
import { walletAuth } from "@/auth/wallet";

// In your component
const handleLogin = async () => {
  try {
    await walletAuth();
    // User is now authenticated and redirected to /home
  } catch (error) {
    console.error("Login failed:", error);
    // Handle error
  }
};
```

That's it! The `walletAuth()` function handles everything.

---

## 🎯 What `walletAuth()` Does Automatically

1. **Generates Nonces** - Creates secure random nonce + signed nonce
2. **Requests Signature** - Shows MiniKit wallet auth dialog to user
3. **Verifies SIWE** - Cryptographically verifies the signature
4. **Fetches User Info** - Gets username, profile picture, etc. from MiniKit
5. **Creates Session** - Establishes NextAuth session with user data
6. **Redirects** - Sends user to `/home` on success

---

## 🔍 Detecting World App vs Browser

```typescript
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";

export default function MyPage() {
  const { isInstalled } = useMiniKit();

  if (isInstalled) {
    // User is in World App - show wallet auth
    return <button onClick={() => walletAuth()}>Connect Wallet</button>;
  } else {
    // User is in browser - show World ID QR code
    return <IDKitWidget {...props} />;
  }
}
```

---

## 📝 Full Example: Login Button

```typescript
"use client";
import { walletAuth } from "@/auth/wallet";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { useState } from "react";

export function LoginButton() {
  const { isInstalled } = useMiniKit();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!isInstalled) {
      setError("Please open this app in World App");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await walletAuth();
      // Success - user is redirected automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleLogin} disabled={loading || !isInstalled}>
        {loading ? "Connecting..." : "Connect Wallet"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

---

## 🔐 How Verification Works (Under the Hood)

You don't need to know this to use it, but here's what happens:

```typescript
// 1. Generate nonces (server-side)
const { nonce, signedNonce } = await getNewNonces();
// nonce: random UUID
// signedNonce: HMAC hash of nonce

// 2. Request wallet signature (client-side)
const result = await MiniKit.commandsAsync.walletAuth({
  nonce,
  expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  statement: "Authenticate...",
});

// 3. Verify in NextAuth (server-side)
authorize: async ({ nonce, signedNonce, finalPayloadJson }) => {
  // Verify signed nonce matches
  if (signedNonce !== hashNonce({ nonce })) return null;

  // Verify SIWE signature
  const result = await verifySiweMessage(finalPayload, nonce);
  if (!result.isValid) return null;

  // Get user info and create session
  const userInfo = await getUserByAddressSafe(address);
  return { id: address, ...userInfo };
};
```

---

## 🛡️ Security Features

### ✅ What's Protected

- **Nonce Uniqueness** - Each login uses a new random nonce
- **Signature Verification** - SIWE message is cryptographically verified
- **Nonce Matching** - Signed nonce must match server-generated hash
- **Server-Side Validation** - All verification happens server-side
- **Cannot Bypass** - No way to create session without valid signature

### ⚠️ What You Should Know

- Nonces are single-use (each login generates a new one)
- SIWE signatures expire after 7 days
- User must sign in World App to complete authentication
- Session is stored as a JWT (strategy: "jwt")

---

## 📊 Session Data Available

After authentication, the session contains:

```typescript
// Access in server components
import { auth } from "@/auth";

const session = await auth();
console.log(session?.user);
// {
//   id: "0x123...",
//   walletAddress: "0x123...",
//   username: "alice.eth",
//   profilePictureUrl: "https://...",
//   permissions: {
//     notifications: true,
//     contacts: false
//   },
//   optedIntoOptionalAnalytics: true,
//   worldAppVersion: 1,
//   deviceOS: "ios"
// }
```

```typescript
// Access in client components
import { useSession } from "next-auth/react";

const { data: session } = useSession();
console.log(session?.user.username); // "alice.eth"
```

---

## 🎨 UI States to Handle

```typescript
const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
  "idle"
);

const handleAuth = async () => {
  setState("loading");

  try {
    await walletAuth();
    setState("success");
    // User redirected
  } catch (error) {
    setState("error");
  }
};

// In your JSX
{
  state === "loading" && <Spinner />;
}
{
  state === "error" && <ErrorMessage />;
}
{
  state === "success" && <SuccessMessage />;
}
```

---

## 🧪 Testing Checklist

When implementing wallet auth:

- [ ] Test in World App (mini app mode)
- [ ] Test error when opened in browser
- [ ] Test successful authentication flow
- [ ] Test user data appears in session
- [ ] Test redirect to `/home` works
- [ ] Test error handling for cancelled auth
- [ ] Test error handling for network failures
- [ ] Verify console logs show proper flow

---

## 🐛 Common Issues & Solutions

### Issue: "Please open this app in World App"

**Cause:** User is in a browser, not World App  
**Solution:** Show World ID Kit QR code instead

### Issue: No response from wallet auth

**Cause:** User cancelled the signature request  
**Solution:** Show friendly error message, allow retry

### Issue: Nonce mismatch

**Cause:** Nonce expired or network issue  
**Solution:** Retry - new nonce will be generated

### Issue: Session not created

**Cause:** SIWE verification failed  
**Solution:** Check console logs for specific error

---

## 📚 Related Files

- `src/auth/wallet/index.ts` - Main walletAuth function
- `src/auth/index.ts` - NextAuth configuration with verification
- `src/auth/wallet/server-helpers.ts` - Nonce generation
- `src/auth/wallet/client-helpers.ts` - Nonce hashing
- `src/types/minikit.ts` - Type definitions and helpers

---

## 🎓 Advanced Usage

### Custom Redirect

```typescript
import { walletAuth } from "@/auth/wallet";
import { signIn } from "next-auth/react";

// If you need custom redirect (modify walletAuth or call signIn directly)
const result = await signIn("credentials", {
  redirect: false,
  nonce,
  signedNonce,
  finalPayloadJson: JSON.stringify(payload),
});

if (result?.ok) {
  router.push("/custom-page");
}
```

### Custom Statement Message

Edit `src/auth/wallet/index.ts`:

```typescript
statement: `Welcome to MyApp! (${crypto.randomUUID().replace(/-/g, '')}).`,
```

### Custom Expiration Time

Edit `src/auth/wallet/index.ts`:

```typescript
expirationTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
```

---

## ✅ Summary

**Simple to use:**

```typescript
await walletAuth();
```

**Secure by default:**

- ✅ Nonce verification
- ✅ SIWE signature verification
- ✅ Server-side validation
- ✅ Cannot bypass

**Easy to maintain:**

- Single source of truth
- Centralized in NextAuth
- Well-documented flow

**Ready for production! 🚀**
