# 🚀 Quick Fix: Wallet Login Not Working

## ✅ What I Just Fixed

**Problem:** Your `HMAC_SECRET_KEY` was set to `'some-secret'` (too weak)  
**Solution:** Updated to strong cryptographic secret

Your `.env.local` now has:

```env
HMAC_SECRET_KEY='7jHNoLMP7jfZBaR2wF7syKEp2T/N1e7SZWEY7tz2axc='
```

---

## 🔄 Required: Restart Your Dev Server

**This is critical!** Environment variables only load on server start.

### Steps:

1. **Stop your current dev server:**

   - Press `Ctrl+C` in the terminal where `npm run dev` is running

2. **Start it again:**

   ```bash
   npm run dev
   ```

3. **Wait for "Ready"** message

---

## 📱 How to Test Wallet Login

### ⚠️ Important: Must Test in World App

Wallet authentication **only works in World App**, not in regular browsers!

### Testing Steps:

1. **Make sure ngrok is running:**

   ```bash
   ngrok http 3000
   ```

   Your current URL: `https://prissy-indescribable-lewis.ngrok-free.dev`

2. **Make sure dev server is running:**

   ```bash
   npm run dev
   ```

3. **Open in World App:**

   - Open World App on your mobile device
   - Enter or scan: `https://prissy-indescribable-lewis.ngrok-free.dev`

4. **Click "Login with Wallet"**
   - Should show authentication prompt
   - Approve the request
   - Should redirect to `/home`

---

## 🐛 If Login Still Doesn't Work

### Check 1: Are you testing in World App?

❌ **Won't Work:**

- Chrome browser
- Safari browser
- Firefox browser
- Any desktop browser

✅ **Will Work:**

- World App (mobile)
- Via ngrok URL

### Check 2: Is ngrok URL correct?

Your current ngrok URL in `.env.local`:

```
https://prissy-indescribable-lewis.ngrok-free.dev
```

**If you restarted ngrok**, the URL changes! You need to:

1. Copy new ngrok URL
2. Update `AUTH_URL` in `.env.local`
3. Restart dev server

### Check 3: Browser Console Errors

Open developer tools in World App (if available) or check your server logs.

**Look for these errors:**

```
❌ "MiniKit is not installed"
   → You're not in World App

❌ "Invalid signed nonce"
   → Server not restarted after secret update

❌ "Network request failed"
   → ngrok URL mismatch or tunnel down

❌ "App ID not provided"
   → Already fixed (MiniKitProvider)
```

---

## ✅ Success Indicators

When login works correctly, you'll see:

1. **World App shows prompt:** "Authenticate with Wallet"
2. **You approve** the request
3. **Terminal logs** show:
   ```
   Result { status: 'success', ... }
   ```
4. **Page redirects** to `/home`
5. **You see** your username and profile picture

---

## 🎯 Complete Checklist

Before testing:

- [x] HMAC_SECRET_KEY updated (already done)
- [ ] Dev server restarted (`npm run dev`)
- [ ] ngrok is running (`ngrok http 3000`)
- [ ] AUTH_URL matches ngrok URL
- [ ] Testing in World App (not browser)
- [ ] World App can access ngrok URL

---

## 🔥 Quick Debug Commands

### Check if variables are loaded:

```bash
# In your project directory
node -e "console.log('HMAC:', process.env.HMAC_SECRET_KEY)"
```

Should show: `undefined` (because it's server-side only)

### Check ngrok status:

```bash
curl http://localhost:4040/api/tunnels
```

Should show your active tunnel.

---

## 📊 Expected Login Flow

```
1. User opens app in World App
   ↓
2. Clicks "Login with Wallet"
   ↓
3. MiniKit sends authentication request
   ↓
4. World App prompts user to approve
   ↓
5. User approves
   ↓
6. App receives signed message
   ↓
7. Server verifies signature with HMAC
   ↓
8. Creates session with NextAuth
   ↓
9. Redirects to /home
   ↓
10. ✅ User is logged in!
```

---

## 🆘 Still Having Issues?

### Quick Diagnostic:

1. **Open browser console (F12) in World App**
2. **Click "Login with Wallet"**
3. **Look for errors**
4. **Share the error message** for further help

### Common Issues:

| Error                   | Cause                | Fix                    |
| ----------------------- | -------------------- | ---------------------- |
| "MiniKit not installed" | Not in World App     | Test in World App      |
| "Invalid signed nonce"  | Server not restarted | Restart dev server     |
| "Network error"         | ngrok down           | Restart ngrok          |
| No response             | Wrong APP_ID         | Check Developer Portal |

---

## ⚡ Fastest Path to Working Login

If you want it working RIGHT NOW:

```bash
# 1. Stop everything (Ctrl+C)

# 2. Start ngrok
ngrok http 3000

# 3. Copy the HTTPS URL

# 4. Update .env.local AUTH_URL with new ngrok URL

# 5. Start dev server
npm run dev

# 6. Open in World App

# 7. Login!
```

---

## 📝 What About the WebSocket Error?

```
WebSocket connection to 'wss://.../_next/webpack-hmr' failed
```

**This is normal!**

- It's just hot module reload (HMR)
- Doesn't affect authentication
- Safe to ignore
- Happens with ngrok tunnels

---

## ✅ You're Ready!

Your environment is now properly configured:

- ✅ Strong HMAC secret
- ✅ MiniKitProvider with App ID
- ✅ All environment variables set
- ✅ Documentation created

**Just restart your dev server and test in World App!**

---

**Status:** Ready to Test  
**Next Step:** Restart dev server  
**Test In:** World App (not browser)

Good luck! 🎉
