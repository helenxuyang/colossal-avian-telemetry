import { useRef, useState } from "react";
import {
  calculateDerivedValues,
  DRIVE_LEFT_ESC,
  getInitColossalAvian,
  TEMPERATURE,
  type Robot,
} from "./data";
import { RobotDisplay } from "./RobotDisplay";
import styled from "styled-components";
import { getMockEscMessageGenerator, getUpdatedRobot, parseData } from "./dataUtils";
import { CSVWriterSingleton } from "./CSVWriter";

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

  const startData = () => {
    const generateEscMessage = getMockEscMessageGenerator(Date.now(), robot);

    const generateFakeData = () => {
      const data = generateEscMessage();
      if (data) {
        const parsedData = parseData(data);
        if (parsedData) {
          setRobot((robot) => {
            let newRobot = getUpdatedRobot(parsedData, robot);
            newRobot = calculateDerivedValues(newRobot);
            return newRobot;
          });
          CSVWriterSingleton.getInstance().addData(parsedData);
        }
      }
    }

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
          {Object.values(robot.escs).map((esc) => {
            const numValuesToShow = 5;
            return (
              <div key={esc.name}>
                <strong>{esc.name}</strong>
                <p> Timestamps: [{esc.timestamps.slice(-numValuesToShow).join(",")}]</p>
                {Object.values(esc.measurements).map((measurement) => {
                  return (
                    <div key={`${esc.name}-${measurement.name}`}>
                      <p>
                        {measurement.name}: [
                        {measurement.values.slice(-numValuesToShow).join(",")}]
                      </p>
                    </div>
                  );
                })}
              </div>
            )
          })}
        </div>
      </details>
    </div>
  );
  return <RobotDisplay robot={robot} controls={controls} />;
};
