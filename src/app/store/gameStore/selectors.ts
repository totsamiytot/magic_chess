import {RootState} from "./store";

export const selectFigures = (state: RootState) => state.game.figures;
export const selectColor = (state: RootState) => state.game.color;
export const selectGameWon = (state: RootState) => state.game.gameWon;
export const selectIsGameStarted = (state: RootState) => state.game.isGameStarted;