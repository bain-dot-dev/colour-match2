/**
 * Connect Four AI Logic
 * Implements AI opponents with different difficulty levels
 */

import type { Board, Player } from "./types";
import {
  ROWS,
  COLS,
  findLowestRow,
  isValidMove,
  checkWinFromPosition,
  isBoardFull,
} from "./gameLogic";

export type AIDifficulty = "easy" | "medium" | "hard";

/**
 * Gets a list of valid columns
 */
const getValidColumns = (board: Board): number[] => {
  const validCols: number[] = [];
  for (let col = 0; col < COLS; col++) {
    if (isValidMove(board, col)) {
      validCols.push(col);
    }
  }
  return validCols;
};

/**
 * Evaluates a position on the board
 * Higher score = better for AI
 */
const evaluatePosition = (
  board: Board,
  row: number,
  col: number,
  player: Player
): number => {
  let score = 0;

  // Center column preference
  const centerCol = Math.floor(COLS / 2);
  score += (3 - Math.abs(col - centerCol)) * 3;

  // Check all directions for potential wins
  const directions = [
    { deltaRow: 0, deltaCol: 1 }, // Horizontal
    { deltaRow: 1, deltaCol: 0 }, // Vertical
    { deltaRow: 1, deltaCol: 1 }, // Diagonal down-right
    { deltaRow: 1, deltaCol: -1 }, // Diagonal down-left
  ];

  for (const { deltaRow, deltaCol } of directions) {
    score += evaluateDirection(board, row, col, deltaRow, deltaCol, player);
  }

  return score;
};

/**
 * Evaluates a direction for scoring
 */
const evaluateDirection = (
  board: Board,
  row: number,
  col: number,
  deltaRow: number,
  deltaCol: number,
  player: Player
): number => {
  let score = 0;
  let playerCount = 0;
  let emptyCount = 0;
  let opponentCount = 0;

  // Check 4 consecutive cells in this direction
  for (let i = 0; i < 4; i++) {
    const newRow = row + deltaRow * i;
    const newCol = col + deltaCol * i;

    if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) {
      return 0;
    }

    const cell = board[newRow][newCol];
    if (cell === player) {
      playerCount++;
    } else if (cell === null) {
      emptyCount++;
    } else {
      opponentCount++;
    }
  }

  // Scoring based on patterns
  if (playerCount === 4) score += 100000; // Win
  else if (playerCount === 3 && emptyCount === 1)
    score += 100; // Three in a row
  else if (playerCount === 2 && emptyCount === 2) score += 10; // Two in a row

  // Block opponent
  if (opponentCount === 3 && emptyCount === 1)
    score += 90; // Block opponent win
  else if (opponentCount === 2 && emptyCount === 2) score += 5; // Block opponent two

  return score;
};

/**
 * Checks if a move results in an immediate win
 */
const isWinningMove = (board: Board, col: number, player: Player): boolean => {
  const row = findLowestRow(board, col);
  if (row === -1) return false;

  // Temporarily place the piece
  const testBoard = board.map((r) => [...r]);
  testBoard[row][col] = player;

  return checkWinFromPosition(testBoard, row, col, player) !== null;
};

/**
 * Easy AI: Random valid move
 */
const getEasyMove = (board: Board, _player: Player): number => {
  const validCols = getValidColumns(board);
  return validCols[Math.floor(Math.random() * validCols.length)];
};

/**
 * Medium AI: Blocks wins and tries to win, otherwise random
 */
const getMediumMove = (board: Board, player: Player): number => {
  const validCols = getValidColumns(board);
  const opponent: Player = player === 1 ? 2 : 1;

  // 1. Check if AI can win
  for (const col of validCols) {
    if (isWinningMove(board, col, player)) {
      return col;
    }
  }

  // 2. Block opponent's winning move
  for (const col of validCols) {
    if (isWinningMove(board, col, opponent)) {
      return col;
    }
  }

  // 3. Otherwise, random move
  return validCols[Math.floor(Math.random() * validCols.length)];
};

/**
 * Hard AI: Minimax algorithm with alpha-beta pruning
 */
const getHardMove = (board: Board, player: Player): number => {
  const validCols = getValidColumns(board);
  const opponent: Player = player === 1 ? 2 : 1;

  // 1. Check for immediate win
  for (const col of validCols) {
    if (isWinningMove(board, col, player)) {
      return col;
    }
  }

  // 2. Block opponent's winning move
  for (const col of validCols) {
    if (isWinningMove(board, col, opponent)) {
      return col;
    }
  }

  // 3. Use minimax for best move
  let bestScore = -Infinity;
  let bestCol = validCols[0];

  for (const col of validCols) {
    const row = findLowestRow(board, col);
    if (row === -1) continue;

    // Simulate move
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = player;

    // Evaluate position
    const score = minimaxEvaluate(
      newBoard,
      3,
      false,
      player,
      -Infinity,
      Infinity
    );

    if (score > bestScore) {
      bestScore = score;
      bestCol = col;
    }
  }

  return bestCol;
};

/**
 * Minimax algorithm with alpha-beta pruning
 */
const minimaxEvaluate = (
  board: Board,
  depth: number,
  isMaximizing: boolean,
  player: Player,
  alpha: number,
  beta: number
): number => {
  const opponent: Player = player === 1 ? 2 : 1;
  const validCols = getValidColumns(board);

  // Check terminal states
  for (const col of validCols) {
    const row = findLowestRow(board, col);
    if (row !== -1) {
      const testBoard = board.map((r) => [...r]);
      testBoard[row][col] = player;
      if (checkWinFromPosition(testBoard, row, col, player)) {
        return isMaximizing ? 10000 : -10000;
      }

      testBoard[row][col] = opponent;
      if (checkWinFromPosition(testBoard, row, col, opponent)) {
        return isMaximizing ? -10000 : 10000;
      }
    }
  }

  if (depth === 0 || isBoardFull(board) || validCols.length === 0) {
    return evaluateBoardState(board, player);
  }

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const col of validCols) {
      const row = findLowestRow(board, col);
      if (row === -1) continue;

      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = player;

      const score = minimaxEvaluate(
        newBoard,
        depth - 1,
        false,
        player,
        alpha,
        beta
      );
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);

      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const col of validCols) {
      const row = findLowestRow(board, col);
      if (row === -1) continue;

      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = opponent;

      const score = minimaxEvaluate(
        newBoard,
        depth - 1,
        true,
        player,
        alpha,
        beta
      );
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);

      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minScore;
  }
};

/**
 * Evaluates the overall board state
 */
const evaluateBoardState = (board: Board, player: Player): number => {
  let score = 0;

  // Evaluate all positions
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col] === player) {
        score += evaluatePosition(board, row, col, player);
      } else if (board[row][col] !== null) {
        score -= evaluatePosition(board, row, col, player === 1 ? 2 : 1);
      }
    }
  }

  return score;
};

/**
 * Main AI move function
 * Returns the column for AI's next move
 */
export const getAIMove = (
  board: Board,
  player: Player,
  difficulty: AIDifficulty
): number => {
  const validCols = getValidColumns(board);

  if (validCols.length === 0) {
    return 0; // No valid moves
  }

  // Add slight delay randomization for more natural feel
  const moveDelay = Math.random() * 300 + 200;

  switch (difficulty) {
    case "easy":
      return getEasyMove(board, player);
    case "medium":
      return getMediumMove(board, player);
    case "hard":
      return getHardMove(board, player);
    default:
      return getEasyMove(board, player);
  }
};

/**
 * Returns a human-readable description of the AI difficulty
 */
export const getDifficultyDescription = (difficulty: AIDifficulty): string => {
  switch (difficulty) {
    case "easy":
      return "Random moves - Perfect for beginners";
    case "medium":
      return "Blocks wins and tries to win - Good challenge";
    case "hard":
      return "Advanced strategy - Very challenging!";
    default:
      return "";
  }
};
