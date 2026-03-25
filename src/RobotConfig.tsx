import { useEffect, useState } from "react";
import {
  getInitColossalAvian,
  getInitStackOverflow,
  type EscName,
  type MeasurementName,
  type Robot,
} from "./robot";
import styled from "styled-components";

const ConfigLayout = styled.div`
  display: flex;
  flex-direction: column;
`;

const PrebuiltRobotsLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EscLayout = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 8px;
  gap: 16px;
  justify-content: center;
`;

const MeasurementLayout = styled.div`
  display: grid;
  padding: 16px;
  gap: 8px;
  grid-template-columns: repeat(2, 1fr);
  border: 1px solid black;
`;

const StyledInput = styled.input<{ $shouldHighlight: boolean }>`
  width: 100px;
  ${({ $shouldHighlight }) => {
    return $shouldHighlight && "outline: 2px orange dashed;";
  }};
`;

const UnsavedWarning = styled.div`
  color: darkorange;
`;

type Props = {
  robot: Robot;
  setRobot: (robot: Robot) => void;
};

const prebuiltRobots = [getInitColossalAvian(), getInitStackOverflow()];

export const RobotConfig = ({ robot, setRobot }: Props) => {
  const [robotInput, setRobotInput] = useState<Robot>(robot);

  useEffect(() => {
    setRobotInput(structuredClone(robot));
  }, [robot]);

  const updateMinOrMax = (
    escName: EscName,
    measurementName: string,
    type: "min" | "max",
    value: string,
  ) => {
    const newRobotInput = structuredClone(robotInput);
    newRobotInput.escs[escName].measurements[
      measurementName as MeasurementName
    ][type] = Number(value);
    setRobotInput(newRobotInput);
  };

  const getShouldHighlight = (
    escName: EscName,
    measurementName: string,
    type: "min" | "max",
  ) => {
    return (
      robotInput.escs[escName].measurements[measurementName as MeasurementName][
        type
      ] !==
      robot.escs[escName].measurements[measurementName as MeasurementName][type]
    );
  };

  return (
    <ConfigLayout>
      <PrebuiltRobotsLayout>
        <h2>Pre-built</h2>
        {prebuiltRobots.map((robot) => (
          <button
            key={robot.name}
            onClick={() => {
              setRobot(structuredClone(robot));
            }}
          >
            Switch to {robot.name}
          </button>
        ))}
      </PrebuiltRobotsLayout>
      <br />
      <h2>Custom</h2>
      <EscLayout>
        {Object.values(robotInput.escs).map((esc) => {
          return (
            <div>
              <h3>{esc.name}</h3>
              <MeasurementLayout key={esc.name}>
                {Object.values(esc.measurements).map((measurement) => {
                  const { name, min, max } = measurement;
                  const measurementId = `${esc.name}-${name}`;
                  const isMinUnsaved = getShouldHighlight(
                    esc.name,
                    name,
                    "min",
                  );
                  const isMaxUnsaved = getShouldHighlight(
                    esc.name,
                    name,
                    "max",
                  );
                  return (
                    <div key={`${esc.name}-${measurement.name}`}>
                      <h4>{name}</h4>
                      <label htmlFor={measurementId}>Min: </label>
                      <StyledInput
                        id={measurementId}
                        value={min}
                        type="number"
                        onChange={(e) => {
                          updateMinOrMax(esc.name, name, "min", e.target.value);
                        }}
                        $shouldHighlight={isMinUnsaved}
                      ></StyledInput>
                      <br />
                      <label htmlFor={measurementId}>Max: </label>
                      <StyledInput
                        id={measurementId}
                        value={max}
                        type="number"
                        onChange={(e) => {
                          updateMinOrMax(esc.name, name, "max", e.target.value);
                        }}
                        $shouldHighlight={isMaxUnsaved}
                      ></StyledInput>
                      {(isMinUnsaved || isMaxUnsaved) && (
                        <UnsavedWarning>⚠ Unsaved</UnsavedWarning>
                      )}
                    </div>
                  );
                })}
              </MeasurementLayout>
            </div>
          );
        })}
      </EscLayout>
      <button onClick={() => setRobot(robotInput)}>Save</button>
    </ConfigLayout>
  );
};
