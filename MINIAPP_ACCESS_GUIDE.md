# How to Access Your Mini App in World App

## 🚨 Common Issue: In-App Browser vs Mini App

There's a critical difference between:

- ❌ **Opening a URL in World App's in-app browser** (won't work for wallet auth)
- ✅ **Opening as a proper Mini App** (wallet auth works)

## 📱 Correct Ways to Access Your Mini App

### Method 1: Developer Settings (Best for Testing)

1. **Open World App** on your phone
2. **Go to Settings** (tap your profile)
3. **Tap "Advanced"** or find **"Developer Settings"**
4. **Enable Developer Mode** if not already enabled
5. **Add Mini App URL:**
   ```
   http://YOUR_LOCAL_IP:3000
   ```
   Example: `http://192.168.1.100:3000`
6. **Open from the Mini Apps section**

### Method 2: Deep Link (Production)

Use the World App deep link format:

```
worldapp://mini-app?app_id=YOUR_APP_ID&path=/
```

Replace `YOUR_APP_ID` with your actual app ID from `.env.local`

### Method 3: QR Code with Deep Link (Production)

Create a QR code that points to:

```
https://worldcoin.org/mini-app?app_id=YOUR_APP_ID&path=/
```

This will redirect to the World App properly.

## ❌ What NOT to Do

**Don't scan a regular URL QR code!**

If you create a QR code with just:

```
http://192.168.1.100:3000
```

World App will open it in its **in-app browser**, not as a mini app. This means:

- ❌ MiniKit won't be available
- ❌ Wallet authentication won't work
- ❌ You'll see the World ID Kit flow instead

## 🔍 How to Tell if You're in a Mini App

### Check 1: Look at the Top Bar

- ✅ **Mini App:** Shows your app icon and name
- ❌ **In-App Browser:** Shows a regular browser address bar

### Check 2: Check Console Logs

Open Eruda (shake device) and look for:

```javascript
// ✅ Good (Mini App)
MiniKit installed: true
window.MiniKit: exists
window.WorldApp: exists

// ❌ Bad (In-App Browser)
MiniKit installed: false
window.MiniKit: undefined
window.WorldApp: undefined
```

### Check 3: Look for the Warning

After my update, you should now see a **yellow warning box** if MiniKit is not detected.

## 🛠️ Step-by-Step: Setting Up for Testing

### Step 1: Get Your Local IP

**macOS/Linux:**

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**

```bash
ipconfig
```

Look for your local network IP (usually `192.168.x.x`)

### Step 2: Ensure Dev Server is Running

```bash
npm run dev
```

Make sure you see:

```
✓ Ready on http://0.0.0.0:3000
```

### Step 3: Configure Developer Settings in World App

1. Open World App
2. Tap your profile → Settings
3. Look for "Advanced" or "Developer"
4. Enable developer mode
5. You should see an option to add a mini app URL
6. Enter: `http://YOUR_LOCAL_IP:3000`

### Step 4: Open from Mini Apps Section

Don't use a QR code! Open it from the mini apps list in World App.

## 📋 Troubleshooting

### Issue: "I don't see Developer Settings"

**Solution:**

- Update World App to the latest version
- Developer settings might be under different menu locations
- Try looking in: Settings → Advanced → Developer

### Issue: "It still shows World ID Kit, not Wallet Auth"

**Check these:**

1. **Console logs** (Eruda):

   ```javascript
   console.log(MiniKit.isInstalled()); // Should be true
   ```

2. **Yellow warning box** - Do you see it? If yes, you're not in a mini app

3. **App ID** - Is `NEXT_PUBLIC_APP_ID` set in `.env.local`?

4. **Refresh** - Try closing and reopening the mini app

### Issue: "I can only access via QR code"

**For Development:**
Use Developer Settings method instead of QR codes.

**For Production:**
Make sure your QR code uses the deep link format:

```
https://worldcoin.org/mini-app?app_id=YOUR_APP_ID
```

## 🎯 Expected Behavior

### ✅ When Correctly Accessed as Mini App:

1. **Login Page Shows:**

   - "✅ You're in World App - using wallet authentication"
   - Green "Connect Wallet" button
   - No yellow warning box

2. **After Clicking Connect Wallet:**
   - World App signing drawer appears
   - You can sign the message
   - Redirects to home page with your info

### ❌ When Incorrectly Accessed (In-App Browser):

1. **Login Page Shows:**

   - "🌐 You're in a browser - using World ID Kit QR code"
   - Yellow warning box: "⚠️ MiniKit Not Detected"
   - Black "Verify with World ID" button

2. **After Clicking:**
   - QR code appears
   - Asks you to open World App (but you're already in it!)
   - Confusing redirect loop

## 🔑 Developer Portal Configuration

Make sure your mini app is properly configured:

### 1. Go to World ID Developer Portal

https://developer.worldcoin.org/

### 2. Create/Edit Your Mini App

- **Name:** Your app name
- **App ID:** Copy this to `NEXT_PUBLIC_APP_ID`
- **Allowed Origins:** Add your development URL
  ```
  http://192.168.1.100:3000
  http://localhost:3000
  ```
- **Redirect URIs:** Configure if needed

### 3. Save and Copy App ID

Make sure the App ID in the portal matches exactly with your `.env.local`:

```
NEXT_PUBLIC_APP_ID=app_staging_xxxxxxxxxxxxx
```

## 📞 Next Steps

1. **Update your app** - Restart dev server to see the new warning box
2. **Access properly** - Use Developer Settings method
3. **Check console** - Look for "🔍 Environment Detection" logs
4. **Look for yellow box** - If you see it, you're not in a mini app
5. **Try again** - Close and reopen from mini apps section

## 💡 Quick Test

After accessing your mini app:

1. Shake device to open Eruda
2. Go to Console tab
3. Type:
   ```javascript
   MiniKit.isInstalled();
   ```
4. Should return `true`

If it returns `false` or shows an error, you're not in a mini app environment!

---

**Still having issues?** Share a screenshot of:

1. The yellow warning box (if visible)
2. Eruda console showing environment detection
3. How you're accessing the app (QR code? Deep link? Settings?)
