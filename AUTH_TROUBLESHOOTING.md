# Wallet Authentication Troubleshooting Guide

## 🐛 Issue: Login Wallet Not Working

### Common Causes:

1. **Missing or Weak HMAC Secret** ⚠️
2. **MiniKit not properly initialized**
3. **ngrok URL not configured in Developer Portal**
4. **Browser console errors**

---

## 🔍 Step-by-Step Debugging

### Step 1: Check Browser Console

Open your browser console (F12) and look for errors when clicking "Login with Wallet":

**Common Errors:**

1. **"MiniKit is not installed"**

   - Make sure you're testing in World App, not a regular browser
   - Use ngrok URL in World App

2. **"HMAC verification failed"**

   - Your HMAC_SECRET_KEY needs to be regenerated (see below)

3. **"Network error" or "Failed to fetch"**

   - Check ngrok tunnel is active
   - Verify AUTH_URL in .env.local matches ngrok URL

4. **"App ID not provided"**
   - Already fixed in our previous changes

---

## 🔧 Fix 1: Update HMAC Secret Key

Your current secret `'some-secret'` is too weak and may cause authentication issues.

### Generate a Strong Secret:

Since OpenSSL isn't available on your system, use this PowerShell alternative:

```powershell
# Run this in PowerShell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Update .env.local:

```env
# Replace this line:
HMAC_SECRET_KEY='some-secret'

# With your new generated secret:
HMAC_SECRET_KEY='YOUR_NEW_SECRET_HERE'
```

**⚠️ Important: Restart dev server after updating!**

---

## 🔧 Fix 2: Verify Environment Variables

Check your `.env.local` has all required variables:

```env
AUTH_SECRET="your-auth-secret"
HMAC_SECRET_KEY='your-strong-secret'  # ⚠️ Update this!
AUTH_URL='https://your-ngrok-url.ngrok-free.dev'
NEXT_PUBLIC_APP_ID='app_staging_fb26847cc38d7ca8186f5aa65fe268f3'
NEXT_PUBLIC_ACTION='verifyaction'
```

---

## 🔧 Fix 3: Update ngrok URL

Your ngrok URL changes every time you restart ngrok. Make sure:

1. **Current ngrok URL:**

   ```bash
   ngrok http 3000
   ```

   Copy the HTTPS URL (e.g., `https://xyz-abc.ngrok-free.dev`)

2. **Update .env.local:**

   ```env
   AUTH_URL='https://your-new-ngrok-url.ngrok-free.dev'
   ```

3. **Update Developer Portal:**

   - Go to [developer.worldcoin.org](https://developer.worldcoin.org)
   - Update your app's URL settings
   - Add ngrok URL to allowed origins

4. **Update next.config.ts:**

   ```typescript
   allowedDevOrigins: ["https://your-new-ngrok-url.ngrok-free.dev"];
   ```

5. **Restart dev server**

---

## 🔧 Fix 4: Test in World App Only

The wallet authentication **only works in World App**, not in regular browsers.

### How to Test:

1. **Start ngrok:**

   ```bash
   ngrok http 3000
   ```

2. **Start dev server:**

   ```bash
   npm run dev
   ```

3. **Open in World App:**

   - Open World App on your phone
   - Scan the QR code or enter the ngrok URL
   - The app should load inside World App

4. **Click "Login with Wallet"**
   - Should prompt for wallet authentication
   - Should redirect to /home after success

---

## 🔧 Fix 5: Check Server Logs

Look at your terminal where `npm run dev` is running for errors:

**Look for:**

- `Invalid signed nonce` → Update HMAC_SECRET_KEY
- `Invalid final payload` → Check Auth URL
- `No response from wallet auth` → Check MiniKit initialization

---

## 📱 Testing Checklist

Before testing wallet login:

- [ ] ngrok is running: `ngrok http 3000`
- [ ] Dev server is running: `npm run dev`
- [ ] HMAC_SECRET_KEY is a strong random string (not 'some-secret')
- [ ] AUTH_URL in .env.local matches current ngrok URL
- [ ] Developer Portal has current ngrok URL
- [ ] Testing in World App (not regular browser)
- [ ] Server restarted after .env.local changes

---

## 🎯 Quick Fix for Immediate Testing

If you want to test quickly, here's the fastest path:

### 1. Generate New HMAC Secret (PowerShell):

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output.

### 2. Update .env.local:

```env
HMAC_SECRET_KEY='YOUR_GENERATED_SECRET_FROM_ABOVE'
```

### 3. Restart Everything:

```bash
# Stop your dev server (Ctrl+C)
# Stop ngrok (Ctrl+C)

# Start ngrok
ngrok http 3000

# Copy the new ngrok HTTPS URL
# Update .env.local with new AUTH_URL

# Start dev server
npm run dev
```

### 4. Test in World App:

- Open World App
- Enter your ngrok URL
- Click "Login with Wallet"
- Should work! ✅

---

## 🔍 Common Console Errors & Solutions

### Error: "MiniKit is not installed"

**Cause:** Testing in regular browser instead of World App

**Solution:**

- Must test in World App
- Use ngrok URL in World App

### Error: "Invalid signed nonce"

**Cause:** Weak or missing HMAC_SECRET_KEY

**Solution:**

- Generate new strong secret (see above)
- Update .env.local
- Restart dev server

### Error: "Network request failed"

**Cause:** ngrok tunnel not active or URL mismatch

**Solution:**

- Check ngrok is running
- Verify AUTH_URL matches ngrok URL
- Update Developer Portal

### Error: "Wallet authentication failed"

**Cause:** Multiple possible issues

**Solution:**

1. Check browser console for specific error
2. Check server logs
3. Verify all environment variables
4. Ensure testing in World App

---

## 📊 Debug Output

Add this to see what's happening:

### In src/auth/wallet/index.ts, the code already logs:

```typescript
console.log("Result", result);
console.log(result.finalPayload);
```

### Check console for:

```javascript
// Success looks like:
{
  status: "success",
  address: "0x...",
  // ... other fields
}

// Failure looks like:
{
  status: "error",
  error_code: "...",
  // ... error details
}
```

---

## 🚨 WebSocket Error (Not Critical)

The WebSocket error you're seeing:

```
WebSocket connection to 'wss://.../_next/webpack-hmr' failed
```

**This is normal with ngrok and doesn't affect authentication!**

- It's just hot module reload (HMR) trying to connect
- Doesn't impact app functionality
- You can ignore this error

To fix it (optional):

```typescript
// next.config.ts
const nextConfig = {
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};
```

---

## ✅ Successful Login Flow

When everything works correctly, you should see:

1. **User clicks "Login with Wallet"**
2. **World App shows authentication prompt**
3. **User approves**
4. **Console logs show success payload**
5. **User redirects to /home**
6. **User sees their username and profile picture**

---

## 🆘 Still Not Working?

If you've tried everything and it still doesn't work:

1. **Share console errors** - Look in browser console (F12)
2. **Share server logs** - Look in your terminal
3. **Verify steps:**
   - ✅ Testing in World App (not browser)
   - ✅ ngrok is running
   - ✅ HMAC_SECRET_KEY is updated
   - ✅ AUTH_URL matches ngrok
   - ✅ Server restarted

---

## 📝 Next Steps After Login Works

Once login is working:

1. ✅ Test verification on Home page
2. ✅ Test Connect Four game
3. ✅ Test payment features (if needed)
4. ✅ Create action in Developer Portal

---

**Last Updated:** October 14, 2025
**Status:** Debugging Guide Ready
