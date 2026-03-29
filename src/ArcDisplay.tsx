import styled from "styled-components";
import { type Measurement } from "./robot";
import { getLatestValue, getColor, getLatestValueDisplay } from "./dataUtils";
import { useMemo } from "react";

type Props = {
  outerMeasurement: Measurement;
  innerMeasurement: Measurement;
  barColor?: string;
  className?: string;
};

const GraphDisplay = styled.div`
  position: relative;
`;

const OuterLabel = styled.p`
  font-size: 30px;
  font-weight: bold;
  white-space: nowrap;
`;

const Arc = styled.svg<{ $strokeWidth: number }>`
  stroke-width: ${({ $strokeWidth }) => $strokeWidth};
  fill: none;
  max-width: 100%;
`;

const ArcFill = styled.path<{ $color: string }>`
  stroke: ${({ $color }) => $color};
`;

const TargetMarkerHolder = styled.div`
  position: absolute;
  top: 0;
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
  font-size: 24px;
  font-weight: bold;
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

const svgWidth = 400;
const svgHeight = svgWidth / 2;

const outerStrokeWidth = 75;
const outerDiameter = svgWidth;
const outerRadius = outerDiameter / 2;

const innerScale = 0.6;
const innerDiameter = outerDiameter * innerScale;
const innerRadius = innerDiameter / 2;

const outerStart = `0 ${svgHeight}`;
const outerBaseEnd = `${svgWidth} ${svgHeight}`;

const innerStart = `${outerRadius - innerRadius} ${svgHeight}`;
const innerBaseEnd = `${svgWidth - (outerRadius - innerRadius)} ${svgHeight}`;

const viewBoxOffset = outerStrokeWidth / 2;
const viewBox = `-${viewBoxOffset} -${viewBoxOffset} ${svgWidth + 2 * viewBoxOffset} ${svgHeight + viewBoxOffset}`;

export const ArcDisplay = ({
  outerMeasurement: outer,
  innerMeasurement: inner,
  className,
}: Props) => {
  const outerValue = getLatestValue(outer.values);

  const { x: outerArcX, y: outerArcY } = convertValueToCoord(
    outerValue,
    outer.min,
    outer.max,
    svgWidth,
    outerRadius,
  );

  const innerValue = getLatestValue(inner.values);

  const { x: innerArcX, y: innerArcY } = convertValueToCoord(
    innerValue,
    inner.min,
    inner.max,
    svgWidth,
    innerRadius,
  );

  const outerColor = getColor(outer);
  const innerColor = getColor(inner);

  const target = outer.highlightThreshold ?? 0;
  const onePercent = (outer.max - outer.min) / 100;
  const targetStart = target - onePercent / 2;
  const targetEnd = target + onePercent / 2;
  const { x: targetStartX, y: targetStartY } = useMemo(
    () =>
      convertValueToCoord(
        targetStart,
        outer.min,
        outer.max,
        svgWidth,
        outerRadius,
      ),
    [outer.max, outer.min, targetStart],
  );

  const { x: targetEndX, y: targetEndY } = useMemo(
    () =>
      convertValueToCoord(
        targetEnd,
        outer.min,
        outer.max,
        svgWidth,
        outerRadius,
      ),
    [outer.max, outer.min, targetEnd],
  );

  return (
    <div className={className}>
      <OuterLabel>{getLatestValueDisplay(outer)}</OuterLabel>
      <GraphDisplay className="graph-display">
        <Arc
          width={svgWidth}
          height={svgHeight}
          viewBox={viewBox}
          $strokeWidth={outerStrokeWidth}
        >
          <ArcFill
            d={`M ${outerStart} A ${outerRadius} ${outerRadius} 0 0 1 ${outerBaseEnd}`}
            $color="white"
          />
          <ArcFill
            d={`M ${outerStart} A ${outerRadius} ${outerRadius} 0 0 1 ${outerArcX} ${outerArcY}`}
            $color={outerColor}
          />
        </Arc>
        {target > 0 && (
          <TargetMarkerHolder className="target-marker-holder">
            <Arc
              width={svgWidth}
              height={svgHeight}
              viewBox={viewBox}
              $strokeWidth={outerStrokeWidth}
            >
              <ArcFill
                d={`M ${targetStartX} ${targetStartY} A ${outerRadius} ${outerRadius} 0 0 1 ${targetEndX} ${targetEndY}`}
                $color="darkgreen"
              />
            </Arc>
          </TargetMarkerHolder>
        )}
        <InnerArcHolder>
          <Arc
            width={svgWidth}
            height={svgHeight}
            viewBox={viewBox}
            $strokeWidth={outerStrokeWidth / 2}
          >
            <ArcFill
              d={`M ${innerStart} A ${innerRadius} ${innerRadius} 0 0 1 ${innerBaseEnd}`}
              $color="white"
            />
            <ArcFill
              d={`M ${innerStart} A ${innerRadius} ${innerRadius} 0 0 1 ${innerArcX} ${innerArcY}`}
              $color={innerColor}
            />
          </Arc>
        </InnerArcHolder>
        <InnerLabel>{getLatestValueDisplay(inner)}</InnerLabel>
      </GraphDisplay>
    </div>
  );
};
