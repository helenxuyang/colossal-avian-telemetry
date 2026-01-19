import styled, { css } from "styled-components";
import { getColor, type Measurement } from "./data";
import { LineGraphDisplay } from "./LineGraphDisplay";

type Props = {
  measurement: Measurement;
};

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

const DisplayHolder = styled.div<{ $highlight: boolean }>`
  width: 100%;
  background-color: ${({ $highlight }) => ($highlight ? "lightgreen" : "#444")};
  padding: 8px;
  color: ${({ $highlight }) => ($highlight ? "black" : "white")};

  ${({ $highlight }) =>
    $highlight &&
    css`
      ${Bar}::after {
        content: "READY!";
        color: white;
        font-weight: bold;
        font-size: 12px;
      }
    `};
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

export const HorizontalBarDisplay = ({ measurement }: Props) => {
  const { name, min, max, values, unit, highlightThreshold, shouldPlot } =
    measurement;
  const latestValue = values.at(-1) ?? 0;

  const shouldHighlight = highlightThreshold
    ? latestValue >= highlightThreshold
    : false;

  const percent = Math.min(((latestValue - min) / (max - min)) * 100, 100);
  const barColor = getColor(measurement);

  return (
    <DisplayHolder $highlight={shouldHighlight}>
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
    </DisplayHolder>
  );
};
