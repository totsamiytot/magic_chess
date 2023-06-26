import store from "../redux/store";
import {BoardLettersByNumber, Colors, FigureData, Figures, TCellsFigure} from "types";
import {MutableRefObject} from "react";
import {useGameRules} from "./useGameRules";
import {useAppSelector} from "../redux/hooks";
import {selectColor, selectFigures} from "../redux/gameSlice";

// нельзя хуки использовать вне функций создания компонентов - правило реакта, плюс здесь вообще не надо использовать хуки
const {getAvailableCells, moveOrEat} = useGameRules();

export const useAIMove = () => {
    // правильный вариант
    // const figures = useAppSelector(selectFigures);

    // нужно точно так же, как cellsFigure, moveOn и тд засунуть функции в аргументы, я про это говорил
    const nextAIMove = (cellsFigure: TCellsFigure,
                        moveOn: (figure: FigureData, x: number, y: number) => void,
                        dangerousCells: MutableRefObject<{ white: { [key: string]: boolean }; black: { [key: string]: boolean } }>,
                        // таким образом:
                        // getAvailableCells: (dangerousCells: MutableRefObject<{ white: { [p: string]: boolean }, black: { [p: string]: boolean } }>, cellsFigure: TCellsFigure, figure: FigureData, isForDangerousCells?: boolean) => {},
                        // moveOrEat: (cellsFigure: TCellsFigure, moveOn: (figure: FigureData, x: number, y: number) => void, figure: FigureData, x: number, y: number) => void,
                        // sides: { ally: Colors, enemy: Colors }
    ) => {
        // это объявлять здесь нельзя, если это надо использовать, то все закидываем через аргументы,либо на крайний случай, то юзаем в хуке, а не в функциях
        const gameColor = useAppSelector(selectColor);

        // это точно в аргументы
        const sides = {
            ally: gameColor,
            enemy: gameColor === Colors.WHITE ? Colors.BLACK : Colors.WHITE,
        };

        // вообще неправильно объявил
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

    // плюс функцию надо возвращать в конце хука, так как мы должны из хука эту функцию забирать
    // return {nextAIMove}
}