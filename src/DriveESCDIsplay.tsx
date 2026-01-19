import styled from "styled-components";
import { VerticalBarDisplay } from "./VerticalBarDisplay";
import { type ESC } from "./data";
import { Container } from "./styles";

type Props = {
  esc: ESC;
  className?: string;
  showColumnAfter?: boolean;
};

const MeasurementHolder = styled.div<{ $flip: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex-direction: ${({ $flip }) => ($flip ? "row-reverse" : "row")};
  gap: 8px;
`;

export const DriveESCDisplay = ({
  esc,
  className = "",
  showColumnAfter = false,
}: Props) => {
  return (
    <Container className={className}>
      <h3>{esc.name}</h3>
      <MeasurementHolder $flip={showColumnAfter}>
        {Object.keys(esc.measurements)
          .filter(
            (measurementName) =>
              esc.measurements[measurementName].shouldShow !== false,
          )
          .map((measurementName) => {
            const measurement = esc.measurements[measurementName];
            return (
              <VerticalBarDisplay
                key={`${name}-${measurementName}`}
                measurement={measurement}
              />
            );
          })}
      </MeasurementHolder>
    </Container>
  );
};
