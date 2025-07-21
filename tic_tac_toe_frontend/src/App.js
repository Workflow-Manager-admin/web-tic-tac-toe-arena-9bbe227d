import React, { useState, useEffect } from 'react';
import './App.css';

/**
 * Color palette for quick use and style reference:
 * - Primary: #1976d2
 * - Accent: #ff9800
 * - Secondary: #424242
 * - Light background: #ffffff, Slight secondary background: #f8f9fa
 */

/** Game modes */
const GAME_MODES = {
  PVP: 'Player vs Player',
  PVC: 'Player vs Computer',
};

const PLAYER_X = 'X';
const PLAYER_O = 'O';

/** Utility to check for winner */
function calculateWinner(squares) {
  // All possible winning combinations
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6],            // diagonal
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a]; // X or O
    }
  }
  return null;
}

/** AI Move: Pick first available cell, center, or corners (simple for now) */
function computeAIMove(squares, aiSymbol) {
  // Try to win, then block, then center, then corners, then random
  const emptyIndices = squares.map((v, i) => (v == null ? i : null)).filter(i => i !== null);

  // Find winning/blocking move
  function findWinningMove(forSymbol) {
    // check each move: if move leads to win, return it
    for (let idx of emptyIndices) {
      const clone = squares.slice();
      clone[idx] = forSymbol;
      if (calculateWinner(clone) === forSymbol) {
        return idx;
      }
    }
    return null;
  }

  // 1. If can win, do it
  const winMove = findWinningMove(aiSymbol);
  if (winMove !== null) return winMove;
  // 2. If can block, block player
  const oppSymbol = aiSymbol === PLAYER_X ? PLAYER_O : PLAYER_X;
  const blockMove = findWinningMove(oppSymbol);
  if (blockMove !== null) return blockMove;
  // 3. Take center
  if (!squares[4]) return 4;
  // 4. Take a corner
  const corners = [0, 2, 6, 8].filter(i => !squares[i]);
  if (corners.length > 0) return corners[0];
  // 5. Take any available cell
  return emptyIndices[0];
}

// PUBLIC_INTERFACE
function App() {
  // Game state
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true); // X always first
  const [gameMode, setGameMode] = useState(GAME_MODES.PVP);
  const [status, setStatus] = useState('');
  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 });
  const [gameOver, setGameOver] = useState(false);

  // Set colors from env if present, else use default (env for theming flexibility)
  const primary = process.env.REACT_APP_PRIMARY_COLOR || '#1976d2';
  const accent = process.env.REACT_APP_ACCENT_COLOR || '#ff9800';
  const secondary = process.env.REACT_APP_SECONDARY_COLOR || '#424242';

  // Winning line highlight state
  const [winLine, setWinLine] = useState([]);

  // PUBLIC_INTERFACE
  const handleModeChange = (mode) => {
    setGameMode(mode);
    restartGame(mode);
  };

  // PUBLIC_INTERFACE
  function restartGame(optionallyNewMode) {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setStatus('');
    setGameOver(false);
    setWinLine([]);
  }

  // Handles square click
  // PUBLIC_INTERFACE
  function handleClick(idx) {
    if (gameOver || squares[idx]) return;
    let nextSquares = squares.slice();
    nextSquares[idx] = xIsNext ? PLAYER_X : PLAYER_O;
    processMove(nextSquares);
  }

  // Main logic after a human (or AI) move
  function processMove(updatedSquares) {
    const winner = calculateWinner(updatedSquares);
    setSquares(updatedSquares);
    setXIsNext((prev) => !prev);

    if (winner) {
      const nextScore = { ...score };
      nextScore[winner]++;
      setScore(nextScore);
      setStatus(`Winner: ${winner}`);
      setGameOver(true);
      setWinLine(getWinningLine(updatedSquares, winner));
    } else if (!updatedSquares.includes(null)) {
      // Draw
      setScore((score) => ({ ...score, draws: score.draws + 1 }));
      setStatus('Draw!');
      setGameOver(true);
      setWinLine([]);
    } else {
      setStatus(`Next: ${xIsNext ? PLAYER_O : PLAYER_X}`);
    }
  }

  // Detect a winning line for highlighting, returns array of [a, b, c] or []
  function getWinningLine(squaresArr, winnerSymbol) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (
        squaresArr[a] === winnerSymbol &&
        squaresArr[b] === winnerSymbol &&
        squaresArr[c] === winnerSymbol
      ) {
        return [a, b, c];
      }
    }
    return [];
  }

  // AI turn effect, only runs after human moves in PvC
  useEffect(() => {
    if (gameMode === GAME_MODES.PVC && !gameOver && !xIsNext) {
      // Computer (O) turn
      // Timeout for visual feedback/delay
      const aiPlayTimeout = setTimeout(() => {
        const aiMove = computeAIMove(squares, PLAYER_O);
        if (aiMove !== undefined) {
          let nextSquares = squares.slice();
          nextSquares[aiMove] = PLAYER_O;
          processMove(nextSquares);
        }
      }, 500);
      return () => clearTimeout(aiPlayTimeout);
    }
    // eslint-disable-next-line
  }, [gameMode, xIsNext, gameOver, squares]);

  // Theme effect for primary, accent, secondary colors
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--secondary', secondary);
  }, [primary, accent, secondary]);

  // Setup status for first render
  useEffect(() => {
    setStatus(`Next: ${PLAYER_X}`);
  }, [gameMode]);

  // PUBLIC_INTERFACE
  return (
    <div
      className="App"
      style={{
        backgroundColor: 'var(--bg-primary)',
        minHeight: '100vh',
      }}
      data-testid="main-app"
    >
      <header style={{ margin: 0, paddingTop: 48, marginBottom: 32 }}>
        <h1
          style={{
            color: 'var(--primary)',
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: 1,
            margin: 0,
            textShadow: `0 4px 16px rgba(25, 118, 210, 0.05)`,
          }}
        >
          Tic Tac Toe
        </h1>
        <p
          style={{
            color: 'var(--secondary)',
            letterSpacing: 1,
            margin: 0,
            fontWeight: 400,
            fontSize: 16,
          }}
        >
          Classic game – Modern web
        </p>
      </header>

      {/* Scoreboard */}
      <section
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
          marginBottom: 20,
          fontSize: 18,
        }}
      >
        <ScorePanel
          x={score.X}
          o={score.O}
          draws={score.draws}
          colorPrimary={primary}
          colorSecondary={secondary}
        />
      </section>

      {/* Game Board */}
      <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Board
          squares={squares}
          onClick={handleClick}
          winLine={winLine}
          isGameOver={gameOver}
        />
        {/* Controls & status below */}
        <div
          style={{
            marginTop: 24,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 10px 0 #1976d224',
            padding: 20,
            minWidth: 320,
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <p
            style={{
              color: status.startsWith('Winner') || status === 'Draw!' ? accent : primary,
              fontWeight: 700,
              fontSize: 20,
              margin: 0,
            }}
            data-testid="game-status"
          >
            {status}
          </p>
          <div style={{
            display: 'flex',
            gap: 10,
            marginTop: 12,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {/* PUBLIC_INTERFACE: Mode select */}
            <button
              onClick={() => handleModeChange(GAME_MODES.PVP)}
              disabled={gameMode === GAME_MODES.PVP}
              style={modeBtnStyle(gameMode === GAME_MODES.PVP, primary, accent, secondary)}
              aria-label="Player vs Player mode"
              data-testid="pvp-btn"
            >
              PvP
            </button>
            <button
              onClick={() => handleModeChange(GAME_MODES.PVC)}
              disabled={gameMode === GAME_MODES.PVC}
              style={modeBtnStyle(gameMode === GAME_MODES.PVC, primary, accent, secondary)}
              aria-label="Player vs Computer mode"
              data-testid="pvc-btn"
            >
              PvC
            </button>
            <button
              onClick={() => restartGame()}
              style={{
                ...modeBtnStyle(false, primary, accent, secondary),
                background: accent,
                color: '#fff'
              }}
              aria-label="Restart game"
              data-testid="restart-btn"
            >
              Restart
            </button>
          </div>
          {/* Show which mode is active */}
          <span style={{
            marginTop: 16,
            color: secondary,
            opacity: 0.8,
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: 0.5,
            userSelect: 'none',
          }}>
            Game Mode: <b>{gameMode}</b>
          </span>
        </div>
      </section>
      <footer style={{ marginTop: 48, color: '#888', fontSize: 15, opacity: 0.7 }}>
        <small>
          &copy; {new Date().getFullYear()} Tic Tac Toe &mdash; React Modern Light Theme
        </small>
      </footer>
    </div>
  );
}

/**
 * Board component
 * PUBLIC_INTERFACE
 */
function Board({ squares, onClick, winLine, isGameOver }) {
  return (
    <div className="ttt-board" style={{
      display: 'grid',
      gridTemplateColumns: `repeat(3, 80px)`,
      gridTemplateRows: `repeat(3, 80px)`,
      gap: 8,
      borderRadius: 14,
      background: 'var(--bg-secondary)',
      boxShadow: '0 2px 12px 0 #1976d210',
      marginBottom: 12,
      minWidth: 264,
      justifyContent: 'center'
    }}>
      {squares.map((val, idx) => (
        <Square
          key={idx}
          value={val}
          onClick={() => onClick(idx)}
          highlight={winLine.includes(idx)}
          disabled={Boolean(val) || isGameOver}
        />
      ))}
    </div>
  );
}

/**
 * Square component (for a cell)
 * PUBLIC_INTERFACE
 */
function Square({ value, onClick, highlight, disabled }) {
  return (
    <button
      className="ttt-square"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 78,
        height: 78,
        background: highlight ? 'var(--accent)' : '#fff',
        color: highlight ? '#fff' : 'var(--primary)',
        fontWeight: 'bold',
        fontSize: 38,
        border: `2.5px solid var(--primary)`,
        borderRadius: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background .23s, color .23s, border-color .20s',
        boxShadow: highlight
          ? '0 2px 10px 0 #ff980033'
          : '0 1.5px 6px 0 #1976d208',
        outline: 'none',
        userSelect: 'none',
      }}
      data-testid="square-btn"
      tabIndex={0}
    >
      {value}
    </button>
  );
}

/**
 * Score panel display
 * PUBLIC_INTERFACE
 */
function ScorePanel({ x, o, draws, colorPrimary, colorSecondary }) {
  return (
    <div style={{
      display: 'flex',
      gap: 28,
      fontWeight: 600,
      fontSize: 20,
      justifyContent: 'center',
    }}>
      <span style={{ color: colorPrimary }}>X: {x}</span>
      <span style={{ color: colorSecondary }}>O: {o}</span>
      <span style={{ color: '#999' }}>Draws: {draws}</span>
    </div>
  );
}

/**
 * Button style
 */
function modeBtnStyle(active, primary, accent, secondary) {
  return {
    padding: '8px 20px',
    fontWeight: 600,
    borderRadius: 7,
    fontSize: 14,
    border: active ? `2.5px solid ${accent}` : `2px solid #ccc`,
    background: active ? primary : '#fff',
    color: active ? '#fff' : secondary,
    outline: 'none',
    cursor: active ? 'not-allowed' : 'pointer',
    boxShadow: active
      ? '0 2px 7px 0 #1976d230'
      : '0 1px 3px 0 #1976d10a',
    opacity: active ? 1 : .97,
    transition: 'all .18s',
  };
}

export default App;
