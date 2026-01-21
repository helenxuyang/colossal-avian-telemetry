import styled from "styled-components";
import { CURRENT, INPUT, RPM, TEMPERATURE, type ESC } from "./data";
import { VerticalBarDisplay } from "./VerticalBarDisplay";
import { ArcDisplay } from "./ArcDisplay";
import { Container, MEDIUM_VIEWPORT } from "./styles";

const DisplayHolder = styled(Container)`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  position: relative;
`;

const DisplayLayout = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: end;
  gap: 4px;

  @media (max-width: ${MEDIUM_VIEWPORT}px) {
    display: grid;
    grid-template-areas: "arc arc" "temp input";
  }
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
type Props = { esc: ESC; className?: string };

export const ESCDisplay = ({ esc, className }: Props) => {
  return (
    <DisplayHolder className={className}>
      <h3>{esc.name}</h3>
      <DisplayLayout>
        <TempDisplay measurement={esc.measurements[TEMPERATURE]} />
        <RPMCurrentDisplay
          outerMeasurement={esc.measurements[RPM]}
          innerMeasurement={esc.measurements[CURRENT]}
        />
        <InputDisplay measurement={esc.measurements[INPUT]} />
      </DisplayLayout>
    </DisplayHolder>
  );
};
