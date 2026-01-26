import styled from "styled-components";
import { getPercent, type BatteryVoltageMeasurement } from "./data";
import { Container, Value } from "./styles";

const BarDisplay = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
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
  font-size: 12px;
`;

const MinValueText = styled(ValueText)`
  transform: translateX(-110%);
`;

const MaxBar = styled.div<{ $minPercent: number; $maxPercent: number }>`
  position: absolute;
  left: ${({ $minPercent }) => `${$minPercent}%`};
  background-color: cornflowerblue;
  height: 100%;
  width: ${({ $minPercent, $maxPercent }) => `${$maxPercent - $minPercent}%`};
`;

const Marker = styled.div<{ $percent: number }>`
  position: absolute;
  left: ${({ $percent }) => `${$percent}%`};
  height: 100%;
  width: 2px;
  background-color: black;
`;

const RangeText = styled.p`
  font-size: 12px;
`;

type Props = {
  batteryVoltage: BatteryVoltageMeasurement;
};

export const VoltageDisplay = ({ batteryVoltage }: Props) => {
  const { name, min, max, unit, values } = batteryVoltage;
  const latestValues = values.at(-1) ?? [0];
  const minValue = Math.min(...latestValues);
  const maxValue = Math.max(...latestValues);
  const minPercent = getPercent(minValue, min, max);
  const maxPercent = getPercent(maxValue, min, max);

  return (
    <Container>
      <h4>{name}</h4>
      <BarDisplay>
        <RangeText>{min}</RangeText>
        <BarHolder>
          <MinBar $percent={minPercent} />
          <MaxBar $minPercent={minPercent} $maxPercent={maxPercent} />
          {latestValues.map((value, index) => (
            <Marker key={index} $percent={getPercent(value, min, max)} />
          ))}

          <MinValueText $percent={minPercent}>{minValue}</MinValueText>
          <ValueText $percent={maxPercent}>{maxValue}</ValueText>
        </BarHolder>
        <RangeText>{max}</RangeText>
      </BarDisplay>
      <Value>
        {minValue}-{maxValue} {unit}
      </Value>
    </Container>
  );
};
