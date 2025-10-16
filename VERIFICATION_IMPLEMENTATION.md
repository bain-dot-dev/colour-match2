# World ID Verification Implementation

This project implements a dual verification system using World ID Kit for browsers and MiniKit for World App users, based on the MCP (Model Context Protocol) documentation.

## Overview

The authentication system automatically detects the environment and provides the appropriate method:

- **World App Users**: Uses MiniKit wallet authentication (primary) with optional World ID verification
- **Browser Users**: Uses World ID Kit with QR code scanning for verification

## Implementation Details

### 1. MiniKit Integration (World App)

For users inside World App, the system uses MiniKit's wallet authentication as the primary flow:

```typescript
// Primary: Wallet Authentication
const handleMiniKitWalletAuth = async () => {
  try {
    await walletAuth(); // Uses MiniKit.commandsAsync.walletAuth()
    console.log("Wallet authentication completed successfully");
  } catch (error) {
    console.error("Wallet authentication error:", error);
  }
};

// Optional: World ID Verification for specific actions
const handleMiniKitVerification = async () => {
  const verifyPayload: VerifyCommandInput = {
    action: process.env.NEXT_PUBLIC_ACTION || "verify-action",
    signal: undefined,
    verification_level: MiniKitVerificationLevel.Orb,
  };

  MiniKit.commands.verify(verifyPayload);

  MiniKit.subscribe(ResponseEvent.MiniAppVerifyAction, async (response) => {
    if (response.status === "success") {
      // Send to backend for verification
      await fetch("/api/verify-proof", {
        method: "POST",
        body: JSON.stringify({ payload: response, action, signal }),
      });
    }
  });
};
```

### 2. World ID Kit Integration (Browser)

For browser users, the system uses World ID Kit with QR code scanning:

```typescript
<IDKitWidget
  app_id={process.env.NEXT_PUBLIC_APP_ID}
  action={process.env.NEXT_PUBLIC_ACTION || "login"}
  onSuccess={onWorldIDSuccess}
  handleVerify={handleWorldIDVerify}
  verification_level={VerificationLevel.Device}
>
  {({ open }) => <Button onClick={open}>Verify with World ID</Button>}
</IDKitWidget>
```

### 3. Environment Detection

The system automatically detects whether it's running in World App or a browser:

```typescript
const { isInstalled } = useMiniKit();

// isInstalled === true: Inside World App (use MiniKit)
// isInstalled === false: In browser (use World ID Kit)
// isInstalled === undefined: Still checking
```

## Key Features

### ✅ Dual Verification Paths

- **World App**: Native MiniKit verification + wallet authentication
- **Browser**: QR code scanning with World ID Kit

### ✅ MCP-Compliant Implementation

- Uses proper MiniKit commands as per MCP documentation
- Implements correct ResponseEvent handling
- Follows security best practices

### ✅ Enhanced User Experience

- Real-time status feedback
- Clear error handling
- Automatic environment detection
- Seamless flow between verification and authentication

### ✅ Security Considerations

- Server-side proof verification
- Proper nonce handling for wallet authentication
- Client-side validation with backend verification

## File Structure

```
src/
├── components/
│   ├── AuthButton/
│   │   └── index.tsx          # Main verification component
│   └── VerificationDemo/
│       └── index.tsx          # Demo component
├── auth/
│   ├── index.ts               # NextAuth configuration
│   └── wallet/
│       ├── index.ts           # Wallet authentication
│       ├── client-helpers.ts  # Client-side helpers
│       └── server-helpers.ts  # Server-side helpers
└── app/
    ├── api/
    │   └── verify-proof/
    │       └── route.ts       # Proof verification endpoint
    └── page.tsx               # Main page
```

## Environment Variables Required

```env
NEXT_PUBLIC_APP_ID=app_your_app_id
NEXT_PUBLIC_ACTION=your_action_id
NEXTAUTH_SECRET=your_nextauth_secret
```

## Usage

1. **In World App**: Users see a single button that handles both verification and wallet connection
2. **In Browser**: Users see a QR code they can scan with World App
3. **After Verification**: Users are redirected to the protected area

## Testing

- **World App**: Open the app in World App to test MiniKit integration
- **Browser**: Open in any browser to test World ID Kit QR code flow
- **Development**: Use the VerificationDemo component to see both flows

## Security Notes

- All verification happens server-side
- Client-side data is never trusted
- Proper nonce validation for wallet authentication
- Error handling for all failure scenarios

This implementation provides a robust, user-friendly verification system that works seamlessly across both World App and browser environments while following MCP best practices.
