import {Colors, FigureData} from "app/types";

export interface GameState {
    color: Colors;
    figures: { [key: string]: FigureData };
    gameWon: Colors | null;
    isGameStarted: boolean;
}