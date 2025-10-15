# World ID Action Setup Guide

## 🎯 Overview

This guide explains how to set up and use World ID Actions (formerly "Incognito Actions") for your Connect Four Mini App. Actions are used to verify users and prevent double-spending or duplicate verifications.

---

## 📋 What is a World ID Action?

**Actions** allow you to:

- Verify users uniquely for specific operations
- Prevent users from performing the same action multiple times
- Track verification counts per action
- Separate different verification use cases in your app

### Examples of Actions:

- `vote-poll-123` - User can only vote once on poll 123
- `claim-reward` - User can only claim reward once
- `verifyaction` - General verification action (current setup)
- `play-game` - User verification before playing

---

## ✅ Current Setup

Your app is configured with:

```env
NEXT_PUBLIC_ACTION='verifyaction'
```

This action is now used in:

- ✅ `src/components/Verify/index.tsx` - Verification component
- ✅ `src/app/api/verify-proof/route.ts` - Server-side verification

---

## 🛠️ How to Set Up an Action in World Developer Portal

### Step 1: Access the Developer Portal

1. Go to [developer.worldcoin.org](https://developer.worldcoin.org)
2. Sign in with your World ID
3. Select your Mini App (or create a new one)

### Step 2: Create an Action

1. Navigate to **Actions** in the sidebar
2. Click **"Create Action"** or **"Add Action"**
3. Fill in the details:

   **Action ID:**

   ```
   verifyaction
   ```

   _(Must match your `NEXT_PUBLIC_ACTION` in `.env.local`)_

   **Name:** (Display name)

   ```
   Connect Four Verification
   ```

   **Description:**

   ```
   Verify users before playing Connect Four game
   ```

   **Action Type:**

   - Choose **"Incognito Action"** for most use cases
   - This prevents tracking users across different actions

   **Max Verifications:**

   - Set to **1** if users can only verify once
   - Set to **unlimited** for multiple verifications
   - Or set a specific number (e.g., 10)

4. Click **"Create Action"** or **"Save"**

### Step 3: Get Your Action ID

After creating the action, you'll see:

```
Action ID: verifyaction
Status: Active ✅
```

Make sure this matches your `.env.local`:

```env
NEXT_PUBLIC_ACTION='verifyaction'
```

---

## 🎮 Using Actions in Your Connect Four Game

### Current Implementation

The action is used in the **Verify** component on the Home page:

```typescript
// src/components/Verify/index.tsx
const action = process.env.NEXT_PUBLIC_ACTION || "verifyaction";

const result = await MiniKit.commandsAsync.verify({
  action: action,
  verification_level: verificationLevel,
});
```

### Potential Use Cases for Connect Four

You can create multiple actions for different features:

#### 1. **Game Start Verification**

```typescript
// Action: 'start-game'
// Purpose: Verify user before starting a game
// Max Verifications: Unlimited
```

#### 2. **Tournament Entry**

```typescript
// Action: 'join-tournament'
// Purpose: Verify user before joining tournament
// Max Verifications: 1 per tournament
```

#### 3. **Claim Prize**

```typescript
// Action: 'claim-prize-tournament-123'
// Purpose: User can only claim prize once
// Max Verifications: 1
```

#### 4. **Daily Challenge**

```typescript
// Action: 'daily-challenge-2025-10-15'
// Purpose: User can complete daily challenge once
// Max Verifications: 1
```

---

## 🔧 Adding Multiple Actions

If you want to use different actions for different features:

### 1. Add Actions to Environment Variables

```env
# .env.local
NEXT_PUBLIC_ACTION_VERIFY='verifyaction'
NEXT_PUBLIC_ACTION_GAME_START='start-game'
NEXT_PUBLIC_ACTION_TOURNAMENT='join-tournament'
```

### 2. Create Action Configuration

```typescript
// src/config/actions.ts
export const WORLD_ACTIONS = {
  VERIFY: process.env.NEXT_PUBLIC_ACTION_VERIFY || "verifyaction",
  GAME_START: process.env.NEXT_PUBLIC_ACTION_GAME_START || "start-game",
  TOURNAMENT: process.env.NEXT_PUBLIC_ACTION_TOURNAMENT || "join-tournament",
} as const;
```

### 3. Use in Components

```typescript
import { WORLD_ACTIONS } from "@/config/actions";

// Before starting game
const result = await MiniKit.commandsAsync.verify({
  action: WORLD_ACTIONS.GAME_START,
  verification_level: VerificationLevel.Device,
});
```

---

## 🧪 Testing Your Action

### 1. **Start Development Server**

```bash
npm run dev
```

### 2. **Test in World App**

1. Open your app in World App (via ngrok URL)
2. Navigate to the **Home** tab
3. Click **"Verify (Device)"** or **"Verify (Orb)"**
4. Complete the verification flow

### 3. **Check Browser Console**

You should see:

```javascript
{
  status: "success",
  verification_level: "device", // or "orb"
  nullifier_hash: "...",
  merkle_root: "...",
  proof: "...",
  // ... other fields
}
```

### 4. **Verify Server-Side**

The `/api/verify-proof` route will validate the proof and return:

```json
{
  "verifyRes": {
    "success": true,
    "action": "verifyaction",
    "nullifier_hash": "...",
    "verification_level": "device"
  },
  "status": 200
}
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Action not found"

**Error:**

```
Action 'verifyaction' not found or not active
```

**Solution:**

1. Create the action in Developer Portal
2. Ensure action ID matches exactly (case-sensitive)
3. Verify action status is **Active**

### Issue 2: "Max verifications exceeded"

**Error:**

```
User has already verified for this action
```

**Solution:**

1. Increase max verifications in Developer Portal
2. Or create a new action with a different ID
3. For testing, you can delete and recreate the action

### Issue 3: "Invalid proof"

**Error:**

```
Proof verification failed
```

**Solution:**

1. Ensure `NEXT_PUBLIC_APP_ID` matches Developer Portal
2. Check action ID is correct in both frontend and backend
3. Verify network connection (ngrok tunnel is active)
4. Check server logs for detailed error message

### Issue 4: Environment variable not loading

**Error:**

```
Using fallback action 'verifyaction'
```

**Solution:**

1. Restart development server after changing `.env.local`
2. Ensure variable starts with `NEXT_PUBLIC_` for client-side access
3. Check for typos in variable name

---

## 📚 Action Best Practices

### 1. **Naming Convention**

Use descriptive, kebab-case names:

```
✅ Good:
- user-verification
- daily-challenge-2025-10-15
- tournament-123-entry
- claim-reward-abc

❌ Bad:
- test
- action1
- verify
- a
```

### 2. **Action Lifecycle**

- **Development:** Use `test-` prefix (e.g., `test-verify`)
- **Staging:** Use `staging-` prefix (e.g., `staging-verify`)
- **Production:** Use clean names (e.g., `verify-user`)

### 3. **Max Verifications Strategy**

| Use Case              | Max Verifications | Example            |
| --------------------- | ----------------- | ------------------ |
| One-time verification | 1                 | Account setup      |
| Daily actions         | 1 per day         | Daily rewards      |
| Game plays            | Unlimited         | Connect Four games |
| Tournament entry      | 1 per tournament  | Competition entry  |
| Voting                | 1 per poll        | Community votes    |

### 4. **Action Organization**

Group related actions:

```
game:start
game:complete
game:claim-reward

tournament:join
tournament:play
tournament:claim-prize

profile:verify
profile:update
profile:delete
```

---

## 🔐 Security Considerations

### 1. **Always Verify Server-Side**

❌ **Bad:** Only check on frontend

```typescript
if (result.finalPayload.status === "success") {
  // Give user rewards - INSECURE!
}
```

✅ **Good:** Verify on backend

```typescript
const response = await fetch("/api/verify-proof", {
  method: "POST",
  body: JSON.stringify({
    payload: result.finalPayload,
    action: action,
  }),
});

const data = await response.json();
if (data.verifyRes.success) {
  // Give user rewards - SECURE!
}
```

### 2. **Store Nullifier Hashes**

Store the `nullifier_hash` to prevent replay attacks:

```typescript
// Example database schema
interface Verification {
  nullifier_hash: string;
  action: string;
  timestamp: Date;
  user_id: string;
}

// Check before granting access
const existingVerification = await db.verifications.findOne({
  nullifier_hash: result.nullifier_hash,
  action: "verifyaction",
});

if (existingVerification) {
  throw new Error("Already verified");
}
```

### 3. **Use Appropriate Verification Levels**

- **Device:** Fast, lower security (mobile device verification)
- **Orb:** Slower, highest security (in-person biometric verification)

Choose based on your use case:

```typescript
// Low-stakes action (playing a game)
verification_level: VerificationLevel.Device;

// High-stakes action (claiming money)
verification_level: VerificationLevel.Orb;
```

---

## 📊 Monitoring Actions

### Developer Portal Metrics

In the Developer Portal, you can see:

- **Total Verifications:** How many times the action has been used
- **Unique Users:** How many unique users have verified
- **Success Rate:** Percentage of successful verifications
- **Recent Activity:** Latest verification attempts

### Custom Monitoring

Implement your own tracking:

```typescript
// src/lib/analytics.ts
export async function trackVerification(
  action: string,
  success: boolean,
  verificationLevel: string
) {
  await fetch("/api/analytics/verification", {
    method: "POST",
    body: JSON.stringify({
      action,
      success,
      verificationLevel,
      timestamp: new Date(),
    }),
  });
}
```

---

## 🎯 Next Steps

1. ✅ Action is configured in `.env.local`
2. ✅ Component updated to use environment variable
3. ⬜ Create action in Developer Portal (if not already done)
4. ⬜ Test verification flow
5. ⬜ (Optional) Add custom actions for game features
6. ⬜ (Optional) Implement server-side nullifier hash storage

---

## 📖 Additional Resources

- **World ID Documentation:** [https://docs.world.org/world-id](https://docs.world.org/world-id)
- **Mini Apps Verify Command:** [https://docs.world.org/mini-apps/commands/verify](https://docs.world.org/mini-apps/commands/verify)
- **Developer Portal:** [https://developer.worldcoin.org](https://developer.worldcoin.org)
- **MiniKit JS Docs:** [https://github.com/worldcoin/minikit-js](https://github.com/worldcoin/minikit-js)

---

## ✅ Quick Checklist

Before going to production:

- [ ] Action created in Developer Portal
- [ ] Action ID matches `.env.local` exactly
- [ ] Action status is **Active**
- [ ] Max verifications set appropriately
- [ ] Server-side proof verification working
- [ ] Tested both Device and Orb verification levels
- [ ] Error handling implemented
- [ ] Nullifier hashes stored (for preventing duplicates)
- [ ] Production URLs configured in Developer Portal

---

**Last Updated:** October 14, 2025  
**Status:** ✅ Action Configuration Complete
