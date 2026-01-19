import styled from "styled-components";
import {
  getColor,
  getLatestPercent,
  getLatestValue,
  type Measurement,
} from "./data";
import { LineGraphDisplay } from "./LineGraphDisplay";
import { Container } from "./styles";

type Props = {
  measurement: Measurement;
};

const BarDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const BarHolder = styled.div`
  position: relative;
  display: flex;
  align-items: end;
  height: 100px;
  width: 30px;
  background-color: white;
  margin: 8px;
`;

const Bar = styled.div<{ $percent: number; $color: string }>`
  background-color: ${({ $color }) => `${$color}`};
  height: ${({ $percent }) => `${$percent}%`};
  width: 100%;
`;

const RangeText = styled.p`
  font-size: 12px;
`;

const Value = styled.p`
  flex: 1;
  z-index: 2;
  font-weight: bold;
  font-size: 24px;
`;

export const VerticalBarDisplay = ({ measurement }: Props) => {
  const { name, min, max, values, unit, shouldPlot } = measurement;
  const latestValue = getLatestValue(measurement);

  const percent = getLatestPercent(measurement);
  const barColor = getColor(measurement);
  return (
    <div>
      <Container>
        <h4>{name}</h4>
        <BarDisplay>
          <RangeText>{max}</RangeText>
          <BarHolder>
            <Bar $percent={percent} $color={barColor} />
          </BarHolder>
          <RangeText>{min}</RangeText>
        </BarDisplay>
        <Value>{latestValue + (unit ? ` ${unit}` : "")}</Value>
      </Container>
      {shouldPlot && <LineGraphDisplay values={values} />}
    </div>
  );
};
