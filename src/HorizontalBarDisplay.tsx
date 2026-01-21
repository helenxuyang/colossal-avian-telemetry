import styled from "styled-components";
import {
  getColor,
  getLatestPercent,
  getLatestValueDisplay,
  type Measurement,
} from "./data";
import { Container, SMALL_VIEWPORT, Value } from "./styles";
import { LineChart } from "./LineChart";

const StyledContainer = styled(Container)`
  @media (max-width: ${SMALL_VIEWPORT}px) {
    width: auto;
  }
`;

const BarDisplay = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const BarHolder = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 25px;
  background-color: white;
  margin: 8px;
`;

const Bar = styled.div<{ $percent: number; $color: string }>`
  position: absolute;
  background-color: ${({ $color }) => `${$color}`};
  height: 100%;
  width: ${({ $percent }) => `${$percent}%`};
`;

const RangeText = styled.p`
  font-size: 12px;
`;

type Props = {
  measurement: Measurement;
};

export const HorizontalBarDisplay = ({ measurement }: Props) => {
  const { name, min, max, shouldPlot } = measurement;

  const percent = getLatestPercent(measurement);
  const barColor = getColor(measurement);

  return (
    <StyledContainer>
      <h4>{name}</h4>
      <BarDisplay>
        <RangeText>{min}</RangeText>
        <BarHolder>
          <Bar $percent={percent} $color={barColor} />
        </BarHolder>
        <RangeText>{max}</RangeText>
      </BarDisplay>
      <Value>{getLatestValueDisplay(measurement)}</Value>
      {shouldPlot && <LineChart measurement={measurement} />}
    </StyledContainer>
  );
};
