import styled from "styled-components";
import { Link } from "react-router-dom";
export const BoardWrapper = styled.div`
  width: 100vw;
  min-width: 300px;
  min-height: 300px;
  position: relative;
  padding: 12px 12px 52px 48px;
  overflow: hidden;
  background: #f4f7fa;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 14px;
  color: #34364c;

  @media (max-width: 700px) {
    font-size: 11px;
  }
`;

export const BoardStyles = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

export const BoardLeft = styled.div`
  display: flex;
  flex-flow: column-reverse;
  position: absolute;
  width: 48px;
  height: 100%;
  padding-bottom: 52px;
  padding-top: 12px;
  top: 0;
  left: 0;
`;

export const BoardLeftItem = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
`;

export const BoardBottom = styled.div`
  display: flex;
  flex-flow: row;
  position: absolute;
  height: 52px;
  width: 100%;
  padding-left: 48px;
  padding-right: 12px;
  bottom: 0;
  left: 0;
`;

export const BoardBottomItem = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
`;

export const CellSelected = styled.div`
  background-color: #b1a7fc;
`;

export const GameWon = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 20px;
`;

export const GameWonButtonLink = styled(Link)`
  color: inherit;
`;
