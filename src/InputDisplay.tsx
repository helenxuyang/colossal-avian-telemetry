import { type ESC } from "./robot";
import { Container } from "./styles";
import { VerticalBarDisplay } from "./VerticalBarDisplay";

type Props = {
  esc: ESC;
};

export const InputDisplay = ({ esc }: Props) => {
  return (
    <Container>
      <h3>{esc.name}</h3>
      <VerticalBarDisplay measurement={esc.inputs} />
    </Container>
  );
};
