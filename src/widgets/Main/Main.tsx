import React, {FC} from "react";
import {Link, useNavigate} from "react-router-dom";

import {useAppDispatch, useAppSelector} from "shared/hooks/useRedux";
import RadioButton from "shared/components/RadioButton";

import {selectColor, selectIsGameStarted} from "app/store/gameStore/selectors";
import {resetGame, setColor} from "app/store/gameStore/gameSlice";

import styles from './Main.module.scss'
import {Colors} from "app/types";


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

    return <div className={styles.wrapper}>
        <div className={styles.logo}></div>
        <h2>Choose side</h2>
        <form>
            <RadioButton value="White" handleChange={radioChanged} name="radio" isChecked={color === 'white'}/>
            <RadioButton value="Black" handleChange={radioChanged} name="radio" isChecked={color === 'black'}/>
        </form>
        {isGameStarted && <Link to="game" className={styles.button}>Continue</Link>}
        <a href="#" onClick={startNewGame} className={styles.button}>Start new game</a>
    </div>
}

export default Main;