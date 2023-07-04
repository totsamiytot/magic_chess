import React, { FC } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "shared/hooks/useRedux";
import RadioButton from "shared/components/RadioButton";

import { selectColor, selectIsGameStarted } from "app/store/gameStore/selectors";
import { resetGame, setColor } from "app/store/gameStore/gameSlice";

import { Colors } from "app/types";
import { Wrapper, Logo, Button, StyledLink } from "./styled/mainStyle";


const Main: FC = () => {
    const navigate = useNavigate();
    const color = useAppSelector(selectColor);
    const isGameStarted = useAppSelector(selectIsGameStarted);
    const dispatch = useAppDispatch();

    const radioChanged = (id: string) => {
        dispatch(setColor(id as Colors));
    }

    const startNewGame = () => {
        dispatch(resetGame());
        navigate("/game");
    }

    return (
        <Wrapper>
            <Logo></Logo>
            <h2>Choose side</h2>
            <form>
                <RadioButton value="White" handleChange={radioChanged} name="radio" isChecked={color === 'white'} />
                <RadioButton value="Black" handleChange={radioChanged} name="radio" isChecked={color === 'black'} />
            </form>
            {isGameStarted && <StyledLink to="game" >Continue</StyledLink>}
            <Button onClick={startNewGame}>Start new game</Button>
        </Wrapper>
    )
}

export default Main;