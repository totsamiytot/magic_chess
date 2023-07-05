import { MutableRefObject } from "react";
import { useAppSelector } from "../hooks/useRedux";
import { selectFigures } from "../../app/store/gameStore/selectors";
import { Colors, FigureData, TCellsFigure } from "app/types";

type DangerousCells = {
  white: { [key: string]: boolean };
  black: { [key: string]: boolean };
};
type Sides = { ally: Colors; enemy: Colors };

export const useAIMove = () => {
  const figures = useAppSelector(selectFigures);

  const nextAIMove = (
    cellsFigure: TCellsFigure,
    moveOn: (figure: FigureData, x: number, y: number) => void,
    dangerousCells: MutableRefObject<DangerousCells>,
    moveOrEat: (
      cellsFigure: TCellsFigure,
      moveOn: (figure: FigureData, x: number, y: number) => void,
      figure: FigureData,
      x: number,
      y: number
    ) => void,
    sides: Sides,
    getAvailableCells: (
      dangerousCells: MutableRefObject<DangerousCells>,
      cellsFigure: TCellsFigure,
      figure: FigureData
    ) => { [key: string]: boolean }
  ) => {
    const getRandomElementOfArray = <T extends string>(arr: T[]): T => {
      return arr[Math.floor(Math.random() * arr.length)];
    };

    const figuresIds = Object.keys(figures);

    if (figuresIds.length < 1) return;

    const enemyFiguresIds = figuresIds.filter(
      (id) => figures[id].color === sides.enemy
    );

    let randomFigureId = getRandomElementOfArray(enemyFiguresIds);
    let availableCells = getAvailableCells(
      dangerousCells,
      cellsFigure,
      figures[randomFigureId]
    );

    let availableCellsArr = Object.keys(availableCells);
    const triedFiguresIds: string[] = [];

    while (availableCellsArr.length < 1) {
      if (triedFiguresIds.length >= enemyFiguresIds.length) return;
      randomFigureId = getRandomElementOfArray(enemyFiguresIds);
      availableCells = getAvailableCells(
        dangerousCells,
        cellsFigure,
        figures[randomFigureId]
      );

      availableCellsArr = Object.keys(availableCells);

      triedFiguresIds.push(randomFigureId);
    }
    const cellForMove = getRandomElementOfArray(availableCellsArr);
    const [x, y] = cellForMove.split("-");
    moveOrEat(
      cellsFigure,
      moveOn,
      figures[randomFigureId],
      Number(x),
      Number(y)
    );
  };

  return { nextAIMove };
};
