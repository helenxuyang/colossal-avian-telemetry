import styled from "styled-components";
import { getColor, getLatestValue, type Measurement } from "./data";

type Props = {
  outerMeasurement: Measurement;
  innerMeasurement: Measurement;
  className?: string;
};

const GraphDisplay = styled.div`
  position: relative;
`;

const OuterLabel = styled.p`
  font-size: 30px;
  font-weight: bold;
`;
const Arc = styled.svg<{ $strokeWidth: number }>`
  stroke-width: ${({ $strokeWidth }) => $strokeWidth};
  fill: none;
  max-width: 100%;
`;

const ArcBase = styled.path`
  stroke: white;
`;

const ArcFill = styled.path<{ $color: string }>`
  stroke: ${({ $color }) => $color};
`;

const InnerArcHolder = styled.div`
  position: absolute;
  top: 0;
`;

const InnerLabel = styled.p`
  position: absolute;
  bottom: 10%;
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
  radius: number,
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
  const svgWidth = 400;
  const outerStrokeWidth = 75;

  const svgHeight = svgWidth / 2;
  const outerDiameter = svgWidth;
  const outerRadius = outerDiameter / 2;

  const innerScale = 0.6;
  const innerDiameter = outerDiameter * innerScale;
  const innerRadius = innerDiameter / 2;
  const outerValue = getLatestValue(outer);
  const { x: outerArcX, y: outerArcY } = convertValueToCoord(
    outerValue,
    outer.min,
    outer.max,
    svgWidth,
    outerRadius,
  );

  const innerValue = getLatestValue(inner);
  const { x: innerArcX, y: innerArcY } = convertValueToCoord(
    innerValue,
    inner.min,
    inner.max,
    svgWidth,
    innerRadius,
  );

  const outerStart = `0 ${svgHeight}`;
  const outerBaseEnd = `${svgWidth} ${svgHeight}`;
  const outerColor = getColor(outer);

  const innerStart = `${outerRadius - innerRadius} ${svgHeight}`;
  const innerBaseEnd = `${svgWidth - (outerRadius - innerRadius)} ${svgHeight}`;
  const innerColor = getColor(inner);

  const viewBoxOffset = outerStrokeWidth / 2;
  const viewBox = `-${viewBoxOffset} -${viewBoxOffset} ${svgWidth + 2 * viewBoxOffset} ${svgHeight + viewBoxOffset}`;

  return (
    <div className={className}>
      <OuterLabel>
        {outerValue} {outer.unit}
      </OuterLabel>
      <GraphDisplay>
        <Arc
          width={svgWidth}
          height={svgHeight}
          viewBox={viewBox}
          $strokeWidth={outerStrokeWidth}
        >
          <ArcBase
            d={`M ${outerStart} A ${outerRadius} ${outerRadius} 0 0 1 ${outerBaseEnd}`}
          />
          <ArcFill
            d={`M ${outerStart} A ${outerRadius} ${outerRadius} 0 0 1 ${outerArcX} ${outerArcY}`}
            $color={outerColor}
          />
        </Arc>
        <InnerArcHolder>
          <Arc
            width={svgWidth}
            height={svgHeight}
            viewBox={viewBox}
            $strokeWidth={outerStrokeWidth / 2}
          >
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
