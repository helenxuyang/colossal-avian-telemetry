import { Doughnut } from "react-chartjs-2";
import styled from "styled-components";
import { type Measurement } from "./data";

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
  margin: 0 auto;
  left: 0;
  right: 0;
  top: 35%;
  font-size: 28px;
  font-weight: bold;
`;

const InnerDoughnut = styled(Doughnut)`
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  bottom: 24%;
  width: 50%;
  height: 50%;
`;

const InnerLabel = styled.p`
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  bottom: 30%;
  font-size: 24px;
  flex: 1;
`;

const getPercent = (value: number, min: number, max: number) =>
  ((value - min) / (max - min)) * 100;

const getDonutData = (
  name: string,
  value: number,
  min: number,
  max: number,
  color: string
) => {
  const percent = getPercent(value, min, max);
  return {
    labels: [name],
    datasets: [
      {
        data: [percent, 100 - percent],
        backgroundColor: [color, "white"],
        // borderWidth: 1,
      },
    ],
  };
};

export const DoughnutDisplay = ({
  outerMeasurement: outer,
  innerMeasurement: inner,
  className = "",
}: Props) => {
  const outerValue = outer.values.at(-1) ?? 0;
  const outerColor =
    outer.highlightThreshold !== undefined &&
    outerValue >= outer.highlightThreshold
      ? "lightgreen"
      : "skyblue";
  const outerData = getDonutData(
    outer.name,
    outerValue,
    outer.min,
    outer.max,
    outerColor
  );

  const innerValue = inner.values.at(-1) ?? 0;

  const innerData = getDonutData(
    inner.name,
    innerValue,
    inner.min,
    inner.max,
    "cornflowerblue"
  );
  const outerDonutOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    rotation: -90,
    circumference: 180,
    cutout: "60%",
    maintainAspectRatio: false,
    responsive: true,
  };

  const innerDonutOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    rotation: -90,
    circumference: 180,
    cutout: "80%",
    maintainAspectRatio: true,
    responsive: true,
  };

  return (
    <GraphDisplay className={className}>
      <Doughnut data={outerData} options={outerDonutOptions} />
      <OuterLabel>
        {outerValue} {outer.unit}
      </OuterLabel>
      <InnerDoughnut data={innerData} options={innerDonutOptions} />
      <InnerLabel>
        {innerValue} {inner.unit}
      </InnerLabel>
    </GraphDisplay>
  );
};
