import styled from "styled-components";
import {
  getColor,
  getLatestPercent,
  getLatestValueDisplay,
  type Measurement,
} from "./data";
import { Container, Value } from "./styles";
import { LineChart } from "./LineChart";

type Props = {
  measurement: Measurement;
  barColor?: string;
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
  height: 100px;
  width: 20px;
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

export const VerticalBarDisplay = ({ measurement, className = "" }: Props) => {
  const { name, min, max, shouldPlot } = measurement;

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
        <Value>{getLatestValueDisplay(measurement)}</Value>
      </Container>
      {shouldPlot && <LineChart measurement={measurement} />}
    </div>
  );
};
