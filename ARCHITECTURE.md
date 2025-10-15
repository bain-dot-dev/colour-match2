# Connect Four - Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     World Mini App                           │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js Application (SSR)                  │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │          Authentication Layer                     │  │ │
│  │  │  - NextAuth                                       │  │ │
│  │  │  - World ID Integration                           │  │ │
│  │  │  - Session Management                             │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                          ↓                              │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │          Protected Routes                         │  │ │
│  │  │  - /home  (Dashboard)                             │  │ │
│  │  │  - /game  (Connect Four) ← NEW                    │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                          ↓                              │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │          Component Layer                          │  │ │
│  │  │                                                    │  │ │
│  │  │  ┌──────────────────────────────────────────┐    │  │ │
│  │  │  │     ConnectFour Component                 │    │  │ │
│  │  │  │                                            │    │  │ │
│  │  │  │  • Game State Management (useState)       │    │  │ │
│  │  │  │  • UI Rendering (React)                   │    │  │ │
│  │  │  │  • Event Handling                          │    │  │ │
│  │  │  │  • Animation Orchestration                │    │  │ │
│  │  │  │                                            │    │  │ │
│  │  │  │  ┌──────────────────────────────────┐    │    │  │ │
│  │  │  │  │    Game Logic Module              │    │    │  │ │
│  │  │  │  │                                    │    │    │  │ │
│  │  │  │  │  • Pure Functions                 │    │    │  │ │
│  │  │  │  │  • Win Detection Algorithm        │    │    │  │ │
│  │  │  │  │  • Board State Management         │    │    │  │ │
│  │  │  │  │  • Move Validation                │    │    │  │ │
│  │  │  │  └──────────────────────────────────┘    │    │  │ │
│  │  │  │                                            │    │  │ │
│  │  │  │  ┌──────────────────────────────────┐    │    │  │ │
│  │  │  │  │    Type Definitions               │    │    │  │ │
│  │  │  │  │                                    │    │    │  │ │
│  │  │  │  │  • GameState                      │    │    │  │ │
│  │  │  │  │  • Player                         │    │    │  │ │
│  │  │  │  │  • Board                          │    │    │  │ │
│  │  │  │  │  • GameStatus                     │    │    │  │ │
│  │  │  │  └──────────────────────────────────┘    │    │  │ │
│  │  │  │                                            │    │  │ │
│  │  │  │  ┌──────────────────────────────────┐    │    │  │ │
│  │  │  │  │    CSS Animations                 │    │    │  │ │
│  │  │  │  │                                    │    │    │  │ │
│  │  │  │  │  • Disc Drop                      │    │    │  │ │
│  │  │  │  │  • Win Pulse                      │    │    │  │ │
│  │  │  │  │  • Hover Preview                  │    │    │  │ │
│  │  │  │  │  • Shake Effect                   │    │    │  │ │
│  │  │  │  └──────────────────────────────────┘    │    │  │ │
│  │  │  └──────────────────────────────────────────┘    │  │ │
│  │  │                                                    │  │ │
│  │  │  ┌──────────────────────────────────────────┐    │  │ │
│  │  │  │     Navigation Component                  │    │  │ │
│  │  │  │  • Tab Navigation                         │    │  │ │
│  │  │  │  • Route Management                       │    │  │ │
│  │  │  └──────────────────────────────────────────┘    │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                          ↓                              │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │          Styling Layer                            │  │ │
│  │  │  - Tailwind CSS                                   │  │ │
│  │  │  - CSS Modules                                    │  │ │
│  │  │  - World UI Kit                                   │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### ConnectFour Component Hierarchy

```
ConnectFour (Main Component)
│
├─ State Management
│  ├─ gameState (primary)
│  ├─ hoveredColumn (UI)
│  ├─ animatingCell (UI)
│  └─ shakeColumn (UI)
│
├─ Event Handlers
│  ├─ handleColumnClick()
│  ├─ handleReset()
│  └─ Mouse Events (hover)
│
├─ Computed Values
│  ├─ currentColor (memoized)
│  ├─ getCellClasses()
│  └─ getCellBackground()
│
└─ Render Tree
   ├─ Header
   │  ├─ Title
   │  └─ Description
   │
   ├─ Status Display
   │  ├─ Current Player Indicator
   │  ├─ Move Counter
   │  └─ Game Over Message (conditional)
   │
   ├─ Game Board
   │  ├─ Column Preview (hover)
   │  └─ Grid (7 columns × 6 rows)
   │     └─ Cell Buttons (42 total)
   │        └─ Disc (conditional)
   │
   ├─ Controls
   │  └─ Reset/New Game Button
   │
   ├─ Player Legend
   │  ├─ Player 1 Color
   │  └─ Player 2 Color
   │
   └─ Rules Section (collapsible)
      └─ How to Play
```

## Data Flow

### Move Execution Flow

```
User Action (Click/Tap)
        ↓
handleColumnClick(col)
        ↓
Validation Check
├─ isValidMove() → ❌ Invalid
│                    ↓
│                  Shake Animation
│                    ↓
│                  Return
│
└─ ✅ Valid
   ↓
findLowestRow(col)
   ↓
Set Animation State
   ↓
setTimeout (100ms)
   ↓
makeMove(state, col)
   ↓
Update Board
   ↓
Check Win Condition
├─ Win Found? → ✅ Yes
│                  ↓
│               Set Winner
│                  ↓
│            Trigger Win Animation
│                  ↓
│             End Game
│
└─ ❌ No Win
   ↓
Check Draw?
├─ Board Full? → ✅ Yes
│                  ↓
│              Declare Draw
│                  ↓
│               End Game
│
└─ ❌ Continue
   ↓
Switch Player
   ↓
Update Game State
   ↓
Re-render Component
```

## State Management Architecture

### Game State Object

```typescript
GameState {
  board: Cell[][]           // 6×7 matrix of Player | null
  currentPlayer: Player     // 1 or 2
  status: GameStatus        // 'playing' | 'won' | 'draw'
  winner: Player | null     // null unless won
  winningCells: number[][]  // [[row, col], ...] positions
  moveCount: number         // Total moves made
}
```

### State Update Pattern

```
Current State (Immutable)
        ↓
Pure Function (makeMove)
        ↓
New State Object (Created)
        ↓
React State Update
        ↓
Component Re-render
        ↓
UI Updates (Declarative)
```

## Algorithm Details

### Win Detection Algorithm

#### Direction Vectors

```
Horizontal:       [0, 1]   →
Vertical:         [1, 0]   ↓
Diagonal Right:   [1, 1]   ↘
Diagonal Left:    [1, -1]  ↙
```

#### Checking Process

```
For each direction:
  ├─ Start at clicked position
  ├─ Check 4 consecutive cells
  │  ├─ All within bounds?
  │  ├─ All same player?
  │  └─ If yes → WIN!
  │
  └─ If no win, try next direction

Time Complexity: O(1) - Fixed 4 checks per direction
Space Complexity: O(1) - No additional structures
```

### Gravity Simulation

```
Drop Disc in Column
        ↓
Start from Bottom Row (row 5)
        ↓
Move Up Each Row
├─ Is cell empty? → ✅ Yes
│                      ↓
│                   Place Disc Here
│                      ↓
│                   Return Row
│
└─ ❌ No (occupied)
   ↓
Move to Next Row Up
   ↓
Continue Until Found or Top Reached
```

## Animation Architecture

### Animation Trigger System

```
User Action
    ↓
State Change
    ↓
CSS Class Applied
    ↓
Browser Triggers Animation
    ↓
GPU Acceleration
    ↓
Smooth 60fps Animation
    ↓
Animation Complete
    ↓
Class Persists (or removed)
```

### Animation Types

1. **Entrance Animations** (Component Mount)

   - Board entrance
   - Fade in effects

2. **Interaction Animations** (User Triggered)

   - Disc drop
   - Preview bounce
   - Shake feedback

3. **State Animations** (Continuous)

   - Win pulse (infinite loop)
   - Glow effect (infinite loop)

4. **Feedback Animations** (One-shot)
   - Button press
   - Slide down messages

## Performance Optimization Strategy

### Rendering Optimization

```
Component Tree
    ↓
React.memo() [Future Enhancement]
    ↓
useMemo() - Computed Values
    ↓
useCallback() - Stable Functions
    ↓
Pure Component Re-renders Only When Needed
```

### Animation Performance

```
CSS Animations
    ↓
transform & opacity (GPU accelerated)
    ↓
No Layout Thrashing
    ↓
Consistent 60fps
```

### State Separation

```
Game State (Infrequent Updates)
    ↓
Triggers Full Re-render
    ↓
Critical for Correctness

UI State (Frequent Updates)
    ↓
Minimal Re-render Impact
    ↓
Hover, Animations, Feedback
```

## File Organization

### Module Boundaries

```
types.ts
├─ Exports: Types & Interfaces
├─ Imports: None
└─ Purpose: Type definitions only

gameLogic.ts
├─ Exports: Pure functions
├─ Imports: types.ts
└─ Purpose: Game rules & algorithms

ConnectFour.module.css
├─ Exports: CSS class names
├─ Imports: None
└─ Purpose: Animations & keyframes

index.tsx
├─ Exports: ConnectFour component
├─ Imports: types.ts, gameLogic.ts, module.css
└─ Purpose: UI & interaction logic
```

### Dependency Graph

```
index.tsx
    ↓
    ├─ types.ts
    ├─ gameLogic.ts → types.ts
    └─ ConnectFour.module.css

(No circular dependencies)
```

## Responsive Design Strategy

### Breakpoint Architecture

```
Mobile First (Default)
    ↓
Base Styles Applied
    ↓
    ├─ Font sizes: text-sm to text-4xl
    ├─ Spacing: px-4, gap-2
    ├─ Touch targets: 44×44px minimum
    └─ Column width: auto (flex)

Tablet+ (md: 768px+)
    ↓
Enhanced Styles Applied
    ↓
    ├─ Larger fonts: md:text-5xl
    ├─ More spacing: md:gap-3
    ├─ Wider components
    └─ Hover effects enabled
```

## Security Architecture

### Input Validation Layers

```
User Input
    ↓
Layer 1: UI Validation (Client)
├─ Column in bounds? (0-6)
├─ Game still playing?
└─ Column not full?
    ↓
Layer 2: Logic Validation
├─ isValidMove()
└─ findLowestRow() != -1
    ↓
Layer 3: State Immutability
├─ Pure functions
└─ No direct mutations
    ↓
Validated Move Executed
```

### Type Safety

```
TypeScript Compilation
    ↓
Type Checking at Build Time
    ↓
Runtime Type Assertions
    ↓
No Type-Related Bugs
```

## Integration Points

### World Mini App Integration

```
App Layout (Root)
    ↓
NextAuth Authentication
    ↓
World ID Verification
    ↓
Session Management
    ↓
Protected Routes
    ↓
ConnectFour Component
```

### Navigation Integration

```
Navigation Component
    ↓
Tab Click Event
    ↓
Next.js Router
    ↓
Route Change (/game)
    ↓
Game Page Loads
    ↓
ConnectFour Renders
```

## Testing Strategy (Recommended)

### Unit Tests

```
gameLogic.ts
├─ createEmptyBoard()
├─ findLowestRow()
├─ isValidMove()
├─ checkWinFromPosition()
└─ makeMove()
```

### Integration Tests

```
ConnectFour Component
├─ Renders correctly
├─ Handles clicks
├─ Updates state
├─ Shows winner
└─ Resets game
```

### E2E Tests

```
Full Game Flow
├─ Navigate to game
├─ Play complete game
├─ Verify win detection
└─ Reset and replay
```

## Deployment Architecture

```
Development
    ↓
npm run build
    ↓
Next.js Optimization
├─ Tree shaking
├─ Code splitting
├─ Minification
└─ Bundle optimization
    ↓
Production Build
    ↓
Deploy to Hosting
├─ Vercel (recommended)
├─ AWS
└─ Custom server
```

## Browser Compatibility

### Support Matrix

```
Chrome/Edge (Chromium)
├─ Version: 90+
├─ Support: Full ✅
└─ Notes: Optimal performance

Safari (WebKit)
├─ Version: 14+
├─ Support: Full ✅
└─ Notes: Requires -webkit- prefixes (auto-added)

Firefox (Gecko)
├─ Version: 88+
├─ Support: Full ✅
└─ Notes: Excellent animation support

Mobile Browsers
├─ iOS Safari: 14+
├─ Chrome Mobile: 90+
└─ Support: Full ✅
```

## Performance Metrics

### Target Metrics

- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Animation Frame Rate:** 60fps
- **Bundle Size:** < 200KB (game component)
- **Lighthouse Score:** 90+

### Optimization Techniques

1. Code splitting (Next.js automatic)
2. CSS modules (scoped styles)
3. Lazy loading (future enhancement)
4. Memoization (React hooks)
5. Pure functions (predictable performance)

## Scalability Considerations

### Current Limitations

- Single device gameplay only
- No persistence (state resets on refresh)
- No game history
- No user statistics

### Future Scalability

- Add backend for multiplayer
- Implement WebSockets for real-time
- Database for game history
- Caching layer for performance
- CDN for static assets

---

**This architecture supports:**

- ✅ Maintainability
- ✅ Testability
- ✅ Scalability
- ✅ Performance
- ✅ Type Safety
- ✅ Separation of Concerns

**Last Updated:** October 14, 2025
