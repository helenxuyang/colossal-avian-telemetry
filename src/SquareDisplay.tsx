import styled from "styled-components";

export type ESCDisplayProps = {
  temperature: number;
  temperaturePercent: number;
  rpm: number;
  rpmPercent: number;
  current: number;
  currentPercent: number;
};

const DisplayHolder = styled.div`
  height: 100px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
`;

const MeasurementDisplay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: 1px solid black;
`;

const Fill = styled.span<{ $percent: number }>`
  position: absolute;
  background-color: red;
  width: 100%;
  height: ${({ $percent }) => `${$percent}%`};
  bottom: 0;
`;

const Value = styled.p`
  z-index: 2;
  font-size: 30px;
`;

const Unit = styled.span`
  position: absolute;
  bottom: 2px;
  right: 4px;
  font-size: 16px;
`;

export const SquareDisplay = ({
  temperature,
  temperaturePercent,
  rpm,
  rpmPercent,
  current,
  currentPercent,
}: ESCDisplayProps) => {
  return (
    <DisplayHolder>
      <MeasurementDisplay>
        <Fill $percent={temperaturePercent} />
        <Value>{temperature}</Value>
        <Unit>°C</Unit>
      </MeasurementDisplay>
      <MeasurementDisplay>
        <Fill $percent={rpmPercent} />
        <Value>{rpm}</Value>
        <Unit>RPM</Unit>
      </MeasurementDisplay>
      <MeasurementDisplay>
        <Fill $percent={currentPercent} />
        <Value>{current}</Value>
        <Unit>A</Unit>
      </MeasurementDisplay>
    </DisplayHolder>
  );
};
