"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { createInitialState, makeMove, isValidMove, findLowestRow } from "./gameLogic"
import { getAIMove, getDifficultyDescription } from "./aiLogic"
import type { GameState, GameMode, AIDifficulty } from "./types"
import styles from "./ConnectFour.module.css"

// Retro arcade neon colors
const playerColors = {
  1: {
    primary: "#FF00FF", // Magenta
    secondary: "#FF1493",
    glow: "rgba(255, 0, 255, 0.6)",
    name: "PLAYER 1",
  },
  2: {
    primary: "#00FFFF", // Cyan
    secondary: "#00CED1",
    glow: "rgba(0, 255, 255, 0.6)",
    name: "PLAYER 2",
  },
} as const

export const ConnectFour = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialState())
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null)
  const [animatingCell, setAnimatingCell] = useState<string | null>(null)
  const [shakeColumn, setShakeColumn] = useState<number | null>(null)
  const [gameMode, setGameMode] = useState<GameMode | null>(null)
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>("medium")
  const [isAIThinking, setIsAIThinking] = useState(false)

  const handleReset = useCallback(() => {
    setGameState(createInitialState())
    setHoveredColumn(null)
    setAnimatingCell(null)
    setShakeColumn(null)
    setIsAIThinking(false)
  }, [])

  const handleStartGame = useCallback((mode: GameMode) => {
    setGameMode(mode)
    setGameState(createInitialState())
  }, [])

  const handleBackToMenu = useCallback(() => {
    setGameMode(null)
    setGameState(createInitialState())
    setIsAIThinking(false)
  }, [])

  // AI move logic
  useEffect(() => {
    if (gameMode === "ai" && gameState.status === "playing" && gameState.currentPlayer === 2 && !isAIThinking) {
      setIsAIThinking(true)
      const delay = aiDifficulty === "easy" ? 500 : aiDifficulty === "medium" ? 800 : 1200

      const timeoutId = setTimeout(() => {
        const aiCol = getAIMove(gameState.board, 2, aiDifficulty)
        const row = findLowestRow(gameState.board, aiCol)

        if (row !== -1) {
          const cellKey = `${row}-${aiCol}`
          setAnimatingCell(cellKey)

          setTimeout(() => {
            setGameState((prev) => makeMove(prev, aiCol))
            setAnimatingCell(null)
            setIsAIThinking(false)
          }, 600)
        } else {
          setIsAIThinking(false)
        }
      }, delay)

      return () => clearTimeout(timeoutId)
    }
  }, [gameState.moveCount, gameMode, aiDifficulty, isAIThinking, gameState.status, gameState.currentPlayer])

  const handleColumnClick = useCallback(
    (col: number) => {
      if (gameState.status !== "playing" || isAIThinking) return
      if (gameMode === "ai" && gameState.currentPlayer === 2) return

      if (!isValidMove(gameState.board, col)) {
        setShakeColumn(col)
        setTimeout(() => setShakeColumn(null), 300)
        return
      }

      const row = findLowestRow(gameState.board, col)
      const cellKey = `${row}-${col}`
      setAnimatingCell(cellKey)

      setTimeout(() => {
        setGameState((prev) => makeMove(prev, col))
        setAnimatingCell(null)
      }, 600)
    },
    [gameState, isAIThinking, gameMode],
  )

  const getCellClasses = useCallback(
    (row: number, col: number, value: number | null) => {
      const cellKey = `${row}-${col}`
      const isWinning = gameState.winningCells.some(([r, c]) => r === row && c === col)
      const isAnimating = animatingCell === cellKey

      let classes = "relative w-full aspect-square rounded-full transition-all duration-300 "

      if (value !== null) {
        classes += isAnimating ? styles["disc-drop"] : ""
        classes += isWinning ? ` ${styles["win-pulse"]}` : ""
      }

      return classes
    },
    [gameState.winningCells, animatingCell],
  )

  const getCellBackground = useCallback((value: number | null) => {
    if (value === null) {
      return "bg-black/40 border-2 border-cyan-500/20"
    }
    return value === 1 ? "bg-[#FF00FF]" : "bg-[#00FFFF]"
  }, [])

  const currentColor = useMemo(() => playerColors[gameState.currentPlayer], [gameState.currentPlayer])

  // Mode Selection Screen
  if (gameMode === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Retro Header */}
          <div className={`text-center mb-12 ${styles["slide-down"]}`}>
            <h1
              className={`text-6xl md:text-7xl font-bold mb-4 ${styles["neon-text"]} font-mono tracking-wider`}
              style={{
                color: "#FFD700",
                textShadow:
                  "0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700, 0 0 40px #FF00FF, 0 0 70px #FF00FF, 0 0 80px #FF00FF, 0 0 100px #FF00FF",
              }}
            >
              CONNECT 4
            </h1>
            <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm md:text-base font-mono">
              <span className="animate-pulse">▶</span>
              <p>ARCADE EDITION</p>
              <span className="animate-pulse">◀</span>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="space-y-6 mb-8">
            <button
              onClick={() => handleStartGame("pvp")}
              className={`
                w-full p-8 rounded-xl relative overflow-hidden
                bg-gradient-to-r from-purple-900/50 to-pink-900/50
                border-4 border-purple-500
                hover:border-pink-500
                text-white font-bold text-xl md:text-2xl font-mono
                shadow-[0_0_30px_rgba(255,0,255,0.5)]
                hover:shadow-[0_0_50px_rgba(255,0,255,0.8)]
                transition-all duration-300
                active:scale-95
                ${styles["crt-effect"]}
              `}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <span className="text-4xl">👥</span>
                  <span className={styles["neon-text"]} style={{ color: "#FF00FF" }}>
                    PLAYER VS PLAYER
                  </span>
                </div>
                <p className="text-sm text-purple-300 font-normal">Challenge a friend locally</p>
              </div>
            </button>

            <button
              onClick={() => handleStartGame("ai")}
              className={`
                w-full p-8 rounded-xl relative overflow-hidden
                bg-gradient-to-r from-cyan-900/50 to-blue-900/50
                border-4 border-cyan-500
                hover:border-blue-500
                text-white font-bold text-xl md:text-2xl font-mono
                shadow-[0_0_30px_rgba(0,255,255,0.5)]
                hover:shadow-[0_0_50px_rgba(0,255,255,0.8)]
                transition-all duration-300
                active:scale-95
                ${styles["crt-effect"]}
              `}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <span className="text-4xl">🤖</span>
                  <span className={styles["neon-text"]} style={{ color: "#00FFFF" }}>
                    PLAYER VS AI
                  </span>
                </div>
                <p className="text-sm text-cyan-300 font-normal">Battle the computer</p>
              </div>
            </button>
          </div>

          {/* AI Difficulty */}
          <div className={`${styles["arcade-frame"]} ${styles["crt-effect"]}`}>
            <h3
              className="text-xl font-bold mb-6 text-center font-mono"
              style={{
                color: "#FFD700",
                textShadow: "0 0 10px #FFD700, 0 0 20px #FFD700",
              }}
            >
              ⚙️ AI DIFFICULTY ⚙️
            </h3>
            <div className="space-y-4">
              {(["easy", "medium", "hard"] as AIDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setAiDifficulty(diff)}
                  className={`
                    w-full p-5 rounded-lg text-left font-mono
                    transition-all duration-200 border-2
                    ${
                      aiDifficulty === diff
                        ? "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.5)]"
                        : "bg-black/30 border-gray-600 hover:border-gray-400"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div
                        className="font-bold text-lg uppercase mb-1"
                        style={{
                          color: diff === "easy" ? "#00FF00" : diff === "medium" ? "#FFD700" : "#FF0000",
                        }}
                      >
                        {diff === "easy" && "🟢 "}
                        {diff === "medium" && "🟡 "}
                        {diff === "hard" && "🔴 "}
                        {diff}
                      </div>
                      <div className="text-sm text-gray-400">{getDifficultyDescription(diff)}</div>
                    </div>
                    {aiDifficulty === diff && <span className="text-2xl animate-pulse">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Game Screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Game Header */}
        <div className={`text-center mb-6 ${styles["slide-down"]}`}>
          <h1
            className={`text-5xl md:text-6xl font-bold mb-2 ${styles["neon-text"]} font-mono`}
            style={{
              color: "#FFD700",
              textShadow: "0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700, 0 0 40px #FF00FF",
            }}
          >
            CONNECT 4
          </h1>
          <p className="text-cyan-400 text-sm font-mono flex items-center justify-center gap-2">
            <span className="animate-pulse">▶</span>
            DROP DISCS TO GET 4 IN A ROW
            <span className="animate-pulse">◀</span>
          </p>
        </div>

        {/* Status Display */}
        <div className={`mb-6 ${styles["fade-in"]}`}>
          <div className={`${styles["arcade-frame"]} ${styles["crt-effect"]}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Current Player */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-gray-400">CURRENT:</span>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full ${styles["glow-effect"]} border-2`}
                    style={{
                      backgroundColor: currentColor.primary,
                      borderColor: currentColor.primary,
                      boxShadow: `0 0 20px ${currentColor.glow}, 0 0 40px ${currentColor.glow}`,
                    }}
                  />
                  <span className="text-xl font-bold font-mono" style={{ color: currentColor.primary }}>
                    {gameMode === "ai" && gameState.currentPlayer === 2
                      ? "AI 🤖"
                      : gameMode === "ai" && gameState.currentPlayer === 1
                        ? "YOU"
                        : currentColor.name}
                  </span>
                </div>
              </div>

              {/* Move Counter */}
              <div className="text-sm font-mono">
                <span className="text-gray-400">MOVES: </span>
                <span
                  className="font-bold text-xl"
                  style={{
                    color: "#FFD700",
                    textShadow: "0 0 10px #FFD700",
                  }}
                >
                  {gameState.moveCount}
                </span>
              </div>
            </div>

            {/* Game Over Message */}
            {gameState.status !== "playing" && (
              <div className={`mt-4 ${styles["bounce-in"]}`}>
                <div
                  className={`text-center py-4 px-6 rounded-xl font-bold text-2xl font-mono border-4 ${styles["neon-text"]}`}
                  style={{
                    background:
                      gameState.status === "won"
                        ? `linear-gradient(135deg, ${
                            playerColors[gameState.winner!].primary
                          }20, ${playerColors[gameState.winner!].secondary}20)`
                        : "linear-gradient(135deg, #FFD70020, #FFA50020)",
                    borderColor: gameState.status === "won" ? playerColors[gameState.winner!].primary : "#FFD700",
                    color: gameState.status === "won" ? playerColors[gameState.winner!].primary : "#FFD700",
                    boxShadow:
                      gameState.status === "won"
                        ? `0 0 30px ${playerColors[gameState.winner!].glow}`
                        : "0 0 30px rgba(255, 215, 0, 0.5)",
                  }}
                >
                  {gameState.status === "won"
                    ? gameMode === "ai"
                      ? gameState.winner === 1
                        ? "🎉 VICTORY! 🎉"
                        : "💀 AI WINS! 💀"
                      : `🎉 ${playerColors[gameState.winner!].name} WINS! 🎉`
                    : "🤝 DRAW GAME! 🤝"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Game Board */}
        <div className={`mb-6 ${styles["board-entrance"]}`}>
          <div className={`${styles["arcade-frame"]} ${styles["crt-effect"]} relative`}>
            {/* Column Preview */}
            {hoveredColumn !== null &&
              gameState.status === "playing" &&
              isValidMove(gameState.board, hoveredColumn) &&
              !isAIThinking && (
                <div className="absolute top-0 left-0 right-0 pointer-events-none z-20 p-2">
                  <div className="grid grid-cols-7 gap-3 md:gap-4">
                    {Array.from({ length: 7 }).map((_, colIndex) => (
                      <div
                        key={colIndex}
                        className="aspect-square flex items-center justify-center"
                        style={{
                          visibility: colIndex === hoveredColumn ? "visible" : "hidden",
                        }}
                      >
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${styles["preview-disc"]} border-2`}
                          style={{
                            backgroundColor: currentColor.primary,
                            borderColor: currentColor.primary,
                            opacity: 0.7,
                            boxShadow: `0 0 20px ${currentColor.glow}`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Board Grid */}
            <div className="grid grid-cols-7 gap-3 md:gap-4 p-2">
              {gameState.board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleColumnClick(colIndex)}
                    onMouseEnter={() => setHoveredColumn(colIndex)}
                    onMouseLeave={() => setHoveredColumn(null)}
                    disabled={gameState.status !== "playing" || isAIThinking}
                    className={`
                      aspect-square bg-black/60 rounded-xl p-2
                      border-2 border-cyan-500/30
                      ${
                        gameState.status === "playing" && !isAIThinking
                          ? "hover:bg-cyan-500/10 hover:border-cyan-400 active:scale-90 cursor-pointer"
                          : "cursor-not-allowed"
                      }
                      transition-all duration-200
                      ${shakeColumn === colIndex ? styles["shake"] : ""}
                    `}
                  >
                    <div className={getCellClasses(rowIndex, colIndex, cell)}>
                      <div
                        className={`w-full h-full rounded-full ${getCellBackground(cell)}`}
                        style={
                          cell !== null
                            ? {
                                boxShadow: `0 0 15px ${playerColors[cell].glow}, 0 0 30px ${playerColors[cell].glow}, inset 0 0 10px rgba(255,255,255,0.3)`,
                              }
                            : {}
                        }
                      />
                    </div>
                  </button>
                )),
              )}
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex gap-4 justify-center flex-wrap mb-6">
          <button
            onClick={handleBackToMenu}
            className={`
              px-8 py-4 rounded-xl font-bold text-lg font-mono
              bg-gradient-to-r from-gray-800 to-gray-900
              border-2 border-gray-600
              hover:border-gray-400
              text-white
              shadow-[0_0_20px_rgba(128,128,128,0.3)]
              hover:shadow-[0_0_30px_rgba(128,128,128,0.5)]
              active:scale-95
              transition-all duration-200
            `}
          >
            ⬅️ MENU
          </button>
          <button
            onClick={handleReset}
            className={`
              px-8 py-4 rounded-xl font-bold text-lg font-mono
              bg-gradient-to-r from-yellow-600 to-orange-600
              border-2 border-yellow-400
              hover:border-yellow-300
              text-white
              shadow-[0_0_20px_rgba(255,215,0,0.5)]
              hover:shadow-[0_0_40px_rgba(255,215,0,0.8)]
              active:scale-95
              transition-all duration-200
              ${styles["neon-text"]}
            `}
            style={{ color: "#FFD700" }}
          >
            {gameState.status !== "playing" ? "🎮 NEW GAME" : "🔄 RESET"}
          </button>
        </div>

        {/* Player Legend */}
        <div className={`${styles["fade-in"]}`}>
          <div className={`${styles["arcade-frame"]} ${styles["crt-effect"]}`}>
            <h3 className="text-sm font-bold mb-4 text-center font-mono text-gray-400">PLAYERS</h3>
            <div className="flex gap-8 justify-center flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2"
                  style={{
                    backgroundColor: playerColors[1].primary,
                    borderColor: playerColors[1].primary,
                    boxShadow: `0 0 15px ${playerColors[1].glow}`,
                  }}
                />
                <span className="font-bold font-mono" style={{ color: playerColors[1].primary }}>
                  {gameMode === "ai" ? "YOU" : "PLAYER 1"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2"
                  style={{
                    backgroundColor: playerColors[2].primary,
                    borderColor: playerColors[2].primary,
                    boxShadow: `0 0 15px ${playerColors[2].glow}`,
                  }}
                />
                <span className="font-bold font-mono" style={{ color: playerColors[2].primary }}>
                  {gameMode === "ai" ? `AI (${aiDifficulty.toUpperCase()})` : "PLAYER 2"}
                  {gameMode === "ai" && " 🤖"}
                </span>
              </div>
            </div>
            {gameMode === "ai" && isAIThinking && (
              <div className="mt-4 text-center text-sm font-mono text-cyan-400 animate-pulse">🤔 AI COMPUTING...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
