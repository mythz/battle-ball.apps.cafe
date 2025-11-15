# Sword Ball Battle Royale

A 2D top-down battle royale game where players use swords to deflect a bouncing ball to eliminate AI opponents. Last player standing wins the round and earns coins for cosmetic upgrades.

## Game Description

You have to use a sword to block the ball and hit it with your sword to try and kill other AI bots. There are 4 AI bots not including the player. To end a round, one player or AI bot must remain. After each round, if you win then you get 50 coins which can be spent at the shop for new swords and skins.

## Features

- **Engaging Gameplay**: Use physics-based ball mechanics to eliminate opponents
- **Progressive Unlocks**: 14 unique swords with different stats
- **Character Customization**: 12 unique character skins
- **AI Opponents**: 4 AI bots with adjustable difficulty (Easy, Medium, Hard)
- **Persistent Progress**: Your coins and unlocks are saved using IndexedDB
- **Visual Effects**: Particle systems, glowing effects, and smooth animations
- **Responsive Controls**: WASD movement, mouse aim, click to swing, space to block

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How to Play

### Controls
- **WASD or Arrow Keys**: Move your character
- **Mouse**: Aim your sword
- **Left Click or E**: Swing sword
- **Right Click or Space**: Block (reduces damage)
- **ESC**: Pause game

### Objective
- Deflect the ball with your sword to hit opponents
- Avoid getting hit by the ball
- Last player standing wins
- Earn coins to unlock better swords and skins

## Technology Stack

- **React 18** + **TypeScript**
- **Vite** for build tooling
- **HTML5 Canvas** for rendering
- **IndexedDB** for persistent storage with localStorage fallback
- **Tailwind CSS** for UI styling
- **React Router** for navigation

## Project Structure

```
src/
├── components/          # React UI components
│   ├── MainMenu.tsx
│   ├── Game.tsx
│   ├── Shop.tsx
│   ├── GameOver.tsx
│   ├── Settings.tsx
│   └── GameHUD.tsx
├── game/               # Game engine
│   ├── GameEngine.ts
│   ├── InputManager.ts
│   ├── entities/
│   ├── physics/
│   ├── ai/
│   └── rendering/
├── store/              # State management
│   ├── GameContext.tsx
│   ├── DatabaseService.ts
│   └── types.ts
├── data/               # Game data
│   ├── constants.ts
│   ├── swords.ts
│   └── skins.ts
└── utils/              # Utilities
    └── sound.ts
```

## License

MIT
