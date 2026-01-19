import styled from "styled-components";
import { getPercent, type BatteryVoltageMeasurement } from "./data";
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

const MinBar = styled.div<{ $percent: number }>`
  position: absolute;
  background-color: skyblue;
  height: 100%;
  width: ${({ $percent }) => `${$percent}%`};
`;

const ValueText = styled.p<{ $percent: number }>`
  position: absolute;
  left: ${({ $percent }) => `${$percent}%`};
  top: 100%;
`;

const MaxBar = styled.div<{ $minPercent: number; $maxPercent: number }>`
  position: absolute;
  left: ${({ $minPercent }) => `${$minPercent}%`};
  background-color: cornflowerblue;
  height: 100%;
  width: ${({ $minPercent, $maxPercent }) => `${$maxPercent - $minPercent}%`};
`;

const RangeText = styled.p`
  font-size: 12px;
`;

const Value = styled.p`
  padding-top: 4px;
  flex: 1;
  z-index: 2;
  font-weight: bold;
  font-size: 24px;
`;

type Props = {
  batteryVoltage: BatteryVoltageMeasurement;
};

export const VoltageDisplay = ({ batteryVoltage }: Props) => {
  const { name, min, max, unit, minValues, maxValues } = batteryVoltage;
  const minValue = minValues.at(-1) ?? 0;
  const maxValue = maxValues.at(-1) ?? 0;
  const minPercent = getPercent(minValue, min, max);
  const maxPercent = getPercent(maxValue, min, max);

  return (
    <StyledContainer>
      <h4>{name}</h4>
      <BarDisplay>
        <RangeText>{min}</RangeText>
        <BarHolder>
          <MinBar $percent={minPercent} />
          <MaxBar $minPercent={minPercent} $maxPercent={maxPercent} />
          <ValueText $percent={minPercent}>{minValue}</ValueText>
          <ValueText $percent={maxPercent}>{maxValue}</ValueText>
        </BarHolder>
        <RangeText>{max}</RangeText>
      </BarDisplay>
      <Value>
        {minValue}-{maxValue} {unit}
      </Value>
    </StyledContainer>
  );
};
