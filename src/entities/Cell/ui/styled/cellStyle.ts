import styled, { css } from "styled-components";
import { Colors } from "app/types";

interface CellCircleStyleProps {
  show: string;
}

interface CellStyleProps {
  color: Colors;
  $isAvailableForMove?: boolean;
  $isHavingFigure?: boolean;
  $isSelected?: boolean;
}

export const CellStyle = styled.div<CellStyleProps>`
  position: relative;
  transition: all 0.2s;
  ${({ color }) =>
    color === Colors.WHITE
      ? "background-color: #E8EDF9;"
      : "background-color: #B7C0D8;"}

  ${({ $isAvailableForMove, $isHavingFigure }) =>
    $isAvailableForMove &&
    $isHavingFigure &&
    css`
      cursor: pointer;

      &:hover .cellCircle {
        opacity: 0.8;
      }
    `}
  ${({ $isSelected }) =>
    $isSelected &&
    css`
      border: 2px solid #7b61ff;
    `}
`;

export const CellCircleStyle = styled.div<CellCircleStyleProps>`
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 500px;
  left: calc(50% - 12px);
  top: calc(50% - 12px);
  opacity: 0;
  background-color: #7b61ff;
  transition: all 0.2s;

  ${({ show }) =>
    show === "true" &&
    css`
      opacity: 1;
    `}
`;
