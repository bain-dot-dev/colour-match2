# Wallet Authentication Troubleshooting Guide

This guide helps you diagnose and fix common wallet authentication issues in World App Mini Apps.

## 🔍 Quick Diagnostics

### Step 1: Check Environment Setup

Run these checks first:

```bash
# Verify environment variables are set
echo $NEXTAUTH_SECRET
echo $NEXT_PUBLIC_APP_ID
echo $NEXT_PUBLIC_ACTION
```

Required variables:

- `NEXTAUTH_SECRET` - Any random string (at least 32 characters recommended)
- `NEXT_PUBLIC_APP_ID` - Your World App ID (format: `app_xxxxx`)
- `NEXT_PUBLIC_ACTION` - Your World ID action ID (for World ID Kit fallback)

### Step 2: Check MiniKit Installation

Open Eruda console in World App and run:

```javascript
console.log("MiniKit installed:", window.MiniKit?.isInstalled());
console.log("App ID:", process.env.NEXT_PUBLIC_APP_ID);
```

Expected output:

```
MiniKit installed: true
App ID: app_xxxxx
```

### Step 3: Test Authentication Flow

Click "Connect Wallet" and watch the console for emoji logs:

✅ **Expected sequence:**

```
🔐 Starting Wallet Authentication...
📝 Fetching nonce from server...
✅ Nonce received: [alphanumeric string]
🔑 Requesting wallet signature...
📦 Wallet auth response: [payload object]
🔍 Verifying signature with server...
✅ Server verification result: { isValid: true }
💼 Wallet address: 0x...
👤 Fetching user info from MiniKit...
🎫 Creating session...
🎉 Sign in result: { ok: true }
✅ Authentication successful! Redirecting...
```

❌ **If you see errors**, continue to specific error sections below.

## 🚨 Common Errors & Solutions

### Error: "Please open this app in World App"

**Symptom:** Button shows error message immediately

**Cause:** Not running inside World App environment

**Solution:**

1. Open your mini app URL in World App (not browser)
2. Or test browser flow with World ID Kit instead
3. Check if `isInstalled` is correctly detecting environment

---

### Error: "Failed to get nonce from server"

**Symptom:**

```
📝 Fetching nonce from server...
❌ Failed to get nonce from server
```

**Possible Causes:**

1. **API route not accessible**

   - Check: Can you access `http://localhost:3000/api/nonce` directly?
   - Fix: Ensure dev server is running: `npm run dev`

2. **Middleware blocking the route**

   - Check: Look for middleware errors in terminal
   - Fix: Ensure `/api/*` paths are excluded in middleware config

3. **CORS issues**
   - Check: Network tab shows CORS error
   - Fix: Add proper CORS headers or use allowedDevOrigins

**Debug:**

```bash
# Test nonce endpoint directly
curl http://localhost:3000/api/nonce

# Expected response:
# {"nonce":"abc123def456..."}
```

---

### Error: "Invalid nonce - session may have expired"

**Symptom:**

```
🔍 Verifying signature with server...
❌ Invalid nonce - session may have expired
```

**Possible Causes:**

1. **Nonce expired (>5 minutes)**

   - Fix: Restart authentication process
   - Solution: Try again immediately after getting nonce

2. **Cookie not being sent**

   - Check: Browser devtools → Application → Cookies
   - Should see: `siwe` cookie with alphanumeric value
   - Fix: Ensure cookies are enabled in World App

3. **Multiple concurrent auth attempts**
   - Each attempt generates a new nonce
   - Fix: Only click "Connect Wallet" once

**Debug:**

```javascript
// Check if cookie is set (in Eruda console)
document.cookie.split(";").find((c) => c.includes("siwe"));
```

---

### Error: "Invalid signature"

**Symptom:**

```
✅ Server verification result: { isValid: false }
❌ Invalid signature
```

**Possible Causes:**

1. **User rejected signing**

   - User clicked "Cancel" on signing prompt
   - Fix: Try again and approve the signature

2. **Signature verification failed**

   - Wrong nonce used
   - Tampered message
   - Fix: This shouldn't happen in normal use - report as bug

3. **Version mismatch**
   - Old version of MiniKit
   - Fix: Update `@worldcoin/minikit-js` to latest

**Debug:**

```bash
# Check MiniKit version
npm list @worldcoin/minikit-js

# Update to latest
npm install @worldcoin/minikit-js@latest
```

---

### Error: "Failed to create session"

**Symptom:**

```
🎫 Creating session...
❌ Failed to create session
```

**Possible Causes:**

1. **NextAuth configuration issue**

   - Check: `NEXTAUTH_SECRET` is set
   - Fix: Add to `.env.local`:
     ```
     NEXTAUTH_SECRET=your-random-secret-at-least-32-chars
     ```

2. **Invalid credentials**

   - Missing wallet address
   - Fix: Check if `finalPayload.address` is present

3. **NextAuth version mismatch**
   - Check: Using NextAuth v5 beta
   - Fix: `npm install next-auth@^5.0.0-beta.25`

**Debug:**

```javascript
// Check session after login (in protected page)
const session = await auth();
console.log("Session:", session);
```

---

### Error: "Could not fetch user info"

**Symptom:**

```
⚠️ Could not fetch user info, using defaults
```

**Note:** This is a **WARNING**, not an error. Auth will still work!

**Cause:** `MiniKit.getUserByAddress()` is optional and may fail

**Behavior:**

- App uses fallback values:
  - Username: `User 0x1234...`
  - Profile pic: Generated avatar from dicebear

**This is normal and expected** - the helper function handles this gracefully.

---

### Error: "Authentication failed" (Generic)

**Symptom:** Generic error with no specific message

**Debug Steps:**

1. **Check all console logs**

   ```
   Look for the ❌ emoji and see where it stopped
   ```

2. **Check network tab**

   ```
   /api/nonce - Should return 200 with nonce
   /api/complete-siwe - Should return 200 with isValid: true
   ```

3. **Check Eruda console errors**

   ```
   Any red error messages?
   Any network failures?
   ```

4. **Restart everything**

   ```bash
   # Kill dev server
   # Clear .next cache
   rm -rf .next

   # Restart
   npm run dev
   ```

---

## 🔧 Advanced Debugging

### Enable Verbose Logging

The implementation already includes comprehensive logging. To see it:

1. **In World App:**

   - Shake device to open Eruda
   - Go to Console tab
   - Filter by emoji (🔐 ✅ ❌)

2. **In Terminal:**
   - Server logs appear in your dev terminal
   - Look for "SIWE Verification" logs

### Check Request/Response

```typescript
// Add to AuthButton before walletAuth call:
console.log("About to call walletAuth with nonce:", nonce);

// Add after walletAuth call:
console.log("Full finalPayload:", JSON.stringify(finalPayload, null, 2));

// Add after server verification:
console.log("Full verify response:", JSON.stringify(verifyData, null, 2));
```

### Test Individual Components

1. **Test nonce generation:**

   ```bash
   curl http://localhost:3000/api/nonce
   ```

2. **Test with mock signature:**
   Create a test file to verify the complete-siwe endpoint independently

3. **Test NextAuth:**

   ```typescript
   import { signIn } from "next-auth/react";

   await signIn("credentials", {
     walletAddress: "0x1234...",
     username: "Test User",
     redirect: false,
   });
   ```

### Common Environment Issues

**Issue:** Works on localhost but not in production

**Checks:**

1. Environment variables set in production?
2. HTTPS enabled? (Required for secure cookies)
3. Domain whitelisted in World ID Developer Portal?

**Issue:** Works in browser but not in World App

**Checks:**

1. Is MiniKit properly installed?
2. Is app ID correct for production vs staging?
3. Are dev origins allowed?

---

## 📋 Pre-Flight Checklist

Before reporting a bug, verify:

- [ ] All environment variables are set
- [ ] `npm run dev` is running without errors
- [ ] Can access `/api/nonce` directly
- [ ] Using latest `@worldcoin/minikit-js`
- [ ] NEXTAUTH_SECRET is set
- [ ] App ID format is correct (`app_xxxxx`)
- [ ] Tested in actual World App (not just browser)
- [ ] Eruda console shows no errors before clicking login
- [ ] Cookies are enabled

---

## 🆘 Still Having Issues?

### Gather Debug Info

Collect this information:

```
1. Error message (exact text)
2. Console logs (screenshot from Eruda)
3. Network requests (from Eruda Network tab)
4. Environment:
   - World App version
   - Device OS (iOS/Android)
   - Node version
   - Next.js version
   - MiniKit version

5. Steps to reproduce:
   - What did you click?
   - What happened?
   - What did you expect?
```

### Reset Everything

Nuclear option - full reset:

```bash
# 1. Stop dev server

# 2. Clear all caches
rm -rf .next
rm -rf node_modules
rm -rf package-lock.json

# 3. Reinstall
npm install

# 4. Clear browser/app cache
# In World App: Settings → Clear Cache

# 5. Restart dev server
npm run dev

# 6. Try again
```

---

## 🎓 Understanding the Flow

If you're still confused, here's a simple mental model:

1. **Nonce = One-time password**

   - Server creates it
   - Client asks you to sign it
   - Server checks if signature matches

2. **Why can it fail?**

   - Nonce expires (like OTP codes)
   - Signature is wrong (like wrong password)
   - Session can't be created (like login system is broken)

3. **How to fix?**
   - Try again (generates new nonce)
   - Check logs (see where it failed)
   - Verify environment (is everything configured?)

---

## 📚 Additional Resources

- [Wallet Auth Official Docs](https://docs.world.org/mini-apps/commands/wallet-auth)
- [SIWE Standard](https://eips.ethereum.org/EIPS/eip-4361)
- [NextAuth Troubleshooting](https://authjs.dev/getting-started/migrating-to-v5)
- [MiniKit GitHub Issues](https://github.com/worldcoin/minikit-js/issues)
