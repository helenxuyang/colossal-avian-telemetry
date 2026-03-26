import styled from "styled-components";
import { VOLTAGE, type Robot } from "./robot";
import { Container, Value } from "./styles";
import { getClampedPercent, getLatestValue } from "./dataUtils";
import { useMemo } from "react";

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
  escs: Robot["escs"];
};

export const VoltageDisplay = ({ escs }: Props) => {
  const latestValues = useMemo(() => {
    return Object.values(escs).map((esc) =>
      getLatestValue(esc.measurements[VOLTAGE]),
    );
  }, [escs]);

  const min = useMemo(() => {
    return Math.min(
      ...Object.values(escs).map((esc) => esc.measurements[VOLTAGE].min),
    );
  }, [escs]);

  const max = useMemo(() => {
    return Math.min(
      ...Object.values(escs).map((esc) => esc.measurements[VOLTAGE].max),
    );
  }, [escs]);

  const minValue = useMemo(() => {
    return Math.min(...latestValues);
  }, [latestValues]);
  const maxValue = useMemo(() => {
    return Math.max(...latestValues);
  }, [latestValues]);

  const minPercent = useMemo(() => {
    return getClampedPercent(minValue, min, max);
  }, [minValue, min, max]);

  const maxPercent = useMemo(() => {
    return getClampedPercent(maxValue, min, max);
  }, [maxValue, min, max]);

  return (
    <Container>
      <h4>Battery Voltage</h4>
      <BarDisplay>
        <RangeText>{min}</RangeText>
        <BarHolder>
          <MinBar $percent={minPercent} />
          <MaxBar $minPercent={minPercent} $maxPercent={maxPercent} />
          {latestValues.map((value, index) => (
            <Marker key={index} $percent={getClampedPercent(value, min, max)} />
          ))}

          <MinValueText $percent={minPercent}>{minValue}</MinValueText>
          <ValueText $percent={maxPercent}>{maxValue}</ValueText>
        </BarHolder>
        <RangeText>{max}</RangeText>
      </BarDisplay>
      <Value>
        {minValue}-{maxValue} V
      </Value>
    </Container>
  );
};
