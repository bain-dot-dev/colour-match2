# Hybrid Auth Button - Quick Start

## 🚀 One Line Implementation

```tsx
import { HybridAuthButton } from "@/components/HybridAuthButton";

export default function LoginPage() {
  return <HybridAuthButton />;
}
```

## ✨ What You Get

### Automatic Detection

- ✅ Detects World App vs Browser automatically
- ✅ Shows appropriate auth method
- ✅ No configuration needed

### World App Users

```
🌍 World App Detected
Connect Your Wallet
[Connect Wallet Button]
🔐 Wallet Authentication: Secure, passwordless login
```

### Browser Users

```
🌐 Browser Mode
Verify with World ID
[Verify with World ID Button]
💡 Tip: Open in World App for wallet authentication
```

## 📦 Features

| Feature                 | Included |
| ----------------------- | -------- |
| Environment Detection   | ✅       |
| Wallet Auth (World App) | ✅       |
| World ID (Browser)      | ✅       |
| Loading States          | ✅       |
| Error Handling          | ✅       |
| Success Feedback        | ✅       |
| Auto Redirect           | ✅       |
| Responsive Design       | ✅       |

## 🎨 Usage Examples

### Landing Page

```tsx
export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Welcome to MyApp
        </h1>
        <HybridAuthButton />
      </div>
    </main>
  );
}
```

### With Header

```tsx
export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Sign In</h1>
        <p className="text-gray-600">Choose your authentication method</p>
      </div>
      <div className="flex justify-center">
        <HybridAuthButton />
      </div>
    </div>
  );
}
```

### In a Card

```tsx
export default function AuthPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Get Started</h2>
        <HybridAuthButton />
        <p className="text-center text-sm text-gray-500 mt-6">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
```

## 🔄 Authentication Flow

### World App (Wallet Auth)

```
User clicks "Connect Wallet"
    ↓
MiniKit shows signature request
    ↓
User signs message
    ↓
SIWE verified on server
    ↓
Session created
    ↓
Redirect to /home ✅
```

### Browser (World ID)

```
User clicks "Verify with World ID"
    ↓
QR code modal appears
    ↓
User scans with World App
    ↓
Completes verification
    ↓
Proof verified on server
    ↓
Session created
    ↓
Redirect to /home ✅
```

## 🎯 Component Behavior

### Loading State

Shows while detecting environment:

```
🔄 Detecting Environment...
Please wait
[Loading... Button (disabled)]
```

### World App State

```tsx
isInstalled === true
→ Shows Wallet Authentication
→ Green indicator badge
→ "Connect Wallet" button
```

### Browser State

```tsx
isInstalled === false
→ Shows World ID Verification
→ Blue indicator badge
→ "Verify with World ID" button
```

## 🔧 Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_APP_ID=app_xxx
NEXT_PUBLIC_ACTION=xxx
```

## 🎨 Styling

The component uses Tailwind CSS and is fully responsive. The width is constrained to `max-w-md` but you can wrap it in your own container:

```tsx
<div className="max-w-xl mx-auto">
  {" "}
  {/* Custom width */}
  <HybridAuthButton />
</div>
```

## 🔒 Security

Both authentication methods are secure:

**Wallet Auth:**

- SIWE (Sign-In with Ethereum) standard
- Server-side signature verification
- Nonce-based replay protection

**World ID:**

- Zero-knowledge proofs
- Sybil resistance
- Server-side proof verification

## 📱 Responsive Design

The component is fully responsive:

- Mobile: Full width with padding
- Tablet: Centered with max-width
- Desktop: Centered with max-width

## 🧪 Testing

**In World App:**

1. Open app in World App
2. Should see "🌍 World App Detected"
3. Click "Connect Wallet"
4. Sign message
5. Should redirect to /home

**In Browser:**

1. Open app in Chrome/Safari
2. Should see "🌐 Browser Mode"
3. Click "Verify with World ID"
4. Scan QR code
5. Should redirect to /home

## 💡 Tips

1. **Environment Detection is Instant** - Uses `useMiniKit()` hook
2. **No Props Needed** - Component is self-contained
3. **Error Handling Built-in** - Shows user-friendly error messages
4. **Auto-Redirect** - Sends to `/home` after successful auth
5. **Loading States** - Shows appropriate feedback during auth

## 🆚 vs Original AuthButton

|                       | HybridAuthButton    | AuthButton            |
| --------------------- | ------------------- | --------------------- |
| **Usage**             | One import          | One import            |
| **Code**              | ~240 lines          | ~315 lines            |
| **Visual Indicators** | Enhanced badges     | Basic text            |
| **Auth Method**       | Uses `walletAuth()` | Manual implementation |
| **Simplicity**        | Higher              | Medium                |

## ✅ Summary

**Simple:**

```tsx
<HybridAuthButton />
```

**Smart:**

- Auto-detects environment
- Shows correct auth method
- Handles everything

**Secure:**

- SIWE for wallet auth
- ZK proofs for World ID
- Server-side verification

**Beautiful:**

- Clear indicators
- Loading states
- Error feedback

**Ready to use! 🚀**
