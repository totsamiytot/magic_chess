import { FC } from "react";
import { BoardNumberByLetter, Colors } from "app/types";
import { CellCircleStyle, CellStyle } from "./styled/cellStyle";


export interface CellCircleStyleProps {
    show?: boolean;
}
export interface CellProps {
    color: Colors;
    x: string;
    y: number;
    cellClicked: (x: number, y: number) => void;
    isAvailableForMove?: boolean;
    isHavingFigure?: boolean;
    isSelected?: boolean;
    show?: CellCircleStyleProps
}


const Cell: FC<CellProps> = (props: CellProps) => {
    return (
        <CellStyle
            id={`cell-${props.x}-${props.y}`}
            color={props.color}
            isAvailableForMove={props.isAvailableForMove}
            isHavingFigure={props.isHavingFigure}
            isSelected={props.isSelected}
            onClick={() => props.cellClicked(BoardNumberByLetter[props.x], props.y)}
        >
            <CellCircleStyle
                show={props.isAvailableForMove && !props.isHavingFigure}
            />
        </CellStyle>
    )
}

export default Cell;