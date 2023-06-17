import React, {useEffect, useRef, useState, MutableRefObject} from "react";
import {Link} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "redux/hooks";

import Figure from "components/Figure/Figure";
import Cell from "./Cell";

import store from "../../redux/store";
import {changeFigurePosition, selectColor, selectFigures, selectGameWon, setGameStarted} from "redux/gameSlice";

import {useGameRules} from "../../hooks/useGameRules";

import {BoardLettersByNumber, Colors, FigureData, Figures, TCellsFigure} from "types";
import styles from "./Board.module.scss";

const Board: React.FC = () => {
    const dispatch = useAppDispatch();
    const gameColor = useAppSelector(selectColor);
    const figures = useAppSelector(selectFigures);
    const gameWon = useAppSelector(selectGameWon);

    const {checkIsKingInCheck, getAvailableCells, moveOrEat} = useGameRules()

    let [isKingInCheck, setIsKingInCheck] = useState<boolean>(false);
    let dangerousCells: MutableRefObject<{
        white: { [key: string]: boolean };
        black: { [key: string]: boolean }
    }> = useRef({white: {}, black: {}});

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
        dispatch(changeFigurePosition({figure, x, y}));
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
                    cells.push(<Cell
                        color={Colors.BLACK} x={boardLetter} y={y}
                        key={`${boardLetter}-${y}`}
                        isAvailableForMove={isAvailableCellForMove(x, y)}
                        isHavingFigure={isCellHavingFigure(x, y)}
                        cellClicked={cellClicked}
                        isSelected={isSelectedCell(x, y)}
                    />)
                } else {
                    cells.push(<Cell
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
            figuresJSX.push(<Figure
                figureClicked={figureClicked}
                key={figures[item].id}
                figure={figures[item]}
                isEatable={isEatableFigure(figures[item])}
                isSelected={isSelectedFigure(figures[item])}
            />);
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
        if (choseFigurePos && choseFigurePos.availableCells[`${figure.x}-${figure.y}`] && choseFigurePos.figure.color !== figure.color) {
            moveOrEat(cellsFigure, moveOn, choseFigurePos.figure, figure.x, figure.y);
            nextAIMoveDelayed();
            return;
        }

        if (choseFigurePos && choseFigurePos.figure.name === figure.name && figure.x === choseFigurePos.figure.x && choseFigurePos.figure.y === figure.y && choseFigurePos.figure.color === figure.color) {
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


    const nextAIMove = () => {
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

    const nextAIMoveDelayed = (delay: number = 200) => {
        setTimeout(nextAIMove, delay);
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

        return <div className={styles.gameWon}>
            <h2 className={styles.gameWonTitle}>{color} won</h2>
            <Link to="/" className={styles.gameWonButton}>Main page</Link>
        </div>;
    }

    useEffect(() => {
        checkIsKingInCheck(updateAllAvailableCells, dangerousCells, setIsKingInCheck, figures, sides.ally);
    }, [figures])

    useEffect(() => {
        resizeBoard();
        window.addEventListener('resize', resizeBoard);
        dispatch(setGameStarted(true));
    }, [])

    return <div className={styles.boardWrapper} ref={boardRef}>
        <ul className={styles.boardLeft}>
            <li className={styles.boardLeftItem}>1</li>
            <li className={styles.boardLeftItem}>2</li>
            <li className={styles.boardLeftItem}>3</li>
            <li className={styles.boardLeftItem}>4</li>
            <li className={styles.boardLeftItem}>5</li>
            <li className={styles.boardLeftItem}>6</li>
            <li className={styles.boardLeftItem}>7</li>
            <li className={styles.boardLeftItem}>8</li>
        </ul>

        <ul className={styles.boardBottom}>
            <li className={styles.boardBottomItem}>A</li>
            <li className={styles.boardBottomItem}>B</li>
            <li className={styles.boardBottomItem}>C</li>
            <li className={styles.boardBottomItem}>D</li>
            <li className={styles.boardBottomItem}>E</li>
            <li className={styles.boardBottomItem}>F</li>
            <li className={styles.boardBottomItem}>G</li>
            <li className={styles.boardBottomItem}>H</li>
        </ul>

        <ul className={styles.board}>
            {initCells()}
            {initFigures()}
        </ul>

        {getGameWonJSX()}
    </div>
}

export default Board;