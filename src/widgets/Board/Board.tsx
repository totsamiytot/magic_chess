import { useEffect, useRef, useState, MutableRefObject, FC } from "react";
import { useAppDispatch, useAppSelector } from "shared/hooks/useRedux";
import { changeFigurePosition, setGameStarted } from "app/store/gameStore/gameSlice";
import { selectColor, selectFigures, selectGameWon } from "app/store/gameStore/selectors";
import { BoardLettersByNumber, Colors, FigureData, Figures, TCellsFigure } from "app/types";

import Figure from "entities/Figure/ui/Figure";
import Cell from "entities/Cell/ui/Cell";
import { useGameRules } from "features/useGameRules";
import { useAIMove } from "shared/hooks/useAIMove";
import {
  BoardWrapper,
  BoardLeft,
  BoardLeftItem,
  BoardBottom,
  BoardBottomItem,
  BoardStyles,
  GameWon,
  GameWonButtonLink
} from "./styled/boardStyle";



const Board: FC = () => {
  const dispatch = useAppDispatch();
  const gameColor = useAppSelector(selectColor);
  const figures = useAppSelector(selectFigures);
  const gameWon = useAppSelector(selectGameWon);

  const { nextAIMove } = useAIMove()

  const { checkIsKingInCheck, getAvailableCells, moveOrEat } = useGameRules()

  let [isKingInCheck, setIsKingInCheck] = useState<boolean>(false);
  let dangerousCells: MutableRefObject<{
    white: { [key: string]: boolean };
    black: { [key: string]: boolean }
  }> = useRef({ white: {}, black: {} });

  const sides = {
    ally: gameColor,
    enemy: gameColor === Colors.WHITE ? Colors.BLACK : Colors.WHITE,
  }

  const boardRef = useRef<HTMLDivElement>(null);

  const [choseFigurePos, setChoseFigurePos] = useState<{
    figure: FigureData
    availableCells: { [key: string]: boolean }
  } | null>(null);

  const cellsFigure: TCellsFigure = {}



  const isAvailableCellForMove = (x: number, y: number): boolean => {
    return !!(choseFigurePos && choseFigurePos.availableCells[`${x}-${y}`]);
  }

  const isCellHavingFigure = (x: number, y: number): boolean => {
    return !!cellsFigure[`${x}-${y}`];
  }

  const moveOn = (figure: FigureData, x: number, y: number) => {
    cellsFigure[`${figure.x}-${figure.y}`] = null;
    cellsFigure[`${x}-${y}`] = figure;
    dispatch(changeFigurePosition({ figure, x, y }));
    setChoseFigurePos(null);
  }

  const cellClicked = (x: number, y: number): void => {
    if (!choseFigurePos) return;
    if (!choseFigurePos.availableCells[`${x}-${y}`]) return;

    moveOn(choseFigurePos.figure, x, y);

    nextAIMoveDelayed();
  }

  const initCells = (): JSX.Element[] => {
    const cells: JSX.Element[] = [];
    for (let y = 8; y >= 1; y--) {
      for (let x = 1; x <= 8; x++) {
        cellsFigure[`${x}-${y}`] = null;
        const boardLetter = BoardLettersByNumber[x];
        if ((y + x) % 2 !== 0) {
          cells.push(
            <Cell
              color={Colors.BLACK} x={boardLetter} y={y}
              key={`${boardLetter}-${y}`}
              isAvailableForMove={isAvailableCellForMove(x, y)}
              isHavingFigure={isCellHavingFigure(x, y)}
              cellClicked={cellClicked}
              isSelected={isSelectedCell(x, y)}
            />)
        } else {
          cells.push(
            <Cell
              color={Colors.WHITE} x={boardLetter} y={y}
              key={`${boardLetter}-${y}`}
              isAvailableForMove={isAvailableCellForMove(x, y)}
              isHavingFigure={isCellHavingFigure(x, y)}
              cellClicked={cellClicked}
              isSelected={isSelectedCell(x, y)}
            />)
        }
      }
    }
    return cells;
  }

  const isEatableFigure = (figure: FigureData): boolean => {
    if (!choseFigurePos) return false;
    return choseFigurePos.availableCells[`${figure.x}-${figure.y}`];
  }

  const isSelectedFigure = (figure: FigureData): boolean => {
    if (!choseFigurePos) return false;
    return choseFigurePos.figure.id === figure.id;
  }

  const isSelectedCell = (x: number, y: number): boolean => {
    if (!choseFigurePos) return false;
    return choseFigurePos.figure.x === x && choseFigurePos.figure.y === y;
  }

  const initFigures = (): JSX.Element[] => {
    const figuresJSX: JSX.Element[] = [];

    for (let item in figures) {
      if (!figures[item].id || !figures[item].color) continue;
      cellsFigure[`${figures[item].x}-${figures[item].y}`] = figures[item];
      figuresJSX.push(
        <Figure
          figureClicked={figureClicked}
          key={figures[item].id}
          figure={figures[item]}
          isEatable={isEatableFigure(figures[item])}
          isSelected={isSelectedFigure(figures[item])}
        />
      );
    }
    return figuresJSX;
  }

  const resizeBoard = () => {
    const paddingsWidth = 48 + 12;
    const paddingHeight = 52 + 12;

    if (boardRef.current) {
      const board = boardRef.current;
      board.style.height = '';
      board.style.width = '';

      const boardRect = board.getBoundingClientRect();
      const boardWidth = boardRect.width - paddingsWidth + paddingHeight;
      const boardHeight = boardRect.height - paddingHeight + paddingsWidth;

      if (boardHeight > boardWidth) {
        board.style.height = boardWidth + 'px';
      } else {
        board.style.width = boardHeight + 'px';
      }
    }
  }

  const figureClicked = (figure: FigureData) => {
    if (choseFigurePos
      && choseFigurePos.availableCells[`${figure.x}-${figure.y}`]
      && choseFigurePos.figure.color !== figure.color) {
      moveOrEat(cellsFigure, moveOn, choseFigurePos.figure, figure.x, figure.y);
      nextAIMoveDelayed();
      return;
    }

    if (choseFigurePos
      && choseFigurePos.figure.name === figure.name
      && figure.x === choseFigurePos.figure.x
      && choseFigurePos.figure.y === figure.y
      && choseFigurePos.figure.color === figure.color) {
      setChoseFigurePos(null);
      return;
    }

    if (sides.ally !== figure.color) return;

    if (isKingInCheck && figure.name !== Figures.KING) return;

    setChoseFigurePos({
      figure,
      availableCells: getAvailableCells(dangerousCells, cellsFigure, figure)
    });
  }

  const nextAIMoveDelayed = () => {
    nextAIMove(cellsFigure, moveOn, dangerousCells, moveOrEat, sides, getAvailableCells)
  };

  const getFiguresBySide = (color: Colors) => {
    return Object.keys(figures).filter(figureId => figures[figureId].color === color).map(figureId => figures[figureId]);
  }

  const updateAllAvailableCells = () => {
    dangerousCells.current.white = {};
    dangerousCells.current.black = {};
    const whiteFigures = getFiguresBySide(Colors.WHITE);
    const blackFigures = getFiguresBySide(Colors.BLACK);
    whiteFigures.forEach(figure => {
      dangerousCells.current.white = {
        ...dangerousCells.current.white,
        ...getAvailableCells(dangerousCells, cellsFigure, figure, true),
      };
    });
    blackFigures.forEach(figure => {
      dangerousCells.current.black = {
        ...dangerousCells.current.black,
        ...getAvailableCells(dangerousCells, cellsFigure, figure, true),
      };
    });
  }

  const getGameWonJSX = (): JSX.Element | null => {
    if (!gameWon) return null;
    const color = gameWon[0].toUpperCase() + gameWon.slice(1);

    return (
      <GameWon>
        <h2>{color}won</h2>
        <GameWonButtonLink to="/">Main page</GameWonButtonLink>
      </GameWon>
    )
  }

  useEffect(() => {
    checkIsKingInCheck(updateAllAvailableCells, dangerousCells, setIsKingInCheck, figures, sides.ally);
  }, [figures])

  useEffect(() => {
    resizeBoard();
    window.addEventListener('resize', resizeBoard);
    dispatch(setGameStarted(true));
  }, [])

  return (
    <BoardWrapper ref={boardRef}>
      <BoardLeft>
        <BoardLeftItem>1</BoardLeftItem>
        <BoardLeftItem>2</BoardLeftItem>
        <BoardLeftItem>3</BoardLeftItem>
        <BoardLeftItem>4</BoardLeftItem>
        <BoardLeftItem>5</BoardLeftItem>
        <BoardLeftItem>6</BoardLeftItem>
        <BoardLeftItem>7</BoardLeftItem>
        <BoardLeftItem>8</BoardLeftItem>
      </BoardLeft>
      <BoardBottom>
        <BoardBottomItem>A</BoardBottomItem>
        <BoardBottomItem>B</BoardBottomItem>
        <BoardBottomItem>C</BoardBottomItem>
        <BoardBottomItem>D</BoardBottomItem>
        <BoardBottomItem>E</BoardBottomItem>
        <BoardBottomItem>F</BoardBottomItem>
        <BoardBottomItem>G</BoardBottomItem>
        <BoardBottomItem>H</BoardBottomItem>
      </BoardBottom>
      <BoardStyles>
        {initCells()}
        {initFigures()}
      </BoardStyles>
      {getGameWonJSX()}
    </BoardWrapper>
  )
}

export default Board;