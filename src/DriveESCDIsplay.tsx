import styled from "styled-components";
import { VerticalBarDisplay } from "./VerticalBarDisplay";
import { type ESC } from "./robot";
import { Container } from "./styles";

type Props = {
  esc: ESC;
  className?: string;
  showColumnAfter?: boolean;
};

const MeasurementHolder = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
`;

export const DriveESCDisplay = ({ esc, className = "" }: Props) => {
  return (
    <Container className={className}>
      <h3>{esc.name}</h3>
      <MeasurementHolder>
        {Object.values(esc.measurements)
          .filter((measurement) => measurement.shouldShow !== false)
          .map((measurement) => {
            return (
              <VerticalBarDisplay
                key={`${esc.name}-${measurement.name}`}
                measurement={measurement}
              />
            );
          })}
      </MeasurementHolder>
    </Container>
  );
};
