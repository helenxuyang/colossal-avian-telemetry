import styled from "styled-components";
import { CONSUMPTION, type Robot } from "./robot";
import { useMemo, type ReactNode } from "react";
import { Container } from "./styles";
import { calculateTotal, getLatestValue } from "./dataUtils";

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

const Label = styled.span`
  position: absolute;
  width: min-content;
  white-space: nowrap;
`;
const TotalLabel = styled.div`
  position: absolute;
  margin: auto;
  font-weight: bold;
`;

type Props = {
  escs: Robot["escs"];
};

const svgSize = 150;
const radius = svgSize / 3;
const colors = ["cornflowerblue", "blue", "orange"];

export const ConsumptionDonut = ({ escs }: Props) => {
  const totalConsumption = useMemo(() => {
    return calculateTotal(CONSUMPTION, escs);
  }, [escs]);

  const donutUI = useMemo(() => {
    const slices: ReactNode[] = [];
    const labels: ReactNode[] = [];

    let angle = 0;

    Object.values(escs).forEach((esc, index) => {
      const value = getLatestValue(esc.measurements[CONSUMPTION]);
      const percent = Math.round((value / totalConsumption) * 100);
      const color = colors[index];
      const strokeWidth = 10;
      slices.push(
        <Slice
          key={esc.name}
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
      if (value > 0) {
        labels.push(
          <Label
            key={esc.name}
            style={{
              left: "50%",
              bottom: "50%",
              transform: `translate(calc(${translateX < 0 ? "-100" : "0"}% + ${translateX}px), calc(50% + ${translateY}px))`,
            }}
          >
            {esc.abbreviation}: {value}
          </Label>,
        );
      }
      angle += (percent / 100) * 360;
    });
    return {
      slices,
      labels,
    };
  }, [escs, totalConsumption]);

  return (
    <Container>
      <h3>Consumption</h3>
      <StyledContainer>
        <Pie width={svgSize} height={svgSize}>
          {donutUI.slices}
        </Pie>
        <TotalLabel>
          <p>{totalConsumption}</p>
          <p>mAh</p>
        </TotalLabel>
        {totalConsumption > 0 && donutUI.labels}
      </StyledContainer>
    </Container>
  );
};
