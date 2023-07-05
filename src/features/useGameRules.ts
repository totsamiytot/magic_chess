import React, { Dispatch, MutableRefObject } from "react";
import {
  removeFigure,
  setGameStarted,
  setGameWon,
} from "app/store/gameStore/gameSlice";
import { useAppDispatch } from "shared/hooks/useRedux";
import { Colors, FigureData, Figures, TCellsFigure } from "app/types";

export const useGameRules = () => {
  const dispatch = useAppDispatch();

  const endGame = (winner: Colors) => {
    dispatch(setGameWon(winner));
    dispatch(setGameStarted(false));
  };
  
  const eatFigure = (cellsFigure: TCellsFigure, figure: FigureData): void => {
    cellsFigure[`${figure.x}-${figure.y}`] = null;
    if (figure.name === Figures.KING) {
      endGame(getOtherColor(figure.color));
    }
    dispatch(removeFigure(figure));
  };

  const getOtherColor = (color: Colors) => {
    return color === Colors.BLACK ? Colors.WHITE : Colors.BLACK;
  };

  const moveOrEat = (
    cellsFigure: TCellsFigure,
    moveOn: (figure: FigureData, x: number, y: number) => void,
    figure: FigureData,
    x: number,
    y: number
  ): void => {
    const figureOnCell = cellsFigure[`${x}-${y}`];
    if (figureOnCell && figureOnCell.color !== figure.color)
      eatFigure(cellsFigure, figureOnCell);
    moveOn(figure, x, y);
  };

  const getAvailableCells = (
    dangerousCells: MutableRefObject<{
      white: { [key: string]: boolean };
      black: { [key: string]: boolean };
    }>,
    cellsFigure: TCellsFigure,
    figure: FigureData,
    isForDangerousCells: boolean = false
  ): { [key: string]: boolean } => {
    let way: { y: number; x: number }[] = [];

    const toStopWay = (x: number, y: number): boolean => {
      if (cellsFigure[`${x}-${y}`] === undefined) return true;
      return !!cellsFigure[`${x}-${y}`];
    };

    const checkCellForMove = (x: number, y: number): boolean => {
      if (toStopWay(x, y)) return false;
      way.push({ x, y });
      return true;
    };

    const verticalTop = (toY: number, fromY: number = figure.y) => {
      for (let i = fromY + 1; i <= toY; i++) {
        if (toStopWay(figure.x, i)) return;
        way.push({ y: i, x: figure.x });
      }
    };

    const verticalBottom = (toY: number, fromY: number = figure.y) => {
      for (let i = fromY - 1; i >= toY; i--) {
        if (toStopWay(figure.x, i)) return;
        way.push({ y: i, x: figure.x });
      }
    };

    const horizontalLeft = (toX: number, fromX: number = figure.x) => {
      for (let i = fromX - 1; i >= toX; i--) {
        if (toStopWay(i, figure.y)) return;
        way.push({ x: i, y: figure.y });
      }
    };

    const horizontalRight = (toX: number, fromX: number = figure.x) => {
      for (let i = fromX + 1; i <= toX; i++) {
        if (toStopWay(i, figure.y)) return;
        way.push({ x: i, y: figure.y });
      }
    };

    const checkDiagonal = () => {
      // top right
      for (let i = 1; i <= 8; i++) {
        if (!checkCellForMove(figure.x + i, figure.y + i)) break;
      }
      // bottom right
      for (let i = 1; i <= 8; i++) {
        if (!checkCellForMove(figure.x + i, figure.y - i)) break;
      }
      // bottom left
      for (let i = 1; i <= 8; i++) {
        if (!checkCellForMove(figure.x - i, figure.y - i)) break;
      }
      for (let i = 1; i <= 8; i++) {
        if (!checkCellForMove(figure.x - i, figure.y + i)) break;
      }
    };

    const checkEatableFiguresByDiagonal = () => {
      for (let i = 1; i <= 8; i++) {
        if (checkEatableOrAlliesCell(figure.x + i, figure.y + i)) break;
      }
      // bottom right
      for (let i = 1; i <= 8; i++) {
        if (checkEatableOrAlliesCell(figure.x + i, figure.y - i)) break;
      }
      // bottom left
      for (let i = 1; i <= 8; i++) {
        if (checkEatableOrAlliesCell(figure.x - i, figure.y - i)) break;
      }
      for (let i = 1; i <= 8; i++) {
        if (checkEatableOrAlliesCell(figure.x - i, figure.y + i)) break;
      }
    };

    const isEatableCell = (x: number, y: number): boolean => {
      return !!(
        cellsFigure[`${x}-${y}`] &&
        figure.color !== cellsFigure[`${x}-${y}`]?.color
      );
    };

    const checkEatableCell = (x: number, y: number): boolean => {
      if (isEatableCell(x, y)) {
        way.push({ x, y });
        return true;
      }
      return false;
    };

    const checkEatableOrAlliesCell = (x: number, y: number): boolean => {
      if (
        cellsFigure[`${x}-${y}`] &&
        cellsFigure[`${x}-${y}`]?.color === figure.color
      )
        return true;
      if (isEatableCell(x, y)) {
        way.push({ x, y });
        return true;
      }
      return false;
    };

    // PAWN
    const checkEatableFiguresByPawn = () => {
      if (figure.color === Colors.BLACK) {
        checkEatableCell(figure.x - 1, figure.y - 1);
        checkEatableCell(figure.x + 1, figure.y - 1);
      } else {
        checkEatableCell(figure.x - 1, figure.y + 1);
        checkEatableCell(figure.x + 1, figure.y + 1);
      }
    };

    if (figure.name === Figures.PAWN) {
      if (figure.color === Colors.BLACK) {
        if (!isForDangerousCells) {
          verticalBottom(figure.y - 2);
        } else {
          way.push({ y: figure.y - 1, x: figure.x - 1 });
          way.push({ y: figure.y - 1, x: figure.x + 1 });
        }
      }
      if (figure.color === Colors.WHITE) {
        if (!isForDangerousCells) {
          verticalTop(figure.y + 2);
        } else {
          way.push({ y: figure.y + 1, x: figure.x - 1 });
          way.push({ y: figure.y + 1, x: figure.x + 1 });
        }
      }
      checkEatableFiguresByPawn();
    }

    // ROOK
    const checkEatableFiguresByRook = () => {
      // check top
      for (let i = figure.y + 1; i <= 8; i++) {
        if (checkEatableOrAlliesCell(figure.x, i)) break;
      }
      // check bottom
      for (let i = figure.y - 1; i >= 0; i--) {
        if (checkEatableOrAlliesCell(figure.x, i)) break;
      }
      // check left
      for (let i = figure.x - 1; i >= 0; i--) {
        if (checkEatableOrAlliesCell(i, figure.y)) break;
      }
      // check right
      for (let i = figure.x + 1; i <= 8; i++) {
        if (checkEatableOrAlliesCell(i, figure.y)) break;
      }
    };

    if (figure.name === Figures.ROOK) {
      verticalBottom(0);
      verticalTop(8);
      horizontalLeft(0);
      horizontalRight(8);
      checkEatableFiguresByRook();
    }

    // KNIGHT
    const checkMovesByKnight = () => {
      checkCellForMove(figure.x + 1, figure.y + 2);
      checkCellForMove(figure.x - 1, figure.y + 2);
      checkCellForMove(figure.x + 2, figure.y + 1);
      checkCellForMove(figure.x + 2, figure.y - 1);
      checkCellForMove(figure.x + 1, figure.y - 2);
      checkCellForMove(figure.x - 1, figure.y - 2);
      checkCellForMove(figure.x - 2, figure.y - 1);
      checkCellForMove(figure.x - 2, figure.y + 1);
    };

    const checkEatableFiguresByKnight = () => {
      checkEatableOrAlliesCell(figure.x + 1, figure.y + 2);
      checkEatableOrAlliesCell(figure.x - 1, figure.y + 2);
      checkEatableOrAlliesCell(figure.x + 2, figure.y + 1);
      checkEatableOrAlliesCell(figure.x + 2, figure.y - 1);
      checkEatableOrAlliesCell(figure.x + 1, figure.y - 2);
      checkEatableOrAlliesCell(figure.x - 1, figure.y - 2);
      checkEatableOrAlliesCell(figure.x - 2, figure.y - 1);
      checkEatableOrAlliesCell(figure.x - 2, figure.y + 1);
    };

    if (figure.name === Figures.KNIGHT) {
      checkMovesByKnight();
      checkEatableFiguresByKnight();
    }

    // BISHOP
    if (figure.name === Figures.BISHOP) {
      checkDiagonal();
      checkEatableFiguresByDiagonal();
    }

    // QUEEN
    if (figure.name === Figures.QUEEN) {
      checkDiagonal();
      checkEatableFiguresByDiagonal();
      verticalBottom(0);
      verticalTop(8);
      horizontalLeft(0);
      horizontalRight(8);
      checkEatableFiguresByRook();
    }

    // KING
    const checkKingDiagonal = () => {
      checkCellForMove(figure.x + 1, figure.y + 1);
      checkCellForMove(figure.x + 1, figure.y - 1);
      checkCellForMove(figure.x - 1, figure.y - 1);
      checkCellForMove(figure.x - 1, figure.y + 1);
    };

    const checkEatableFiguresByKing = () => {
      checkEatableOrAlliesCell(figure.x + 1, figure.y + 1);
      checkEatableOrAlliesCell(figure.x + 1, figure.y - 1);
      checkEatableOrAlliesCell(figure.x - 1, figure.y - 1);
      checkEatableOrAlliesCell(figure.x - 1, figure.y + 1);
      checkEatableOrAlliesCell(figure.x + 1, figure.y);
      checkEatableOrAlliesCell(figure.x - 1, figure.y);
      checkEatableOrAlliesCell(figure.x, figure.y + 1);
      checkEatableOrAlliesCell(figure.x, figure.y - 1);
    };

    if (figure.name === Figures.KING) {
      verticalBottom(figure.y - 1);
      verticalTop(figure.y + 1);
      horizontalLeft(figure.x - 1);
      horizontalRight(figure.x + 1);
      checkKingDiagonal();
      checkEatableFiguresByKing();

      const cellsForRemoving: { x: number; y: number }[] = [];
      for (let i = 0; i < way.length; i++) {
        if (
          dangerousCells.current[getOtherColor(figure.color)][
            `${way[i].x}-${way[i].y}`
          ]
        ) {
          cellsForRemoving.push({ x: way[i].x, y: way[i].y });
        }
      }
      cellsForRemoving.forEach((elw) => {
        way = way.filter((el) => !(el.y === elw.y && el.x === elw.x));
      });
    }

    const obj: { [key: string]: boolean } = {};
    way.forEach((el) => {
      obj[`${el.x}-${el.y}`] = true;
    });
    return obj;
  };

  const checkIsKingInCheck = (
    updateAllAvailableCells: () => void,
    dangerousCells: MutableRefObject<{
      white: { [key: string]: boolean };
      black: { [key: string]: boolean };
    }>,
    setIsKingInCheck: Dispatch<React.SetStateAction<boolean>>,
    figures: { [p: string]: FigureData },
    color: Colors
  ) => {
    updateAllAvailableCells();
    const kings = {
      [Colors.WHITE]: figures["white-king-5-1"],
      [Colors.BLACK]: figures["black-king-5-8"],
    };
    const king = kings[color];
    if (!king) return;
    if (dangerousCells.current[getOtherColor(color)][`${king.x}-${king.y}`])
      setIsKingInCheck(true);
    else setIsKingInCheck(false);
  };
  return { checkIsKingInCheck, getAvailableCells, moveOrEat };
};
