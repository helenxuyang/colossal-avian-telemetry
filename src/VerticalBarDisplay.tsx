import styled from "styled-components";
import {
  getColor,
  getLatestPercent,
  getLatestValue,
  type Measurement,
} from "./data";
import { Container, MEDIUM_VIEWPORT, Value } from "./styles";
import { LineChart } from "./LineChart";

type Props = {
  measurement: Measurement;
  className?: string;
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
  height: 75px;
  width: 30px;
  background-color: white;
  margin: 8px;

  @media (max-width: ${MEDIUM_VIEWPORT}px) {
    width: 20px;
  }
`;

const Bar = styled.div<{ $percent: number; $color: string }>`
  background-color: ${({ $color }) => `${$color}`};
  height: ${({ $percent }) => `${$percent}%`};
  width: 100%;
`;

const RangeText = styled.p`
  font-size: 12px;
`;

export const VerticalBarDisplay = ({ measurement, className = "" }: Props) => {
  const { name, min, max, unit, shouldPlot } = measurement;
  const latestValue = getLatestValue(measurement);

  const percent = getLatestPercent(measurement);
  const barColor = getColor(measurement);
  return (
    <div className={className}>
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
      {shouldPlot && <LineChart measurement={measurement} />}
    </div>
  );
};
