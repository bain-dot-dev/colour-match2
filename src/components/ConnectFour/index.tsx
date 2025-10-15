"use client";

/**
 * Connect Four Game Component
 * Main game component with UI and interaction logic
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  createInitialState,
  makeMove,
  isValidMove,
  findLowestRow,
} from "./gameLogic";
import { getAIMove, getDifficultyDescription } from "./aiLogic";
import type { GameState, GameMode, AIDifficulty } from "./types";
import styles from "./ConnectFour.module.css";

// Player colors - rich color palette (defined outside component to prevent recreation)
const playerColors = {
  1: {
    primary: "#FF6B9D", // Pink/Rose
    secondary: "#C94277",
    glow: "rgba(255, 107, 157, 0.4)",
  },
  2: {
    primary: "#4ECDC4", // Turquoise
    secondary: "#3BA39B",
    glow: "rgba(78, 205, 196, 0.4)",
  },
} as const;

export const ConnectFour = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [animatingCell, setAnimatingCell] = useState<string | null>(null);
  const [shakeColumn, setShakeColumn] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>("medium");
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Reset game
  const handleReset = useCallback(() => {
    setGameState(createInitialState());
    setHoveredColumn(null);
    setAnimatingCell(null);
    setShakeColumn(null);
    setIsAIThinking(false);
  }, []);

  // Start new game with mode selection
  const handleStartGame = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setGameState(createInitialState());
  }, []);

  // Go back to mode selection
  const handleBackToMenu = useCallback(() => {
    setGameMode(null);
    setGameState(createInitialState());
    setIsAIThinking(false);
  }, []);

  // AI move logic - triggers when it's AI's turn
  useEffect(() => {
    // Only trigger if it's AI mode, playing, and player 2's turn
    if (
      gameMode === "ai" &&
      gameState.status === "playing" &&
      gameState.currentPlayer === 2
    ) {
      // Don't trigger if AI is already processing
      if (isAIThinking) return;

      console.log("AI's turn - starting to think...");
      setIsAIThinking(true);

      // Add delay for more natural feel
      const delay =
        aiDifficulty === "easy" ? 500 : aiDifficulty === "medium" ? 800 : 1200;

      const timeoutId = setTimeout(() => {
        console.log("AI making move...");
        const aiCol = getAIMove(gameState.board, 2, aiDifficulty);
        const row = findLowestRow(gameState.board, aiCol);

        if (row !== -1) {
          const cellKey = `${row}-${aiCol}`;
          setAnimatingCell(cellKey);

          setTimeout(() => {
            setGameState((prev) => makeMove(prev, aiCol));
            setAnimatingCell(null);
            setIsAIThinking(false);
            console.log("AI move complete");
          }, 100);
        } else {
          console.error("AI couldn't find valid move");
          setIsAIThinking(false);
        }
      }, delay);

      return () => {
        console.log("Cleanup AI timeout");
        clearTimeout(timeoutId);
      };
    }
  }, [gameState.moveCount, gameMode]);

  // Handle column click
  const handleColumnClick = useCallback(
    (col: number) => {
      if (gameState.status !== "playing" || isAIThinking) return;

      // In AI mode, only allow player 1 to click
      if (gameMode === "ai" && gameState.currentPlayer === 2) return;

      if (!isValidMove(gameState.board, col)) {
        // Shake animation for invalid move
        setShakeColumn(col);
        setTimeout(() => setShakeColumn(null), 300);
        return;
      }

      const row = findLowestRow(gameState.board, col);
      const cellKey = `${row}-${col}`;

      // Trigger drop animation
      setAnimatingCell(cellKey);

      // Make the move after a brief delay to allow animation setup
      setTimeout(() => {
        setGameState((prev) => makeMove(prev, col));
        setAnimatingCell(null);
      }, 100);
    },
    [gameState, isAIThinking, gameMode]
  );

  // Get cell classes for styling
  const getCellClasses = useCallback(
    (row: number, col: number, value: number | null) => {
      const cellKey = `${row}-${col}`;
      const isWinning = gameState.winningCells.some(
        ([r, c]) => r === row && c === col
      );
      const isAnimating = animatingCell === cellKey;

      let classes =
        "relative w-full aspect-square rounded-full transition-all duration-300 ";

      if (value !== null) {
        classes += isAnimating ? styles["disc-drop"] : "";
        classes += isWinning ? ` ${styles["win-pulse"]}` : "";
      }

      return classes;
    },
    [gameState.winningCells, animatingCell]
  );

  // Get cell background color
  const getCellBackground = useCallback((value: number | null) => {
    if (value === null) {
      return "bg-white/10";
    }
    return value === 1 ? "bg-[#FF6B9D]" : "bg-[#4ECDC4]";
  }, []);

  // Current player color
  const currentColor = useMemo(
    () => playerColors[gameState.currentPlayer],
    [gameState.currentPlayer]
  );

  // Mode Selection Screen
  if (gameMode === null) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className={`text-center mb-8 ${styles["slide-down"]}`}>
          <h1
            className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)",
            }}
          >
            Connect Four
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            Choose your game mode
          </p>
        </div>

        {/* Mode Selection */}
        <div className="space-y-4">
          {/* Player vs Player */}
          <button
            onClick={() => handleStartGame("pvp")}
            className={`
              w-full p-6 rounded-2xl
              bg-gradient-to-br from-purple-500 to-pink-500
              hover:from-purple-600 hover:to-pink-600
              text-white font-semibold text-lg
              shadow-lg hover:shadow-xl
              transition-all duration-200
              active:scale-95
              ${styles["button-press"]}
            `}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-2xl">👥</span>
              <span>Player vs Player</span>
            </div>
            <p className="text-sm opacity-90">Play against a friend locally</p>
          </button>

          {/* Player vs AI */}
          <button
            onClick={() => handleStartGame("ai")}
            className={`
              w-full p-6 rounded-2xl
              bg-gradient-to-br from-blue-500 to-cyan-500
              hover:from-blue-600 hover:to-cyan-600
              text-white font-semibold text-lg
              shadow-lg hover:shadow-xl
              transition-all duration-200
              active:scale-95
              ${styles["button-press"]}
            `}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-2xl">🤖</span>
              <span>Player vs AI</span>
            </div>
            <p className="text-sm opacity-90">Challenge the computer</p>
          </button>
        </div>

        {/* AI Difficulty Selection */}
        {gameMode === null && (
          <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4 text-center">
              AI Difficulty
            </h3>
            <div className="space-y-3">
              {(["easy", "medium", "hard"] as AIDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setAiDifficulty(diff)}
                  className={`
                    w-full p-4 rounded-xl text-left
                    transition-all duration-200
                    ${
                      aiDifficulty === diff
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "bg-white/5 hover:bg-white/10"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold capitalize">{diff}</div>
                      <div className="text-sm opacity-75 mt-1">
                        {getDifficultyDescription(diff)}
                      </div>
                    </div>
                    {aiDifficulty === diff && <span>✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      {/* Game Header */}
      <div className={`text-center mb-6 ${styles["slide-down"]}`}>
        <h1
          className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%)",
          }}
        >
          Connect Four
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          Drop discs to get 4 in a row!
        </p>
      </div>

      {/* Status Display */}
      <div className={`mb-6 ${styles["fade-in"]}`}>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Current Player Indicator */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Current Turn:
              </span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full ${styles["glow-effect"]}`}
                  style={{
                    backgroundColor: currentColor.primary,
                    boxShadow: `0 0 15px ${currentColor.glow}`,
                  }}
                />
                <span className="text-lg font-bold">
                  {gameMode === "ai" && gameState.currentPlayer === 2
                    ? "AI 🤖"
                    : gameMode === "ai" && gameState.currentPlayer === 1
                    ? "You"
                    : `Player ${gameState.currentPlayer}`}
                </span>
              </div>
            </div>

            {/* Move Counter */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Moves: <span className="font-bold">{gameState.moveCount}</span>
            </div>
          </div>

          {/* Game Over Message */}
          {gameState.status !== "playing" && (
            <div className={`mt-4 ${styles["bounce-in"]}`}>
              <div
                className="text-center py-3 px-4 rounded-xl font-bold text-lg"
                style={{
                  background:
                    gameState.status === "won"
                      ? `linear-gradient(135deg, ${
                          playerColors[gameState.winner!].primary
                        }, ${playerColors[gameState.winner!].secondary})`
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                }}
              >
                {gameState.status === "won"
                  ? gameMode === "ai"
                    ? gameState.winner === 1
                      ? "🎉 You Win! 🎉"
                      : "🤖 AI Wins! 🤖"
                    : `🎉 Player ${gameState.winner} Wins! 🎉`
                  : "🤝 Draw Game! 🤝"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Board */}
      <div className={`mb-6 ${styles["board-entrance"]}`}>
        <div
          className="relative p-4 rounded-3xl shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          {/* Column Preview */}
          {hoveredColumn !== null &&
            gameState.status === "playing" &&
            isValidMove(gameState.board, hoveredColumn) && (
              <div
                className="absolute top-2 flex justify-center pointer-events-none z-10"
                style={{
                  left: `${(hoveredColumn / 7) * 100 + 100 / 14}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${styles["preview-disc"]}`}
                  style={{
                    backgroundColor: currentColor.primary,
                    opacity: 0.6,
                  }}
                />
              </div>
            )}

          {/* Board Grid */}
          <div className="grid grid-cols-7 gap-2 md:gap-3">
            {gameState.board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleColumnClick(colIndex)}
                  onMouseEnter={() => setHoveredColumn(colIndex)}
                  onMouseLeave={() => setHoveredColumn(null)}
                  disabled={gameState.status !== "playing"}
                  className={`
                    aspect-square bg-white/10 rounded-2xl p-1.5 md:p-2
                    ${
                      gameState.status === "playing"
                        ? "hover:bg-white/20 active:scale-95"
                        : ""
                    }
                    transition-all duration-200
                    ${shakeColumn === colIndex ? styles["shake"] : ""}
                  `}
                  aria-label={`Column ${colIndex + 1}, Row ${rowIndex + 1}`}
                >
                  <div className={getCellClasses(rowIndex, colIndex, cell)}>
                    <div
                      className={`w-full h-full rounded-full ${getCellBackground(
                        cell
                      )} shadow-lg`}
                      style={
                        cell !== null
                          ? {
                              boxShadow: `0 4px 6px -1px ${playerColors[cell].glow}, 0 2px 4px -1px ${playerColors[cell].glow}`,
                            }
                          : {}
                      }
                    />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex gap-4 justify-center flex-wrap">
        <button
          onClick={handleBackToMenu}
          className={`
            px-6 py-3 rounded-xl font-semibold text-white
            bg-gradient-to-r from-gray-500 to-gray-600
            hover:from-gray-600 hover:to-gray-700
            active:scale-95
            transition-all duration-200
            shadow-lg hover:shadow-xl
            ${styles["button-press"]}
          `}
        >
          ⬅️ Back to Menu
        </button>
        <button
          onClick={handleReset}
          className={`
            px-6 py-3 rounded-xl font-semibold text-white
            bg-gradient-to-r from-purple-500 to-pink-500
            hover:from-purple-600 hover:to-pink-600
            active:scale-95
            transition-all duration-200
            shadow-lg hover:shadow-xl
            ${styles["button-press"]}
          `}
        >
          {gameState.status !== "playing" ? "🎮 New Game" : "🔄 Reset Game"}
        </button>
      </div>

      {/* Player Legend */}
      <div className={`mt-8 ${styles["fade-in"]}`}>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <h3 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-400">
            Players
          </h3>
          <div className="flex gap-6 justify-center">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: playerColors[1].primary }}
              />
              <span className="text-sm font-medium">Player 1 (You)</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: playerColors[2].primary }}
              />
              <span className="text-sm font-medium">
                {gameMode === "ai" ? `AI (${aiDifficulty})` : "Player 2"}
                {gameMode === "ai" && " 🤖"}
              </span>
            </div>
          </div>
          {gameMode === "ai" && isAIThinking && (
            <div className="mt-3 text-center text-sm text-cyan-400">
              🤔 AI is thinking...
            </div>
          )}
        </div>
      </div>

      {/* Game Rules */}
      <div className={`mt-4 ${styles["fade-in"]}`}>
        <details className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <summary className="px-4 py-3 cursor-pointer font-medium text-sm hover:bg-white/5 transition-colors rounded-2xl">
            📖 How to Play
          </summary>
          <div className="px-4 pb-4 pt-2 text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>• Players take turns dropping colored discs into the grid</p>
            <p>• Discs fall to the lowest available position in the column</p>
            <p>• First player to get 4 discs in a row wins!</p>
            <p>• Rows can be horizontal, vertical, or diagonal</p>
            <p>• If the board fills up with no winner, it&apos;s a draw</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ConnectFour;
