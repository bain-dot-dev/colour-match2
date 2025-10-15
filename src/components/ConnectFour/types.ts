/**
 * Connect Four Game Types
 */

export type Player = 1 | 2;
export type Cell = Player | null;
export type Board = Cell[][];
export type GameStatus = "playing" | "won" | "draw";
export type GameMode = "pvp" | "ai";
export type AIDifficulty = "easy" | "medium" | "hard";

export interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  winningCells: number[][];
  moveCount: number;
}

export interface GameSettings {
  mode: GameMode;
  difficulty?: AIDifficulty;
  aiPlayer: Player; // Which player is AI (1 or 2)
}

export interface Position {
  row: number;
  col: number;
}
