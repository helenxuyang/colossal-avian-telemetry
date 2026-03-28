import styled from "styled-components";
import { CURRENT, RPM, TEMPERATURE, type ESC } from "./robot";
import { VerticalBarDisplay } from "./VerticalBarDisplay";
import { ArcDisplay } from "./ArcDisplay";
import { Container, MEDIUM_VIEWPORT } from "./styles";
import { ErrorDisplay } from "./ErrorDisplay";

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
  ${Container} {
    background-color: unset;
  }
`;
const RPMCurrentDisplay = styled(ArcDisplay)`
  grid-area: arc;
`;

const InputDisplay = styled(VerticalBarDisplay)`
  grid-area: input;
  ${Container} {
    background-color: unset;
  }
`;
type Props = { esc?: ESC; className?: string };

export const ESCDisplay = ({ esc, className }: Props) => {
  if (!esc) {
    return null;
  }
  return (
    <DisplayHolder className={className}>
      <h3>{esc.name}</h3>
      <DisplayLayout>
        {esc.measurements[TEMPERATURE].shouldShow && (
          <TempDisplay measurement={esc.measurements[TEMPERATURE]} />
        )}
        {esc.measurements[RPM].shouldShow &&
          esc.measurements[CURRENT].shouldShow && (
            <RPMCurrentDisplay
              outerMeasurement={esc.measurements[RPM]}
              innerMeasurement={esc.measurements[CURRENT]}
            />
          )}
        {esc.inputs.shouldShow && <InputDisplay measurement={esc.inputs} />}
      </DisplayLayout>
      {esc.errors.length > 0 && <ErrorDisplay errors={esc.errors} />}
    </DisplayHolder>
  );
};
