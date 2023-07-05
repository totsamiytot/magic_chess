import { HTMLAttributes } from "react";
import styled from "styled-components";

interface FigureStyleProps extends HTMLAttributes<HTMLDivElement> {
  $isEatable?: boolean;
}

export const FigureStyle = styled.div<FigureStyleProps>`
  position: absolute;
  width: 12.5%;
  height: 12.5%;
  padding: 6px;
  transition: all 0.5s;
  cursor: pointer;
  ${({ $isEatable }) =>
    $isEatable ? "background-color: rgba(255, 0, 0, 0.2);" : ""}

  svg {
    transition: all 0.5s;
  }

  &:hover svg {
    transform: scale(1.06);
  }
`;
