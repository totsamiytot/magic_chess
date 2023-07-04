import { ChangeEvent, FC } from "react";
import { Container, Input, Checkmark } from "./styled/radioButtonStyle";

interface RadioButtonProps {
    value: string;
    handleChange: (id: string) => void
    isChecked?: boolean;
    name?: string;
}

const RadioButton: FC<RadioButtonProps> = (props: RadioButtonProps) => {
    const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
        props.handleChange(e.currentTarget.id.toLowerCase());
    }
    return (
        <Container> {props.value}
            <Input
                type="radio"
                id={props.value}
                defaultChecked={props.isChecked}
                name={props.name}
                onChange={handleRadioChange}
            />
            <Checkmark></Checkmark>
        </Container>
    )
}

export default RadioButton;