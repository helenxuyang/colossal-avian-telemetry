import styled from "styled-components";
import { getColor, type Measurement } from "./data";

const svgWidth = 400;
const outerStrokeWidth = 100;

type Props = {
  outerMeasurement: Measurement;
  innerMeasurement: Measurement;
  className?: string;
};

const GraphDisplay = styled.div`
  position: relative;
`;

const OuterLabel = styled.p`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  color: black;
  font-size: 30px;
  font-weight: bold;
  top: 8%;
`;
const Arc = styled.svg`
  stroke-width: ${outerStrokeWidth};
  fill: none;
`;

const ArcBase = styled.path`
  stroke: white;
`;

const ArcFill = styled.path<{ $color: string }>`
  stroke: ${({ $color }) => $color};
`;

const InnerArcHolder = styled.div`
  position: absolute;
  svg {
    stroke-width: ${outerStrokeWidth / 2};
  }
  top: 0;
`;

const InnerLabel = styled.p`
  position: absolute;
  bottom: 20%;
  left: 0;
  right: 0;
  margin: 0 auto;
  font-size: 20px;
`;

const convertValueToCoord = (
  value: number,
  min: number,
  max: number,
  displaySize: number,
  radius: number
) => {
  const percent = Math.min((value - min) / (max - min), 1);
  const angle = (1 - percent) * Math.PI;
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);
  const translatedX = displaySize / 2 + x;
  const translatedY = displaySize / 2 - y;
  return {
    x: translatedX,
    y: translatedY,
  };
};

export const ArcDisplay = ({
  outerMeasurement: outer,
  innerMeasurement: inner,
  className,
}: Props) => {
  const svgHeight = svgWidth / 2;
  const outerDiameter = svgWidth;
  const outerRadius = outerDiameter / 2;
  const innerDiameter = outerDiameter * 0.5;
  const innerRadius = innerDiameter / 2;
  const outerValue = outer.values.at(-1) ?? 0;
  const { x: outerArcX, y: outerArcY } = convertValueToCoord(
    outerValue,
    outer.min,
    outer.max,
    svgWidth,
    outerRadius
  );

  const innerValue = inner.values.at(-1) ?? 0;
  const { x: innerArcX, y: innerArcY } = convertValueToCoord(
    innerValue,
    inner.min,
    inner.max,
    svgWidth,
    innerRadius
  );

  const outerStart = `0 ${svgHeight}`;
  const outerBaseEnd = `${svgWidth} ${svgHeight}`;
  const outerColor = getColor(outer);

  const innerStart = `${outerRadius - innerRadius} ${svgHeight}`;
  const innerBaseEnd = `${svgWidth - (outerRadius - innerRadius)} ${svgHeight}`;
  const innerColor = getColor(inner);

  const viewBoxOffset = outerStrokeWidth / 2;
  const viewBox = `${-viewBoxOffset} ${-viewBoxOffset} ${
    svgWidth + 2 * viewBoxOffset
  } ${svgHeight + 2 * viewBoxOffset}`;

  return (
    <div>
      <GraphDisplay className={className}>
        <Arc width={svgWidth} height={svgHeight} viewBox={viewBox}>
          <ArcBase
            d={`M ${outerStart} A ${outerRadius} ${outerRadius} 0 0 1 ${outerBaseEnd}`}
          />
          <ArcFill
            d={`M ${outerStart} A ${outerRadius} ${outerRadius} 0 0 1 ${outerArcX} ${outerArcY}`}
            $color={outerColor}
          />
        </Arc>
        <OuterLabel>
          {outerValue} {outer.unit}
        </OuterLabel>
        <InnerArcHolder>
          <Arc width={svgWidth} height={svgHeight} viewBox={viewBox}>
            <ArcBase
              d={`M ${innerStart} A ${innerRadius} ${innerRadius} 0 0 1 ${innerBaseEnd}`}
            />
            <ArcFill
              d={`M ${innerStart} A ${innerRadius} ${innerRadius} 0 0 1 ${innerArcX} ${innerArcY}`}
              $color={innerColor}
            />
          </Arc>
        </InnerArcHolder>
        <InnerLabel>
          {innerValue} {inner.unit}
        </InnerLabel>
      </GraphDisplay>
    </div>
  );
};
