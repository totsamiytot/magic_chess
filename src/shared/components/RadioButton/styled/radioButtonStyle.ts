import styled from "styled-components";

export const Container = styled.label`
  display: inline-block;
  margin-right: 8px;
  position: relative;
  padding-left: 30px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 18px;
  user-select: none;
  font-weight: 500;

  &::-moz-selection {
    background-color: transparent;
  }

  &::selection {
    background-color: transparent;
  }
`;

export const Input = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
`;

export const Checkmark = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #eee;
  border-radius: 50%;
  transition: all 0.5s;

  ${Container}:hover ${Input} ~ & {
    background-color: #ccc;
  }

  ${Container} ${Input}:checked ~ & {
    background-color: #000;
  }

  &::after {
    content: "";
    position: absolute;
    display: none;
  }

  ${Container} ${Input}:checked ~ &:after {
    display: block;
  }

  &::after {
    top: 9px;
    left: 9px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: white;
  }
`;
