import styled, { css } from "styled-components";
import { getColor, type Measurement } from "./data";
import { LineGraphDisplay } from "./LineGraphDisplay";

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

const DisplayHolder = styled.div<{ $highlight: boolean }>`
  padding: 8px;
  min-width: 100px;
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

export const VerticalBarDisplay = ({ measurement }: Props) => {
  const { name, min, max, values, unit, highlightThreshold, shouldPlot } =
    measurement;
  const latestValue = values.at(-1) ?? 0;

  const shouldHighlight = highlightThreshold
    ? latestValue >= highlightThreshold
    : false;

  const percent = Math.min(100, ((latestValue - min) / (max - min)) * 100);
  const barColor = getColor(measurement);
  return (
    <div>
      <DisplayHolder $highlight={shouldHighlight}>
        <h4>{name}</h4>
        <BarDisplay>
          <RangeText>{max}</RangeText>
          <BarHolder>
            <Bar $percent={percent} $color={barColor} />
          </BarHolder>
          <RangeText>{min}</RangeText>
        </BarDisplay>
        <Value>{latestValue + (unit ? ` ${unit}` : "")}</Value>
      </DisplayHolder>
      {shouldPlot && <LineGraphDisplay values={values} />}
    </div>
  );
};
