import store from "../redux/store";
import {BoardLettersByNumber, Colors, FigureData, Figures, TCellsFigure} from "types";
import {MutableRefObject} from "react";
import {useGameRules} from "./useGameRules";
import {useAppSelector} from "../redux/hooks";
import {selectColor} from "../redux/gameSlice";

const {getAvailableCells, moveOrEat} = useGameRules();
export const useAIMove = () => {

    const nextAIMove = (cellsFigure: TCellsFigure,
                        moveOn: (figure: FigureData, x: number, y: number) => void,
                        dangerousCells: MutableRefObject<{ white: { [key: string]: boolean }; black: { [key: string]: boolean } }>) => {
        const gameColor = useAppSelector(selectColor);
        const sides = {
            ally: gameColor,
            enemy: gameColor === Colors.WHITE ? Colors.BLACK : Colors.WHITE,
        };


        const figures = store.getState().game.figures;

        const getRandomElementOfArray = <T extends unknown>(arr: T[]): T => {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        const figuresIds = Object.keys(figures);
        if (figuresIds.length < 1) return;
        const enemyFiguresIds = figuresIds.filter(id => figures[id].color === sides.enemy);
        let randomFigureId = getRandomElementOfArray(enemyFiguresIds);
        let availableCells = getAvailableCells(dangerousCells, cellsFigure, figures[randomFigureId]);
        let availableCellsArr = Object.keys(availableCells);
        const triedFiguresIds: string[] = [];
        while (availableCellsArr.length < 1) {
            if (triedFiguresIds.length >= enemyFiguresIds.length) return;
            randomFigureId = getRandomElementOfArray(enemyFiguresIds);
            availableCells = getAvailableCells(dangerousCells, cellsFigure, figures[randomFigureId]);
            availableCellsArr = Object.keys(availableCells);
            triedFiguresIds.push(randomFigureId);
        }
        const cellForMove = getRandomElementOfArray(availableCellsArr);
        const [x, y] = cellForMove.split('-');
        moveOrEat(cellsFigure, moveOn, figures[randomFigureId], Number(x), Number(y));
    }
}