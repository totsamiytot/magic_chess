import React, {FC} from "react";
import classNames from "classnames/bind";
import {BoardNumberByLetter, Colors} from "app/types";
import styles from "./Cell.module.scss";

interface CellProps {
    color: Colors;
    x: string;
    y: number;
    cellClicked: (x: number, y: number) => void;
    isAvailableForMove?: boolean;
    isHavingFigure?: boolean;
    isSelected?: boolean;
}

const Cell: FC<CellProps> = (props: CellProps) => {
    return (
        <li onClick={() => props.cellClicked(BoardNumberByLetter[props.x], props.y)} id={`cell-${props.x}-${props.y}`}
            className={
                // @ts-ignore
                classNames(styles.cell, {
                    [styles.cellWhite]: props.color === Colors.WHITE,
                    [styles.cellBlack]: props.color === Colors.BLACK,
                    [styles.availableCell]: props.isAvailableForMove && !props.isHavingFigure,
                    [styles.cellSelected]: props.isSelected
                })
            }>
            <div
                // @ts-ignore
                className={classNames(styles.cellCircle, {
                    [styles.cellCircleShow]: props.isAvailableForMove && !props.isHavingFigure
                })}
            ></div>
        </li>
    )
}

export default Cell;