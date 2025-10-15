/**
 * Connect Four Game Types
 */

export type Player = 1 | 2;
export type Cell = Player | null;
export type Board = Cell[][];
export type GameStatus = "playing" | "won" | "draw";

export interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  winningCells: number[][];
  moveCount: number;
}

export interface Position {
  row: number;
  col: number;
}
