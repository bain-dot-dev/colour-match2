# World ID Verification & MiniKit Wallet Authentication - AI Agent Knowledge Base

## 🎯 Overview

This document provides comprehensive technical documentation for AI agents implementing World ID verification and MiniKit wallet authentication systems. The implementation supports dual authentication flows based on the user's environment.

## 🏗️ Architecture Summary

### Dual Authentication System

The system automatically detects the user's environment and provides appropriate authentication:

1. **World App Users (Mini App)**: Primary authentication via MiniKit wallet authentication (SIWE)
2. **Browser Users**: Alternative authentication via World ID Kit with QR code scanning

### Key Components

- **HybridAuthButton**: Main authentication component with environment detection
- **WorldIDVerification**: World ID proof verification for specific actions
- **NextAuth Integration**: Session management with custom credentials provider
- **API Routes**: Backend verification and nonce management

---

## 🔐 MiniKit Wallet Authentication (Primary Flow)

### Purpose

Secure, passwordless authentication for users within World App using Sign-In with Ethereum (SIWE).

### Flow Diagram

```
User clicks "Connect Wallet"
    ↓
Client generates nonce + signed nonce
    ↓
MiniKit.commandsAsync.walletAuth() prompts user
    ↓
User signs SIWE message in World App
    ↓
Client receives signed payload
    ↓
NextAuth verifies signature + creates session
    ↓
User redirected to /home
```

### Implementation Details

#### 1. Client-Side Authentication (`src/auth/wallet/index.ts`)

```typescript
export const walletAuth = async () => {
  // 1. Generate secure nonces
  const { nonce, signedNonce } = await getNewNonces();

  // 2. Request wallet signature via MiniKit
  const result = await MiniKit.commandsAsync.walletAuth({
    nonce,
    expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
    statement: `Authenticate (${crypto.randomUUID().replace(/-/g, "")}).`,
  });

  // 3. Verify and create session via NextAuth
  await signIn("credentials", {
    redirectTo: "/home",
    nonce,
    signedNonce,
    finalPayloadJson: JSON.stringify(result.finalPayload),
  });
};
```

#### 2. Nonce Generation (`src/auth/wallet/server-helpers.ts`)

```typescript
export const getNewNonces = async () => {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const signedNonce = hashNonce({ nonce });
  return { nonce, signedNonce };
};

export const hashNonce = ({ nonce }: { nonce: string }) => {
  const hmac = crypto.createHmac("sha256", process.env.HMAC_SECRET_KEY!);
  hmac.update(nonce);
  return hmac.digest("hex");
};
```

#### 3. NextAuth Verification (`src/auth/index.ts`)

```typescript
authorize: async (credentials) => {
  const { nonce, signedNonce, finalPayloadJson } = credentials;

  // 1. Verify signed nonce matches expected value
  const expectedSignedNonce = hashNonce({ nonce });
  if (signedNonce !== expectedSignedNonce) return null;

  // 2. Parse and verify SIWE message
  const finalPayload = JSON.parse(finalPayloadJson);
  const result = await verifySiweMessage(finalPayload, nonce);

  if (!result.isValid || !result.siweMessageData?.address) return null;

  // 3. Fetch user info and create session
  const userInfo = await getUserByAddressSafe(finalPayload.address);
  return {
    id: finalPayload.address,
    walletAddress: finalPayload.address,
    ...userInfo,
  };
};
```

### Security Features

- **Nonce-based Challenge**: Prevents replay attacks
- **HMAC Verification**: Ensures nonce integrity
- **SIWE Message Verification**: Cryptographic signature validation
- **Time-based Expiration**: 7-day expiration window
- **HTTP-only Cookies**: Secure nonce storage

---

## 🌍 World ID Verification (Secondary Flow)

### Purpose

Proof of humanity verification for specific actions, not for login purposes.

### Flow Diagram

```
User clicks "Verify World ID"
    ↓
MiniKit.commands.verify() sends verification request
    ↓
World App prompts user for biometric verification
    ↓
User completes Orb verification
    ↓
Client receives proof payload
    ↓
Backend verifies proof via verifyCloudProof()
    ↓
Action-specific callback executed
```

### Implementation Details

#### 1. Verification Component (`src/components/WorldIDVerification/index.tsx`)

```typescript
const handleVerification = useCallback(async () => {
  const verifyPayload: VerifyCommandInput = {
    action,
    signal,
    verification_level: MiniKitVerificationLevel.Orb,
  };

  // Send verification command
  MiniKit.commands.verify(verifyPayload);

  // Listen for response
  MiniKit.subscribe(ResponseEvent.MiniAppVerifyAction, async (response) => {
    if (response.status === "success") {
      // Verify with backend
      const verifyResponse = await fetch("/api/verify-proof", {
        method: "POST",
        body: JSON.stringify({
          payload: response,
          action,
          signal,
        }),
      });

      onSuccess?.(await verifyResponse.json());
    } else {
      onError?.(response);
    }
  });
}, [action, signal, onSuccess, onError]);
```

#### 2. Backend Verification (`src/app/api/verify-proof/route.ts`)

```typescript
export async function POST(req: NextRequest) {
  const { payload, action, signal } = await req.json();
  const app_id = process.env.NEXT_PUBLIC_APP_ID;

  const verifyRes = await verifyCloudProof(payload, app_id, action, signal);

  if (verifyRes.success) {
    // Perform backend actions (e.g., mark user as verified)
    return NextResponse.json({ verifyRes, status: 200 });
  } else {
    return NextResponse.json({ verifyRes, status: 400 });
  }
}
```

### Verification Levels

- **Device**: Basic device verification
- **Orb**: High-security biometric verification (recommended)

---

## 🌐 World ID Kit (Browser Authentication)

### Purpose

World ID Kit provides browser-based authentication for users who are not in World App. It uses QR code scanning to enable users to verify their identity using their World App on their mobile device.

### Flow Diagram

```
User clicks "Verify with World ID"
    ↓
IDKitWidget opens QR code modal
    ↓
User scans QR code with World App
    ↓
User completes verification in World App
    ↓
World App sends proof back to browser
    ↓
handleVerify callback processes proof
    ↓
Backend verifies proof via verifyCloudProof()
    ↓
Session created and user redirected
```

### Implementation Details

#### 1. Basic IDKitWidget Setup

```typescript
import {
  IDKitWidget,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/idkit";

<IDKitWidget
  app_id={process.env.NEXT_PUBLIC_APP_ID as `app_${string}`}
  action={process.env.NEXT_PUBLIC_ACTION || "login"}
  onSuccess={onWorldIDSuccess}
  handleVerify={handleWorldIDVerify}
  verification_level={VerificationLevel.Device}
>
  {({ open }) => <Button onClick={open}>Verify with World ID</Button>}
</IDKitWidget>;
```

#### 2. Verification Handler

```typescript
const handleWorldIDVerify = async (proof: ISuccessResult) => {
  console.log("🌍 World ID proof received:", proof);

  try {
    // Verify proof with backend
    const response = await fetch("/api/verify-proof", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: proof,
        action: actionId,
        signal: "",
      }),
    });

    const data = await response.json();
    if (!data?.verifyRes?.success) {
      throw new Error("Unable to validate proof. Please try again.");
    }

    // Create session with World ID credentials
    const result = await signIn("credentials", {
      walletAddress: proof.nullifier_hash || proof.merkle_root || "unknown",
      username: `WorldID_${(
        proof.nullifier_hash ||
        proof.merkle_root ||
        "unknown"
      ).slice(0, 8)}`,
      profilePictureUrl:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=worldid",
      permissions: JSON.stringify({}),
      optedIntoOptionalAnalytics: "false",
      worldAppVersion: "",
      deviceOS: "browser",
      redirect: false,
    });

    if (result?.ok) {
      router.push("/home");
      router.refresh();
    } else {
      throw new Error("Authentication failed");
    }
  } catch (error) {
    console.error("❌ World ID verification error:", error);
    setError(error instanceof Error ? error.message : "Verification failed");
  }
};
```

#### 3. Success Callback

```typescript
const onWorldIDSuccess = () => {
  console.log("✅ World ID verification successful");
  setSuccess(true);
};
```

### Verification Levels

#### Device Level (Default)

- **Use Case**: General authentication, basic verification
- **Security**: Lower security, device-based verification
- **User Experience**: Faster, less intrusive

```typescript
verification_level={VerificationLevel.Device}
```

#### Orb Level (High Security)

- **Use Case**: High-value transactions, sensitive operations
- **Security**: Highest security, biometric verification
- **User Experience**: More steps, requires Orb verification

```typescript
verification_level={VerificationLevel.Orb}
```

### Advanced Configuration

#### Custom Styling

```typescript
<IDKitWidget
  app_id={appId}
  action={actionId}
  onSuccess={onSuccess}
  handleVerify={handleVerify}
  verification_level={VerificationLevel.Device}
  theme="light" // or "dark"
  showReclaim={true} // Show reclaim option
>
  {({ open }) => (
    <Button onClick={open} className="custom-button-class">
      Custom Button Text
    </Button>
  )}
</IDKitWidget>
```

#### Signal Parameter

```typescript
// For action-specific verification
const signal = "user-specific-data-or-hash";

<IDKitWidget
  app_id={appId}
  action={actionId}
  signal={signal}
  onSuccess={onSuccess}
  handleVerify={handleVerify}
>
  {({ open }) => <Button onClick={open}>Verify</Button>}
</IDKitWidget>;
```

### Error Handling

#### Common Error Types

```typescript
const handleWorldIDVerify = async (proof: ISuccessResult) => {
  try {
    const response = await fetch("/api/verify-proof", {
      method: "POST",
      body: JSON.stringify({ payload: proof, action, signal }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      // Handle specific error cases
      if (errorData.verifyRes?.error_code === "already_verified") {
        throw new Error("You have already verified for this action");
      } else if (errorData.verifyRes?.error_code === "invalid_proof") {
        throw new Error("Invalid verification proof. Please try again.");
      } else {
        throw new Error("Verification failed. Please try again.");
      }
    }

    // Process successful verification
    const data = await response.json();
    // ... handle success
  } catch (error) {
    console.error("Verification error:", error);
    setError(error instanceof Error ? error.message : "Verification failed");
  }
};
```

### Environment Detection

```typescript
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";

const { isInstalled } = useMiniKit();

// Show World ID Kit only for browser users
if (isInstalled === false) {
  return (
    <IDKitWidget
      app_id={appId}
      action={actionId}
      onSuccess={onSuccess}
      handleVerify={handleVerify}
      verification_level={VerificationLevel.Device}
    >
      {({ open }) => <Button onClick={open}>Verify with World ID</Button>}
    </IDKitWidget>
  );
}
```

### Security Considerations

#### Server-Side Verification

Always verify proofs on the server side:

```typescript
// src/app/api/verify-proof/route.ts
import { verifyCloudProof } from "@worldcoin/minikit-js";

export async function POST(req: NextRequest) {
  const { payload, action, signal } = await req.json();
  const app_id = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`;

  // Critical: Verify proof on server
  const verifyRes = await verifyCloudProof(payload, app_id, action, signal);

  if (verifyRes.success) {
    // Proof is valid - proceed with business logic
    return NextResponse.json({ verifyRes, status: 200 });
  } else {
    // Proof is invalid - reject
    return NextResponse.json({ verifyRes, status: 400 });
  }
}
```

#### Action Validation

```typescript
// Validate action matches expected value
const expectedAction = process.env.NEXT_PUBLIC_ACTION;
if (action !== expectedAction) {
  throw new Error("Invalid action");
}
```

#### Rate Limiting

```typescript
// Implement rate limiting for verification attempts
const rateLimitKey = `verify:${proof.nullifier_hash}:${action}`;
const attempts = await redis.get(rateLimitKey);

if (attempts && parseInt(attempts) > 5) {
  throw new Error("Too many verification attempts. Please try again later.");
}

await redis.incr(rateLimitKey);
await redis.expire(rateLimitKey, 3600); // 1 hour
```

### Troubleshooting

#### Common Issues

1. **"App ID not found"**

   - Check `NEXT_PUBLIC_APP_ID` environment variable
   - Ensure app is registered in World Developer Portal

2. **"Invalid action"**

   - Verify action is set up in World Developer Portal
   - Check `NEXT_PUBLIC_ACTION` environment variable

3. **"QR code not scanning"**

   - Ensure user has World App installed
   - Check if app is properly configured
   - Verify network connectivity

4. **"Verification always fails"**
   - Check server-side verification logic
   - Verify `verifyCloudProof` implementation
   - Check action and signal parameters

#### Debug Steps

```typescript
// Add comprehensive logging
const handleWorldIDVerify = async (proof: ISuccessResult) => {
  console.log("🔍 Debug - Proof received:", {
    nullifier_hash: proof.nullifier_hash,
    merkle_root: proof.merkle_root,
    proof: proof.proof,
    action: actionId,
    signal: signal,
  });

  try {
    const response = await fetch("/api/verify-proof", {
      method: "POST",
      body: JSON.stringify({ payload: proof, action: actionId, signal }),
    });

    console.log("🔍 Debug - Response status:", response.status);
    const data = await response.json();
    console.log("🔍 Debug - Response data:", data);

    // ... rest of implementation
  } catch (error) {
    console.error("🔍 Debug - Error details:", error);
    // ... error handling
  }
};
```

### Best Practices

1. **Always verify on server**: Never trust client-side verification
2. **Use appropriate verification level**: Device for general auth, Orb for sensitive operations
3. **Implement proper error handling**: Provide clear user feedback
4. **Add rate limiting**: Prevent abuse of verification system
5. **Log verification attempts**: For security monitoring
6. **Validate all inputs**: Check action, signal, and proof parameters
7. **Handle edge cases**: Network failures, user cancellations, etc.

---

## 🔍 World ID Kit vs MiniKit Comparison

### Key Differences

| Aspect                  | World ID Kit (Browser)          | MiniKit (World App)                 |
| ----------------------- | ------------------------------- | ----------------------------------- |
| **Environment**         | Browser/Web                     | World App only                      |
| **User Flow**           | QR code scanning                | Native app integration              |
| **Authentication**      | World ID verification only      | Wallet auth + optional World ID     |
| **Verification Levels** | Device, Orb                     | Device, Orb                         |
| **Setup Complexity**    | Medium                          | Low (when in World App)             |
| **User Experience**     | Requires mobile device          | Seamless native experience          |
| **Security**            | High (server-side verification) | High (native + server verification) |
| **Use Cases**           | Browser users, web apps         | Mini apps, native experiences       |

### When to Use Each

#### Use World ID Kit When:

- Building web applications for browser users
- Users don't have World App installed
- You need QR code-based verification
- Building a traditional web app with World ID integration

#### Use MiniKit When:

- Building Mini Apps for World App
- Users are already in World App environment
- You want seamless native experience
- You need both wallet authentication and World ID verification

### Implementation Patterns

#### Hybrid Approach (Recommended)

```typescript
const { isInstalled } = useMiniKit();

if (isInstalled === true) {
  // World App - Use MiniKit
  return <MiniKitWalletAuth />;
} else if (isInstalled === false) {
  // Browser - Use World ID Kit
  return <WorldIDKitWidget />;
} else {
  // Loading - Show loading state
  return <LoadingSpinner />;
}
```

#### Separate Components

```typescript
// For World App users
<WorldIDVerification
  action={actionId}
  onSuccess={handleSuccess}
  onError={handleError}
/>

// For browser users
<IDKitWidget
  app_id={appId}
  action={actionId}
  onSuccess={handleSuccess}
  handleVerify={handleVerify}
>
  {({ open }) => <Button onClick={open}>Verify</Button>}
</IDKitWidget>
```

### Migration Strategies

#### From World ID Kit to Hybrid

1. Add MiniKit detection
2. Implement MiniKit wallet authentication
3. Create environment-specific components
4. Update routing and session handling

#### From MiniKit to Hybrid

1. Add World ID Kit for browser fallback
2. Implement QR code verification flow
3. Add environment detection
4. Update error handling for both flows

---

## 🔄 Hybrid Authentication System

### Environment Detection

The system automatically detects whether the user is in World App or a browser:

```typescript
const { isInstalled } = useMiniKit();

if (isInstalled === true) {
  // World App - Show wallet authentication
  return <WalletAuthButton />;
} else if (isInstalled === false) {
  // Browser - Show World ID verification
  return <IDKitWidget />;
} else {
  // Loading - Show loading state
  return <LoadingButton />;
}
```

### HybridAuthButton Component

The main authentication component that handles both flows:

```typescript
export const HybridAuthButton = () => {
  const { isInstalled } = useMiniKit();

  // World App: Wallet Authentication
  const handleWalletAuth = async () => {
    await walletAuth(); // Handles complete flow
  };

  // Browser: World ID Verification
  const handleWorldIDVerify = async (proof: ISuccessResult) => {
    // Verify proof with backend
    const response = await fetch("/api/verify-proof", {
      method: "POST",
      body: JSON.stringify({ payload: proof, action, signal }),
    });

    // Create session
    await signIn("credentials", {
      walletAddress: proof.nullifier_hash,
      username: `WorldID_${proof.nullifier_hash.slice(0, 8)}`,
      // ... other credentials
    });
  };

  // Render appropriate UI based on environment
};
```

---

## 📊 Data Models & Types

### User Session Data

```typescript
interface User {
  id: string;
  walletAddress: string;
  username: string;
  profilePictureUrl: string;
  permissions?: {
    notifications: boolean;
    contacts: boolean;
  };
  optedIntoOptionalAnalytics?: boolean;
  worldAppVersion?: number;
  deviceOS?: string;
}
```

### Verification Types

```typescript
interface VerificationSuccessResponse {
  verifyRes: {
    success: boolean;
    status: number;
    [key: string]: unknown;
  };
  status: number;
}

interface VerificationErrorResponse {
  error_code?: string;
  message?: string;
  status?: string;
  [key: string]: unknown;
}
```

---

## 🛠️ API Endpoints

### Authentication Endpoints

1. **`GET /api/nonce`**

   - Generates secure nonce for wallet authentication
   - Stores nonce in HTTP-only cookie
   - 5-minute expiration

2. **`POST /api/complete-siwe`**

   - Verifies SIWE signature from World App
   - Validates nonce match
   - Returns user data for session creation

3. **`POST /api/verify-proof`**
   - Verifies World ID proof on server-side
   - Uses `verifyCloudProof()` for validation
   - Returns verification result

### NextAuth Endpoints

- **`/api/auth/signin`**: Authentication entry point
- **`/api/auth/signout`**: Session termination
- **`/api/auth/session`**: Current session data

---

## 🔧 Environment Variables

### Required Variables

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# World ID Configuration
NEXT_PUBLIC_APP_ID=app_your_app_id
NEXT_PUBLIC_ACTION=your_action_id

# Security
HMAC_SECRET_KEY=your-hmac-secret
```

### Optional Variables

```env
# For production
NEXTAUTH_URL=https://yourdomain.com
```

---

## 🚀 Implementation Guide for AI Agents

### 1. Setting Up Authentication

```typescript
// 1. Install dependencies
npm install @worldcoin/minikit-js @worldcoin/idkit @worldcoin/minikit-react next-auth

// 2. Configure environment variables
// Add to .env.local

// 3. Set up NextAuth configuration
// Create src/auth/index.ts with credentials provider

// 4. Create authentication components
// Implement HybridAuthButton and WorldIDVerification
```

#### Required Dependencies

```json
{
  "dependencies": {
    "@worldcoin/idkit": "^2.4.2",
    "@worldcoin/minikit-js": "latest",
    "@worldcoin/minikit-react": "latest",
    "@worldcoin/mini-apps-ui-kit-react": "^1.0.2",
    "next-auth": "^5.0.0-beta.25"
  }
}
```

#### Environment Variables Setup

```env
# Required for both World ID Kit and MiniKit
NEXT_PUBLIC_APP_ID=app_your_app_id
NEXT_PUBLIC_ACTION=your_action_id

# Required for NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Required for MiniKit wallet authentication
HMAC_SECRET_KEY=your-hmac-secret
```

### 2. Using Wallet Authentication

```typescript
import { walletAuth } from "@/auth/wallet";

const handleLogin = async () => {
  try {
    await walletAuth();
    // User is now authenticated
  } catch (error) {
    console.error("Authentication failed:", error);
  }
};
```

### 3. Using World ID Kit (Browser)

```typescript
import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit";

<IDKitWidget
  app_id={process.env.NEXT_PUBLIC_APP_ID as `app_${string}`}
  action="your-action-id"
  onSuccess={() => console.log("Verification successful")}
  handleVerify={async (proof) => {
    // Verify with backend and create session
    const response = await fetch("/api/verify-proof", {
      method: "POST",
      body: JSON.stringify({ payload: proof, action: "your-action-id" }),
    });
    // Handle response...
  }}
  verification_level={VerificationLevel.Device}
>
  {({ open }) => <Button onClick={open}>Verify with World ID</Button>}
</IDKitWidget>;
```

### 4. Using MiniKit Verification (World App)

```typescript
import { WorldIDVerification } from "@/components/WorldIDVerification";

<WorldIDVerification
  action="your-action-id"
  signal="optional-signal"
  onSuccess={(response) => {
    console.log("Verification successful:", response);
  }}
  onError={(error) => {
    console.error("Verification failed:", error);
  }}
  buttonText="Verify Identity"
/>;
```

### 5. Environment Detection

```typescript
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";

const { isInstalled } = useMiniKit();

if (isInstalled === true) {
  // World App environment
} else if (isInstalled === false) {
  // Browser environment
} else {
  // Loading state
}
```

---

## 🔒 Security Considerations

### Wallet Authentication Security

1. **Nonce Validation**: Always verify nonce matches expected value
2. **SIWE Verification**: Use `verifySiweMessage()` for signature validation
3. **Time Windows**: Implement appropriate expiration times
4. **HMAC Secrets**: Use strong, unique HMAC secret keys
5. **HTTP-only Cookies**: Store sensitive data in HTTP-only cookies

### World ID Verification Security

1. **Server-side Verification**: Always verify proofs on the server
2. **Action Validation**: Ensure actions match expected values
3. **Signal Validation**: Validate signals if used
4. **Rate Limiting**: Implement rate limiting for verification attempts
5. **Error Handling**: Don't expose sensitive error information

### General Security

1. **Environment Variables**: Never expose secrets in client-side code
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure CORS appropriately
4. **Session Management**: Use secure session configuration
5. **Input Validation**: Validate all inputs on both client and server

---

## 🐛 Troubleshooting

### Common Issues

1. **"MiniKit not installed"**

   - Ensure user is in World App
   - Check MiniKit provider setup

2. **"Invalid nonce"**

   - Check HMAC secret key configuration
   - Verify nonce generation logic

3. **"SIWE verification failed"**

   - Check signature format
   - Verify message structure

4. **"World ID verification failed"**
   - Check app ID configuration
   - Verify action setup in World Developer Portal

### Debug Steps

1. Check browser console for error messages
2. Verify environment variables are set correctly
3. Test in both World App and browser environments
4. Check network requests in browser dev tools
5. Verify backend API responses

---

## 📚 Additional Resources

- [World ID Documentation](https://docs.world.org/)
- [MiniKit Documentation](https://docs.world.org/mini-apps/)
- [NextAuth Documentation](https://next-auth.js.org/)
- [SIWE Specification](https://eips.ethereum.org/EIPS/eip-4361)

---

## 🔄 Migration Notes

### From Browser-only to Hybrid

1. Add MiniKit detection
2. Implement wallet authentication flow
3. Update UI to show appropriate method
4. Test in both environments

### From Wallet-only to Hybrid

1. Add World ID Kit integration
2. Implement QR code verification
3. Add environment detection
4. Update error handling

---

This knowledge base provides comprehensive information for AI agents to understand, implement, and troubleshoot World ID verification and MiniKit wallet authentication systems. The documentation covers both technical implementation details and practical usage patterns.
