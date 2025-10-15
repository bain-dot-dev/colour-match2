# Environment Variables Setup Guide

## 📋 Complete Environment Variable Reference

Your Connect Four World Mini App requires the following environment variables in your `.env.local` file:

## ✅ Current Setup Status

Based on your `.env.local` file:

```env
# ✅ Authentication Secret (Required)
AUTH_SECRET="2TnBucu2wU8G7aDvmVYJMoQR+bD1Pm9hfzYeaCPnrdY="

# ✅ HMAC Secret Key (Required)
HMAC_SECRET_KEY='some-secret'

# ✅ Authentication URL (Required for Testing)
AUTH_URL='https://prissy-indescribable-lewis.ngrok-free.dev'

# ✅ World App ID (Required)
NEXT_PUBLIC_APP_ID='app_staging_fb26847cc38d7ca8186f5aa65fe268f3'

# ✅ World ID Action (Required for Verification)
NEXT_PUBLIC_ACTION='verifyaction'
```

---

## 🔧 Required Environment Variables

### 1. `AUTH_SECRET`

**Purpose:** Secret key for NextAuth.js session encryption  
**How to generate:**

```bash
npx auth secret
```

Or manually:

```bash
openssl rand -base64 32
```

**Example:**

```env
AUTH_SECRET="2TnBucu2wU8G7aDvmVYJMoQR+bD1Pm9hfzYeaCPnrdY="
```

**Status:** ✅ Already configured

---

### 2. `HMAC_SECRET_KEY`

**Purpose:** HMAC secret for wallet authentication nonce hashing  
**How to generate:**

```bash
openssl rand -base64 32
```

**Example:**

```env
HMAC_SECRET_KEY='your-generated-secret-here'
```

**Status:** ✅ Already configured (but consider regenerating for production)

---

### 3. `AUTH_URL`

**Purpose:** Base URL for authentication callbacks

- **Development/Testing:** Your ngrok URL
- **Production:** Your production domain

**Example:**

```env
# Development (with ngrok)
AUTH_URL='https://your-subdomain.ngrok-free.dev'

# Production
AUTH_URL='https://yourdomain.com'
```

**Status:** ✅ Already configured with ngrok URL

---

### 4. `NEXT_PUBLIC_APP_ID`

**Purpose:** Your World App application ID from the Developer Portal  
**Where to find:**

1. Go to [developer.worldcoin.org](https://developer.worldcoin.org)
2. Navigate to your app
3. Copy the App ID from the dashboard

**Format:** `app_xxxxxx` or `app_staging_xxxxxx`

**Example:**

```env
NEXT_PUBLIC_APP_ID='app_staging_fb26847cc38d7ca8186f5aa65fe268f3'
```

**Status:** ✅ Already configured

---

### 5. `NEXT_PUBLIC_ACTION`

**Purpose:** The action identifier for World ID verification  
**Where to configure:**

1. Go to [developer.worldcoin.org](https://developer.worldcoin.org)
2. Navigate to your app → **Actions**
3. Create or select an action
4. Use the action ID here

**Example:**

```env
NEXT_PUBLIC_ACTION='verifyaction'
```

**Status:** ✅ Already configured

---

## 🌍 World ID Developer Portal Setup

### Required Steps:

#### 1. **Create/Update Actions**

In the Developer Portal → Your App → **Actions**:

- **Action ID:** `verifyaction` (or your custom action)
- **Description:** "Connect Four game verification"
- **Max Verifications:** Set according to your needs

#### 2. **Configure URLs**

In the Developer Portal → Your App → **Settings**:

- **App URL:** Your ngrok URL during development
- **Redirect URIs:** Add your callback URLs
- **Allowed Origins:** Add your development/production URLs

#### 3. **Update `next.config.ts`**

Make sure your ngrok domain is in the allowed origins:

```typescript
const nextConfig: NextConfig = {
  allowedDevOrigins: ["https://your-subdomain.ngrok-free.dev"],
  // ... other config
};
```

**Current status:** Set to `['*']` (allows all - good for development)

---

## 🚀 Setup Process

### For Development (First Time):

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd colour-match2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Generate secrets**

   ```bash
   # Generate AUTH_SECRET
   npx auth secret

   # Generate HMAC_SECRET_KEY
   openssl rand -base64 32
   ```

4. **Start ngrok**

   ```bash
   ngrok http 3000
   ```

5. **Update `.env.local`** with your ngrok URL

   ```env
   AUTH_URL='https://your-new-subdomain.ngrok-free.dev'
   ```

6. **Update World Developer Portal**

   - Add ngrok URL to your app configuration
   - Ensure actions are created

7. **Run the app**
   ```bash
   npm run dev
   ```

---

## 📱 Testing the Setup

### 1. **Test Authentication**

- Open your app in World App
- Click "Sign In" or authenticate
- Should successfully authenticate with World ID

### 2. **Test Verification (Home Page)**

- Navigate to Home tab
- Click "Verify (Device)" or "Verify (Orb)"
- Should complete verification flow

### 3. **Test Connect Four Game**

- Navigate to Game tab
- Game should load without errors
- Play a full game to ensure functionality

---

## 🔐 Security Best Practices

### ⚠️ Important Notes:

1. **Never commit `.env.local`** to version control

   - Already in `.gitignore`

2. **Regenerate secrets for production**

   ```bash
   # New AUTH_SECRET
   openssl rand -base64 32

   # New HMAC_SECRET_KEY
   openssl rand -base64 32
   ```

3. **Use environment-specific values**

   - Development: ngrok URLs
   - Production: Your actual domain

4. **Rotate secrets periodically**
   - Especially after team member changes
   - At least every 90 days

---

## 🐛 Troubleshooting

### Issue: "Invalid APP_ID"

**Solution:**

- Verify `NEXT_PUBLIC_APP_ID` matches Developer Portal
- Ensure it starts with `app_` or `app_staging_`

### Issue: "Action not found"

**Solution:**

- Create the action in Developer Portal
- Update `NEXT_PUBLIC_ACTION` in `.env.local`
- Verify action ID matches exactly

### Issue: "Authentication callback failed"

**Solution:**

- Ensure `AUTH_URL` matches your ngrok URL
- Update ngrok URL in Developer Portal
- Restart the dev server after changing `.env.local`

### Issue: "HMAC verification failed"

**Solution:**

- Regenerate `HMAC_SECRET_KEY`
- Ensure no extra spaces in `.env.local`
- Restart dev server

---

## 📊 Environment Variable Validation

Run this to verify your environment variables are set:

```bash
node -e "console.log('AUTH_SECRET:', !!process.env.AUTH_SECRET); console.log('HMAC_SECRET_KEY:', !!process.env.HMAC_SECRET_KEY); console.log('AUTH_URL:', !!process.env.AUTH_URL); console.log('NEXT_PUBLIC_APP_ID:', !!process.env.NEXT_PUBLIC_APP_ID); console.log('NEXT_PUBLIC_ACTION:', !!process.env.NEXT_PUBLIC_ACTION);"
```

**Expected output:**

```
AUTH_SECRET: true
HMAC_SECRET_KEY: true
AUTH_URL: true
NEXT_PUBLIC_APP_ID: true
NEXT_PUBLIC_ACTION: true
```

---

## 🎯 Quick Reference

| Variable              | Required | Type       | Where Used                  |
| --------------------- | -------- | ---------- | --------------------------- |
| `AUTH_SECRET`         | ✅       | Server     | NextAuth session encryption |
| `HMAC_SECRET_KEY`     | ✅       | Server     | Wallet auth nonce hashing   |
| `AUTH_URL`            | ✅       | Both       | Auth callbacks              |
| `NEXT_PUBLIC_APP_ID`  | ✅       | Client     | World App identification    |
| `NEXT_PUBLIC_ACTION`  | ✅       | Client     | Verification actions        |
| `NEXT_PUBLIC_APP_ENV` | ❌       | Client     | Optional: Environment flag  |
| `WLD_CLIENT_ID`       | ❌       | Deprecated | Use NEXT_PUBLIC_APP_ID      |

---

## ✅ Your Current Status

All required environment variables are configured! ✨

You're ready to:

- ✅ Run the development server
- ✅ Test authentication
- ✅ Play Connect Four
- ✅ Use World ID verification
- ✅ Deploy to production (after updating URLs)

---

## 🚀 Next Steps

1. **Start development:**

   ```bash
   npm run dev
   ```

2. **Open in World App:**

   - Scan QR code or use ngrok URL
   - Test authentication flow
   - Play Connect Four!

3. **For Production:**
   - Update `AUTH_URL` to production domain
   - Regenerate secrets
   - Update Developer Portal with production URLs
   - Deploy!

---

**Last Updated:** October 14, 2025  
**Status:** ✅ All Environment Variables Configured

