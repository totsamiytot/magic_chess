import styled, { css } from "styled-components";
import { Colors } from "app/types";
import { CellCircleStyleProps, CellProps } from "../Cell";

export const CellStyle = styled.div<CellProps | any>`
  position: relative;
  transition: all 0.2s;
  ${({ color }) =>
    color === Colors.WHITE
      ? "background-color: #E8EDF9;"
      : "background-color: #B7C0D8;"}

  ${({ isAvailableForMove, isHavingFigure }) =>
    isAvailableForMove &&
    isHavingFigure &&
    css`
      cursor: pointer;

      &:hover .cellCircle {
        opacity: 0.8;
      }
    `}
  ${({ isSelected }) =>
    isSelected &&
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
    show &&
    css`
      opacity: 1;
    `}
`;
