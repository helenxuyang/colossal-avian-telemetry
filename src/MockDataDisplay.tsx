import { useRef, useState } from "react";
import {
  calculateDerivedValues,
  DRIVE_LEFT_ESC,
  getInitColossalAvian,
  RPM,
  TEMPERATURE,
  type Measurement,
  type Robot,
} from "./data";
import { RobotDisplay } from "./RobotDisplay";
import styled from "styled-components";

const ButtonsHolder = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const DataControlsHolder = styled.div`
  display: flex;
  justify-content: center;
  fieldset {
    display: flex;
  }
`;
export const MockDataDisplay = () => {
  const intervalMs = 30;
  const mockDataCallback = useRef<() => void | null>(null);
  const [mockDataIntervalId, setMockDataIntervalId] = useState<number | null>(
    null,
  );
  const [temperatureMock, setTemperatureMock] = useState<string | null>(null);
  const [mockRPMReady, setMockRPMReady] = useState<boolean>(false);
  const [robot, setRobot] = useState<Robot>(getInitColossalAvian());

  const getNextValue = (measurement: Measurement) => {
    const { name, values, max, min, colorThresholds } = measurement;
    const lastValue =
      values.at(-1) ?? Math.round(Math.random() * (max - min) + min);
    let nextValue = lastValue;

    if (name === TEMPERATURE && temperatureMock && colorThresholds) {
      nextValue = colorThresholds[temperatureMock];
    } else if (name === RPM && mockRPMReady) {
      nextValue = max;
    } else {
      const sign = Math.random() > 0.5 ? 1 : -1;
      const deltaRange = (min - max) * 0.05;
      const delta = Math.random() * (deltaRange < 1 ? 1 : deltaRange);
      nextValue = Math.round(
        Math.min(max, Math.max(min, lastValue + delta * sign)),
      );
    }

    return nextValue;
  };

  const generateFakeData = () => {
    setRobot((robot) => {
      let newRobot = { ...robot };
      Object.values(newRobot.escs).forEach((esc) => {
        Object.values(esc.measurements).forEach((measurement) => {
          measurement.values.push(getNextValue(measurement));
        });
      });
      newRobot = calculateDerivedValues(newRobot);
      return newRobot;
    });
  };

  const startData = () => {
    mockDataCallback.current = generateFakeData;
    setMockDataIntervalId(setInterval(mockDataCallback.current, intervalMs));
  };

  const stopData = () => {
    if (mockDataIntervalId) {
      clearInterval(mockDataIntervalId);
    }
    setMockDataIntervalId(null);
  };

  const StartButton = <button onClick={startData}>Start fake data</button>;
  const StopButton = <button onClick={stopData}>Stop fake data</button>;

  const TemperatureMock = (
    <fieldset>
      <legend>Temperature</legend>
      {Object.keys(
        robot.escs[DRIVE_LEFT_ESC].measurements[TEMPERATURE].colorThresholds ??
          [],
      ).map((color) => {
        return (
          <div key={color}>
            <input
              type="radio"
              id={color}
              name="tempControl"
              value={color}
              checked={temperatureMock === color}
              onChange={(event) => {
                setTemperatureMock(event.target.value);
                stopData();
              }}
            />
            <label htmlFor={color}>{color}</label>
          </div>
        );
      })}
    </fieldset>
  );

  const RPMMock = (
    <fieldset>
      <legend>RPM</legend>
      <label>
        <input
          type="checkbox"
          checked={mockRPMReady}
          onChange={(event) => setMockRPMReady(event.target.checked)}
        />
        Mock RPM highlight
      </label>
    </fieldset>
  );

  const controls = (
    <div>
      <ButtonsHolder>
        {mockDataIntervalId ? StopButton : StartButton}
        <button
          onClick={() => {
            setRobot(getInitColossalAvian());
          }}
        >
          Clear mock data
        </button>
      </ButtonsHolder>
      {!mockDataIntervalId && (
        <DataControlsHolder>
          {TemperatureMock}
          {RPMMock}
        </DataControlsHolder>
      )}
      <details>
        <summary>Debug</summary>
        <div>
          {Object.values(robot.escs).map((esc) => (
            <div>
              <strong>{esc.name}</strong>
              {Object.values(esc.measurements).map((measurement) => {
                return (
                  <div>
                    <p>
                      {measurement.name}: [
                      {measurement.values.slice(-5).join(",")}]
                    </p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
  return <RobotDisplay robot={robot} controls={controls} />;
};
