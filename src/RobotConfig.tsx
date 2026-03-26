import { useEffect, useState } from "react";
import {
  getInitColossalAvian,
  getInitStackOverflow,
  type EscName,
  type Measurement,
  type MeasurementName,
  type Robot,
} from "./robot";
import styled from "styled-components";
import {
  deleteRobotConfig,
  getRobotStorage,
  saveRobotConfig,
} from "./storageUtils";
import type { RobotConfig } from "./dataUtils";

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

const CustomConfigButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

type Props = {
  robot: Robot;
  setRobot: (robot: Robot) => void;
};

const prebuiltRobots = [getInitColossalAvian(), getInitStackOverflow()];

export const ConfigDisplay = ({ robot, setRobot }: Props) => {
  const [robotInput, setRobotInput] = useState<Robot>(robot);
  const [robotStorage, setRobotStorage] = useState<Record<string, RobotConfig>>(
    {},
  );

  useEffect(() => {
    setRobotStorage(getRobotStorage());
  }, []);

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
          <div>
            <button
              key={robot.name}
              onClick={() => {
                setRobot(structuredClone(robot));
              }}
            >
              Switch to {robot.name}
            </button>
          </div>
        ))}
        <h2>Local</h2>
        {Object.values(robotStorage).length === 0 ? (
          <p>None</p>
        ) : (
          Object.values(robotStorage).map((config) => {
            return (
              <CustomConfigButtons>
                <button
                  key={config.name}
                  onClick={() => {
                    const robotCopy = structuredClone(robot);
                    robotCopy.name = config.name;
                    config.escConfigs.forEach((escConfig) => {
                      escConfig.measurements.forEach((measurementConfig) => {
                        Object.entries(measurementConfig).forEach(
                          ([key, value]) => {
                            const measurement =
                              robotCopy.escs[escConfig.name].measurements[
                                measurementConfig.name as MeasurementName
                              ];
                            // @ts-expect-error TODO types get weird when using Object.entries
                            measurement[key as keyof Measurement] = value;
                          },
                        );
                      });
                    });
                    setRobot(robotCopy);
                  }}
                >
                  Switch to {config.name}
                </button>
                <button
                  key={`${config.name}-delete`}
                  onClick={() => {
                    deleteRobotConfig(config.name);
                    setRobotStorage(getRobotStorage());
                  }}
                >
                  🗑️
                </button>
              </CustomConfigButtons>
            );
          })
        )}
      </PrebuiltRobotsLayout>
      <br />
      <h2>Custom</h2>
      <label htmlFor="name">Name</label>
      <input
        id="name"
        name="name"
        value={robotInput.name}
        onChange={(e) => {
          setRobotInput((input) => {
            const newRobotInput = structuredClone(input);
            newRobotInput.name = e.target.value;
            return newRobotInput;
          });
        }}
      ></input>
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
      <button
        onClick={() => {
          setRobot(robotInput);
          saveRobotConfig(robotInput);
          setRobotStorage(getRobotStorage());
        }}
      >
        Save
      </button>
    </ConfigLayout>
  );
};
