# Hybrid Authentication Button

A smart authentication component that automatically detects the user's environment and provides the appropriate authentication method.

## 🎯 Features

- **Automatic Detection**: Uses `useMiniKit()` to detect World App vs Browser
- **Wallet Auth in World App**: Secure SIWE-based authentication for mini app users
- **World ID in Browser**: QR code verification for web users
- **Single Component**: One import, works everywhere
- **Beautiful UI**: Clear visual indicators for each mode
- **Error Handling**: Comprehensive error states and user feedback

## 🚀 Quick Start

### Basic Usage

```tsx
import { HybridAuthButton } from "@/components/HybridAuthButton";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <HybridAuthButton />
    </div>
  );
}
```

That's it! The button handles everything automatically.

## 🎨 How It Works

### Environment Detection

```
┌─────────────────────────────────────┐
│  Is MiniKit Installed?              │
│  (useMiniKit().isInstalled)         │
└──────────┬──────────────────────────┘
           │
     ┌─────┴─────┐
     │           │
   true        false
     │           │
     ▼           ▼
┌─────────┐  ┌──────────────┐
│ World   │  │   Browser    │
│  App    │  │              │
│         │  │              │
│ Wallet  │  │  World ID    │
│  Auth   │  │  QR Code     │
└─────────┘  └──────────────┘
```

### Authentication Flows

#### World App Users (Wallet Auth)

```
1. User clicks "Connect Wallet"
2. MiniKit shows wallet signature dialog
3. User signs message
4. SIWE verified in NextAuth
5. Session created
6. Redirect to /home
```

#### Browser Users (World ID)

```
1. User clicks "Verify with World ID"
2. QR code modal appears
3. User scans with World App
4. Completes verification in app
5. Proof verified on server
6. Session created
7. Redirect to /home
```

## 🎨 UI States

The component displays different UIs based on the environment:

### World App Mode

```
┌────────────────────────────────────┐
│   🌍 World App Detected            │
│                                    │
│   Connect Your Wallet              │
│   Sign in with your World App...   │
│                                    │
│  ┌──────────────────────────────┐ │
│  │    Connect Wallet            │ │
│  └──────────────────────────────┘ │
│                                    │
│  🔐 Wallet Authentication: Secure, │
│  passwordless login using SIWE     │
└────────────────────────────────────┘
```

### Browser Mode

```
┌────────────────────────────────────┐
│   🌐 Browser Mode                  │
│                                    │
│   Verify with World ID             │
│   Scan the QR code with World...   │
│                                    │
│  ┌──────────────────────────────┐ │
│  │    Verify with World ID      │ │
│  └──────────────────────────────┘ │
│                                    │
│  💡 Tip: For the best experience,  │
│  open this app directly in World   │
│  App for wallet authentication     │
└────────────────────────────────────┘
```

## 📦 What's Included

The component handles:

✅ Environment detection via `useMiniKit()`  
✅ Wallet auth for World App users (via `walletAuth()`)  
✅ World ID verification for browser users  
✅ Loading states during authentication  
✅ Error handling and display  
✅ Success feedback  
✅ Automatic redirect after auth  
✅ Responsive design  
✅ Accessibility features

## 🔧 Customization

### Custom Styles

```tsx
import { HybridAuthButton } from "@/components/HybridAuthButton";

export default function CustomLogin() {
  return (
    <div className="my-custom-container">
      <h1 className="text-3xl mb-4">Welcome!</h1>
      <HybridAuthButton />
    </div>
  );
}
```

### With Additional Content

```tsx
export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-gray-600">Choose your authentication method</p>
      </div>

      <HybridAuthButton />

      <div className="text-center text-sm text-gray-500">
        <p>By signing in, you agree to our Terms of Service</p>
      </div>
    </div>
  );
}
```

## 🎯 Use Cases

### 1. Login Page

```tsx
// app/login/page.tsx
import { HybridAuthButton } from "@/components/HybridAuthButton";

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <HybridAuthButton />
      </div>
    </main>
  );
}
```

### 2. Landing Page

```tsx
// app/page.tsx
import { HybridAuthButton } from "@/components/HybridAuthButton";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Welcome to Our App</h1>
        <p className="text-xl text-gray-600 mb-8">
          Get started with secure authentication
        </p>
      </div>

      <div className="flex justify-center">
        <HybridAuthButton />
      </div>
    </div>
  );
}
```

### 3. Modal Authentication

```tsx
import { HybridAuthButton } from "@/components/HybridAuthButton";
import { Dialog } from "@/components/ui/dialog";

export function AuthModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="p-6">
        <HybridAuthButton />
      </div>
    </Dialog>
  );
}
```

## 🔍 Technical Details

### Props

The component doesn't require any props - it's fully self-contained.

### Dependencies

- `@worldcoin/minikit-js` - MiniKit for wallet auth
- `@worldcoin/idkit` - World ID verification
- `@worldcoin/mini-apps-ui-kit-react` - UI components
- `next-auth/react` - Session management
- `next/navigation` - Router for redirects

### Environment Variables Required

```env
NEXT_PUBLIC_APP_ID=app_xxx    # Your World App ID
NEXT_PUBLIC_ACTION=xxx         # World ID action ID
```

## 🧪 Testing

### Test in World App

1. Open your mini app in World App
2. Should show "🌍 World App Detected"
3. Click "Connect Wallet"
4. Sign the message
5. Should redirect to /home

### Test in Browser

1. Open your app in Chrome/Safari/etc.
2. Should show "🌐 Browser Mode"
3. Click "Verify with World ID"
4. Scan QR code with World App
5. Complete verification
6. Should redirect to /home

## 🔒 Security

The hybrid button uses secure authentication for both modes:

**Wallet Auth (World App):**

- SIWE message signing
- Nonce verification
- Server-side SIWE validation
- Cannot be bypassed

**World ID (Browser):**

- Zero-knowledge proofs
- Server-side proof verification
- Prevents replay attacks
- Sybil resistance

## 📊 Comparison with Original AuthButton

| Feature               | HybridAuthButton | Original AuthButton      |
| --------------------- | ---------------- | ------------------------ |
| Lines of Code         | ~240             | ~315                     |
| Environment Detection | ✅ Automatic     | ✅ Automatic             |
| Wallet Auth           | ✅ Via helper    | ✅ Manual implementation |
| World ID              | ✅ Included      | ✅ Included              |
| Visual Indicators     | ✅ Enhanced      | ✅ Basic                 |
| Error Handling        | ✅ Comprehensive | ✅ Comprehensive         |
| Import Complexity     | Simple           | Medium                   |

## 🎓 Advanced Usage

### Custom Redirect After Auth

To customize the redirect, you'll need to modify the component or create a wrapper:

```tsx
// Create a custom version
import { HybridAuthButton } from "@/components/HybridAuthButton";

// Modify the router.push('/home') lines in the component
// to router.push('/dashboard') or your desired route
```

### Handling Auth Errors

The component already handles errors, but you can listen to them:

```tsx
// The component shows errors via LiveFeedback
// Check the browser console for detailed error logs
```

## 📚 Related Documentation

- [Wallet Authentication Guide](./WALLET_AUTH_NEW_USAGE.md)
- [Migration Summary](./WALLET_AUTH_MIGRATION.md)
- [Before/After Comparison](./WALLET_AUTH_BEFORE_AFTER.md)

## ✅ Summary

**Simple to use:**

```tsx
<HybridAuthButton />
```

**Smart detection:**

- Automatically detects World App vs Browser
- Shows appropriate auth method
- No configuration needed

**Secure by default:**

- SIWE verification for wallet auth
- Zero-knowledge proofs for World ID
- Server-side validation
- Cannot bypass security

**Beautiful UI:**

- Clear environment indicators
- Loading states
- Error messages
- Success feedback

**Ready to use! 🚀**
