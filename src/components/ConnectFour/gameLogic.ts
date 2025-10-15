/**
 * Connect Four Game Logic
 * Contains all the core game mechanics and win detection
 */

import type { Board, GameState, Player, Position } from "./types";

export const ROWS = 6;
export const COLS = 7;

/**
 * Creates an empty game board
 */
export const createEmptyBoard = (): Board => {
  return Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(null));
};

/**
 * Creates initial game state
 */
export const createInitialState = (): GameState => ({
  board: createEmptyBoard(),
  currentPlayer: 1,
  status: "playing",
  winner: null,
  winningCells: [],
  moveCount: 0,
});

/**
 * Finds the lowest available row in a column
 * Returns -1 if column is full
 */
export const findLowestRow = (board: Board, col: number): number => {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === null) {
      return row;
    }
  }
  return -1;
};

/**
 * Checks if a column is available for a move
 */
export const isValidMove = (board: Board, col: number): boolean => {
  return col >= 0 && col < COLS && board[0][col] === null;
};

/**
 * Checks for four in a row starting from a position
 */
const checkDirection = (
  board: Board,
  row: number,
  col: number,
  deltaRow: number,
  deltaCol: number,
  player: Player
): Position[] | null => {
  const positions: Position[] = [];

  for (let i = 0; i < 4; i++) {
    const newRow = row + deltaRow * i;
    const newCol = col + deltaCol * i;

    if (
      newRow < 0 ||
      newRow >= ROWS ||
      newCol < 0 ||
      newCol >= COLS ||
      board[newRow][newCol] !== player
    ) {
      return null;
    }

    positions.push({ row: newRow, col: newCol });
  }

  return positions;
};

/**
 * Checks all directions for a win from a given position
 */
export const checkWinFromPosition = (
  board: Board,
  row: number,
  col: number,
  player: Player
): Position[] | null => {
  const directions = [
    { deltaRow: 0, deltaCol: 1 }, // Horizontal
    { deltaRow: 1, deltaCol: 0 }, // Vertical
    { deltaRow: 1, deltaCol: 1 }, // Diagonal down-right
    { deltaRow: 1, deltaCol: -1 }, // Diagonal down-left
  ];

  for (const { deltaRow, deltaCol } of directions) {
    const result = checkDirection(board, row, col, deltaRow, deltaCol, player);
    if (result) {
      return result;
    }
  }

  return null;
};

/**
 * Checks if the board is full (draw)
 */
export const isBoardFull = (board: Board): boolean => {
  return board[0].every((cell) => cell !== null);
};

/**
 * Makes a move on the board
 * Returns updated game state
 */
export const makeMove = (state: GameState, col: number): GameState => {
  if (state.status !== "playing" || !isValidMove(state.board, col)) {
    return state;
  }

  const row = findLowestRow(state.board, col);
  if (row === -1) {
    return state;
  }

  // Create new board with the move
  const newBoard = state.board.map((rowArr, r) =>
    rowArr.map((cell, c) =>
      r === row && c === col ? state.currentPlayer : cell
    )
  );

  // Check for win
  const winningPositions = checkWinFromPosition(
    newBoard,
    row,
    col,
    state.currentPlayer
  );

  if (winningPositions) {
    return {
      ...state,
      board: newBoard,
      status: "won",
      winner: state.currentPlayer,
      winningCells: winningPositions.map((pos) => [pos.row, pos.col]),
      moveCount: state.moveCount + 1,
    };
  }

  // Check for draw
  if (isBoardFull(newBoard)) {
    return {
      ...state,
      board: newBoard,
      status: "draw",
      winner: null,
      winningCells: [],
      moveCount: state.moveCount + 1,
    };
  }

  // Continue game with next player
  return {
    ...state,
    board: newBoard,
    currentPlayer: state.currentPlayer === 1 ? 2 : 1,
    status: "playing",
    winner: null,
    winningCells: [],
    moveCount: state.moveCount + 1,
  };
};
