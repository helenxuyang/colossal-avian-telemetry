import styled from "styled-components";
import { CURRENT, INPUT, RPM, TEMPERATURE, type ESC } from "./data";
import { VerticalBarDisplay } from "./VerticalBarDisplay";
import { ArcDisplay } from "./ArcDisplay";
import { Container } from "./styles";

const DisplayHolder = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  position: relative;
  gap: 16px;
`;

const DisplayLayout = styled.div`
  /* display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 16px; */

  display: grid;
  grid-template-areas: "arc arc" "temp input";
`;

const TempDisplay = styled(VerticalBarDisplay)`
  grid-area: temp;
`;
const RPMCurrentDisplay = styled(ArcDisplay)`
  grid-area: arc;
`;

const InputDisplay = styled(VerticalBarDisplay)`
  grid-area: input;
`;
type Props = { esc: ESC };

export const WeaponESCDisplay = ({ esc }: Props) => {
  return (
    <DisplayHolder>
      <h3>{esc.name}</h3>
      <DisplayLayout>
        <RPMCurrentDisplay
          outerMeasurement={esc.measurements[RPM]}
          innerMeasurement={esc.measurements[CURRENT]}
        />
        <TempDisplay measurement={esc.measurements[TEMPERATURE]} />
        <InputDisplay measurement={esc.measurements[INPUT]} />
      </DisplayLayout>
    </DisplayHolder>
  );
};
