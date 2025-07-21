# Tic Tac Toe Frontend – React

A modern web-based Tic Tac Toe game built with React.

## Features

- Interactive 3x3 game board
- Player vs Player mode
- Player vs Computer mode (AI)
- Winning/draw detection & highlight
- Game restart option
- Score display (X, O, Draws)
- Responsive, centered, modern light UI
- Uses color theme:  
  - Primary: #1976d2  
  - Accent: #ff9800  
  - Secondary: #424242

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **(Optional) Set up theme via environment:**
   - Copy `.env.example` to `.env` and override these (if needed):
     ```
     REACT_APP_PRIMARY_COLOR=#1976d2
     REACT_APP_ACCENT_COLOR=#ff9800
     REACT_APP_SECONDARY_COLOR=#424242
     ```

3. **Run the app:**
   ```
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Play

- Click a game mode (PvP: two players, PvC: play against computer).
- Click a square to make your move.
- The first move is always by X.
- The game tells you who wins or if it's a draw. 
- Use **Restart** to clear the board and play again!

## Customization

- Colors use CSS variables (see `src/App.css` or override via `.env`).
- No external UI libraries, just React + plain CSS. 
- Edit `src/App.js` to tweak gameplay.

## Testing

To run unit tests:

```
npm test
```
