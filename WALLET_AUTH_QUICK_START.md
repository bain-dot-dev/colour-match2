# Wallet Authentication - Quick Start

Get wallet authentication working in your World App mini app in 5 minutes.

## ✅ Prerequisites

- Node.js 18+ installed
- World App installed on your device
- Mini app created in [World ID Developer Portal](https://developer.worldcoin.org/)

## 🚀 Quick Setup

### 1. Install Dependencies

Your app already has all the required dependencies installed:

- `@worldcoin/minikit-js@latest`
- `next-auth@^5.0.0-beta.25`
- `next@15.2.3`

### 2. Configure Environment Variables

Create/update `.env.local`:

```bash
# NextAuth Secret (generate a random string)
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-characters-long

# Your World App ID (from Developer Portal)
NEXT_PUBLIC_APP_ID=app_staging_xxxxxxxxxxxxx

# Your World ID Action (for World ID Kit fallback)
NEXT_PUBLIC_ACTION=your-action-id

# URL for production (optional)
NEXTAUTH_URL=https://your-app.com
```

**Generate a secret:**

```bash
openssl rand -base64 32
# Or use any random string generator
```

### 3. Start Development Server

```bash
npm run dev
```

Your app will be available at `http://localhost:3000`

### 4. Test in World App

#### Option A: Local Development (Recommended)

1. Get your local IP address:

   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # Windows
   ipconfig
   ```

2. In World App, navigate to:

   ```
   http://YOUR_LOCAL_IP:3000
   ```

   Example: `http://192.168.1.100:3000`

3. Click "Connect Wallet"

4. Sign the message when prompted

5. You should be redirected to `/home` with your wallet info displayed!

#### Option B: Using Ngrok (Alternative)

```bash
# Install ngrok
npm install -g ngrok

# Create tunnel
ngrok http 3000

# Use the https URL in World App
# Example: https://abc123.ngrok.io
```

### 5. Test in Browser (Fallback)

1. Open `http://localhost:3000` in your browser

2. You'll see World ID Kit QR code

3. Scan with World App to verify

4. Complete verification in World App

5. Browser will redirect to `/home`

## 🎯 What You Should See

### In World App (Wallet Auth)

1. **Login Page:**

   - "Connect Your Wallet" heading
   - "Connect Wallet" button
   - Green info box about Wallet Authentication

2. **After Clicking Connect Wallet:**

   - World App signing drawer opens
   - Shows message: "Sign in to this app"
   - "Sign" and "Cancel" buttons

3. **After Signing:**
   - Success message
   - Redirect to `/home`
   - Your profile info displayed
   - Wallet address shown
   - Connect Four game

### In Browser (World ID Kit)

1. **Login Page:**

   - "Verify with World ID" heading
   - "Verify with World ID" button
   - QR code appears when clicked

2. **After Scanning:**
   - Complete verification in World App
   - Browser redirects to `/home`

## 🔍 Verify It's Working

### Check Console Logs

Open Eruda console (shake device in World App) and look for:

```
✅ MiniKit installation result: true
🔐 Starting Wallet Authentication...
📝 Fetching nonce from server...
✅ Nonce received: [string]
🔑 Requesting wallet signature...
📦 Wallet auth response: { status: "success", ... }
🔍 Verifying signature with server...
✅ Server verification result: { isValid: true }
💼 Wallet address: 0x...
👤 Fetching user info from MiniKit...
✅ User info: {...}
🎫 Creating session...
🎉 Sign in result: { ok: true }
✅ Authentication successful! Redirecting...
```

### Check Network Requests

In Eruda Network tab, verify:

1. **GET /api/nonce**

   - Status: 200
   - Response: `{ "nonce": "..." }`

2. **POST /api/complete-siwe**
   - Status: 200
   - Response: `{ "status": "success", "isValid": true }`

### Check Cookies

In Eruda Application/Storage tab:

1. After nonce request:

   - Cookie `siwe` should exist
   - HTTP-only, Secure

2. After login:
   - Cookie `authjs.session-token` should exist

## ⚡ Quick Troubleshooting

### "Please open this app in World App"

→ You're in a browser, not World App. Use World ID Kit instead or open in World App.

### "Failed to get nonce from server"

→ Check if dev server is running: `npm run dev`

### "Invalid nonce"

→ Nonce expired (5 min timeout). Try again immediately.

### "Invalid signature"

→ You clicked "Cancel" on signing. Try again and click "Sign".

### "Failed to create session"

→ Check `NEXTAUTH_SECRET` is set in `.env.local`

### Nothing happens when clicking button

→ Check Eruda console for errors. Is MiniKit installed?

## 📱 Production Deployment

### 1. Set Production Environment Variables

In your hosting platform (Vercel, etc.):

```bash
NEXTAUTH_SECRET=your-production-secret
NEXT_PUBLIC_APP_ID=app_xxxxxxxxxxxxx  # Production app ID
NEXT_PUBLIC_ACTION=your-production-action-id
NEXTAUTH_URL=https://your-app.com
```

### 2. Whitelist Your Domain

In World ID Developer Portal:

1. Go to your app settings
2. Add your production domain to allowed origins
3. Save changes

### 3. Deploy

```bash
# Build
npm run build

# Deploy (example with Vercel)
vercel --prod
```

### 4. Test in Production

1. Open your production URL in World App
2. Test wallet authentication
3. Verify user info displays correctly

## 🎓 Understanding the Code

### Key Components

1. **`AuthButton`** (`src/components/AuthButton/index.tsx`)

   - Main login UI
   - Handles both wallet auth and World ID Kit

2. **Nonce API** (`src/app/api/nonce/route.ts`)

   - Generates one-time nonce for signing

3. **SIWE Verification** (`src/app/api/complete-siwe/route.ts`)

   - Verifies signature from World App

4. **Auth Config** (`src/auth/index.ts`)

   - NextAuth setup with custom credentials provider

5. **Middleware** (`middleware.ts`)
   - Protects routes, manages redirects

### Authentication Flow

```
Browser/World App → AuthButton
                     ↓
                   GET /api/nonce
                     ↓
            MiniKit.commandsAsync.walletAuth()
                     ↓
            User signs in World App
                     ↓
              POST /api/complete-siwe
                     ↓
             Server verifies signature
                     ↓
            signIn() creates NextAuth session
                     ↓
              Redirect to /home
```

## 📚 Next Steps

Now that authentication is working:

1. **Customize the UI**

   - Edit `AuthButton/index.tsx`
   - Update button text, colors, etc.

2. **Add More Protected Routes**

   - Create files in `app/(protected)/`
   - They automatically require authentication

3. **Access User Data**

   ```typescript
   const session = await auth();
   const walletAddress = session.user.walletAddress;
   const username = session.user.username;
   ```

4. **Use MiniKit Features**

   ```typescript
   import { MiniKit } from "@worldcoin/minikit-js";

   const user = await MiniKit.getUserByAddress(address);
   const walletAddress = MiniKit.walletAddress;
   ```

5. **Implement Payments**
   - Use MiniKit payment commands
   - See official docs for payment integration

## 🔗 Resources

- [Full Guide](./WALLET_AUTH_GUIDE.md) - Detailed implementation guide
- [Troubleshooting](./WALLET_AUTH_TROUBLESHOOTING.md) - Fix common issues
- [Official Docs](https://docs.world.org/mini-apps/commands/wallet-auth) - World ID docs
- [MiniKit Reference](https://github.com/worldcoin/minikit-js) - MiniKit SDK

## ✨ Success!

If you can:

1. ✅ Click "Connect Wallet" in World App
2. ✅ Sign the message
3. ✅ See your wallet info on `/home`

**Congratulations!** 🎉 Wallet authentication is working!

---

**Need help?** Check the [Troubleshooting Guide](./WALLET_AUTH_TROUBLESHOOTING.md)
