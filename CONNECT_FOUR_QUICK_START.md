# Connect Four - Quick Start Guide 🎮

## What is Connect Four?

A classic two-player strategy game where you drop colored discs into a vertical grid. The first player to get **4 in a row** (horizontal, vertical, or diagonal) wins!

## Features ✨

✅ **Beautiful UI** - Rich color palette with gradient backgrounds  
✅ **Smooth Animations** - Disc drops, win celebrations, and more  
✅ **Mobile Responsive** - Optimized for all screen sizes  
✅ **World ID Integration** - Secure authentication  
✅ **Real-time Feedback** - Hover previews and visual cues  
✅ **Intuitive Controls** - Click or tap to play

## Getting Started

### 1. Run the App

```bash
npm run dev
```

### 2. Navigate to the Game

1. Open http://localhost:3000
2. Authenticate with World ID
3. Click the **Game** tab in the bottom navigation
4. Start playing!

## How to Play

### Basic Rules

1. Players alternate turns (Pink = Player 1, Turquoise = Player 2)
2. Click any column to drop your disc
3. Discs fall to the lowest available position
4. Get 4 in a row to win!

### Controls

- **Desktop:** Hover over columns for preview, click to drop
- **Mobile:** Tap any column to drop your disc
- **Reset:** Click the reset button to start a new game

### Winning Conditions

- **Horizontal:** 4 discs in a row →
- **Vertical:** 4 discs in a column ↓
- **Diagonal:** 4 discs diagonally ↘ or ↙

## Color Scheme

### Player Colors

- 🌸 **Player 1:** Pink/Rose (#FF6B9D)
- 🌊 **Player 2:** Turquoise (#4ECDC4)

### Board Design

- **Background:** Purple gradient
- **Cells:** Semi-transparent white
- **Effects:** Glowing discs with shadows

## Animation Features

### Disc Drop

- Realistic gravity effect
- Bounce on landing
- Smooth 0.6s animation

### Win Celebration

- Pulsing animation on winning discs
- Golden glow effect
- Celebratory message

### Interactive Feedback

- Preview disc on hover
- Shake animation for invalid moves
- Glow effect on current player
- Button press animations

## Tips & Strategy 💡

1. **Control the Center** - Middle columns provide more winning opportunities
2. **Think Ahead** - Plan your moves 2-3 turns in advance
3. **Block Your Opponent** - Watch for their potential wins
4. **Create Multiple Threats** - Force your opponent into difficult positions
5. **Don't Neglect Diagonals** - Often overlooked but powerful

## File Structure

```
src/components/ConnectFour/
├── index.tsx                 # Main game component
├── types.ts                  # TypeScript definitions
├── gameLogic.ts             # Game rules & algorithms
└── ConnectFour.module.css   # Animations & styles
```

## Key Technologies

- ⚛️ React 19.0.0
- ▲ Next.js 15.2.3
- 🎨 Tailwind CSS 4
- 🌍 World ID Kit
- 📘 TypeScript 5

## Customization

### Change Player Colors

Edit `src/components/ConnectFour/index.tsx`:

```typescript
const playerColors = {
  1: {
    primary: "#YOUR_COLOR_HERE",
    secondary: "#YOUR_DARKER_SHADE",
    glow: "rgba(YOUR_RGB, 0.4)",
  },
  // ...
};
```

### Adjust Animation Speed

Edit `src/components/ConnectFour/ConnectFour.module.css`:

```css
.disc-drop {
  animation: dropDisc 0.6s /* Change duration here */;
}
```

### Modify Board Size

Edit `src/components/ConnectFour/gameLogic.ts`:

```typescript
export const ROWS = 6; // Change rows
export const COLS = 7; // Change columns
```

## Performance

### Optimizations

- Pure function game logic
- Memoized color calculations
- CSS animations (GPU accelerated)
- Efficient win detection (O(1) complexity)

### Browser Support

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Game Not Responding

- ✅ Refresh the page
- ✅ Clear browser cache
- ✅ Check browser console for errors

### Animations Stuttering

- ✅ Close unused browser tabs
- ✅ Enable hardware acceleration
- ✅ Update graphics drivers

### Touch Not Working (Mobile)

- ✅ Ensure touch events are enabled
- ✅ Try a different browser
- ✅ Update your mobile OS

## Next Steps

### Want to Learn More?

📖 Read the full documentation: `CONNECT_FOUR_DOCUMENTATION.md`

### Want to Contribute?

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

### Need Help?

- 📚 Check the documentation
- 🐛 Report issues on GitHub
- 💬 Ask in the community Discord

## Fun Facts

- 🎲 Connect Four was first sold in 1974
- 🧮 There are 4,531,985,219,092 possible game positions
- 🏆 Perfect play leads to a win for Player 1
- 🎯 Average game length: 36 moves

## Keyboard Shortcuts

| Key   | Action                            |
| ----- | --------------------------------- |
| `1-7` | Drop disc in column (coming soon) |
| `R`   | Reset game (coming soon)          |
| `?`   | Show help (coming soon)           |

---

## Ready to Play? 🎉

That's it! You're ready to enjoy Connect Four. Have fun and may the best strategist win!

**Pro tip:** The center column (column 4) is statistically the strongest opening move! 🎯

---

_Happy Gaming! 🎮_
