import styled from "styled-components";
import {
  getColor,
  getLatestPercent,
  getLatestValue,
  type Measurement,
} from "./data";
import { LineGraphDisplay } from "./LineGraphDisplay";
import { Container } from "./styles";

const StyledContainer = styled(Container)`
  width: 100%;
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

const Value = styled.p`
  flex: 1;
  z-index: 2;
  font-weight: bold;
  font-size: 24px;
`;

type Props = {
  measurement: Measurement;
};

export const HorizontalBarDisplay = ({ measurement }: Props) => {
  const { name, min, max, values, unit, shouldPlot } = measurement;
  const latestValue = getLatestValue(measurement);

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
      <Value>{latestValue + (unit ? ` ${unit}` : "")}</Value>
      {shouldPlot && <LineGraphDisplay values={values} />}
    </StyledContainer>
  );
};
