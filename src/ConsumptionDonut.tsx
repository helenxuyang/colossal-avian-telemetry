import styled from "styled-components";
import {
  CONSUMPTION,
  getLatestValue,
  TOTAL_CONSUMPTION,
  type Robot,
} from "./data";
import type { ReactNode } from "react";
import { Container } from "./styles";

const Pie = styled.svg`
  transform: rotate(-90deg);
`;

const StyledContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Slice = styled.circle`
  transform-origin: center center;
`;

const Label = styled.div`
  position: absolute;
`;
const TotalLabel = styled.div`
  position: absolute;
  margin: auto;
  font-weight: bold;
`;

type Props = {
  robot: Robot;
};

export const ConsumptionDonut = ({ robot }: Props) => {
  const svgSize = 150;
  const radius = svgSize / 3;
  const totalConsumption = robot.derivedValues[TOTAL_CONSUMPTION];
  const total = getLatestValue(totalConsumption);
  const colors = ["cornflowerblue", "blue", "orange"];

  let angle = 0;
  const slices: ReactNode[] = [];
  const labels: ReactNode[] = [];
  Object.values(robot.escs).forEach((esc, index) => {
    const value = getLatestValue(esc.measurements[CONSUMPTION]);
    const percent = Math.round((value / total) * 100);
    const color = colors[index];
    const strokeWidth = 10;
    slices.push(
      <Slice
        r={radius}
        cx={svgSize / 2}
        cy={svgSize / 2}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        pathLength={100}
        strokeDasharray={`${percent} ${100 - percent}`}
        strokeDashoffset={0}
        style={{ transform: `rotate(${angle}deg)` }}
      ></Slice>,
    );
    // -90 because graph is rotated
    // + half of value in degrees to center on slice
    // * pi/180 to convert to radians
    const labelAngleRadians =
      (angle - 90 + ((percent / 100) * 360) / 2) * (Math.PI / 180);
    const labelRadius = radius + strokeWidth * 2;
    const translateX = Math.cos(labelAngleRadians) * labelRadius;
    const translateY = Math.sin(labelAngleRadians) * labelRadius;
    labels.push(
      <Label
        style={{
          right: 0,
          left: 0,
          transform: `translate(${translateX}px, ${translateY}px)`,
        }}
      >
        <p>
          {esc.abbreviation}: {value}
        </p>
      </Label>,
    );
    angle += (percent / 100) * 360;
  });

  return (
    <Container>
      <h3>Consumption</h3>
      <StyledContainer>
        <Pie width={svgSize} height={svgSize}>
          {slices}
        </Pie>
        <TotalLabel>
          <p>{total}</p>
          <p>{totalConsumption.unit}</p>
        </TotalLabel>
        {total > 0 && labels}
      </StyledContainer>
    </Container>
  );
};
