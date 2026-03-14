import { useRef, useState } from "react";
import {
  calculateDerivedValues,
  getInitColossalAvian,
  type Robot,
} from "./data";
import { RobotDisplay } from "./RobotDisplay";
import styled from "styled-components";
import {
  getMockEscMessageGenerator,
  getUpdatedRobot,
  parseData,
} from "./dataUtils";
import { CSVWriterSingleton } from "./CSVWriter";

const ButtonsHolder = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;

export const MockDataDisplay = () => {
  const intervalMs = 30;
  const mockDataCallback = useRef<() => void | null>(null);
  const [mockDataIntervalId, setMockDataIntervalId] = useState<number | null>(
    null,
  );

  const [robot, setRobot] = useState<Robot>(getInitColossalAvian());
  const [startTime, setStartTime] = useState<number | null>(0);

  const startData = () => {
    const now = Date.now();
    if (!startTime) {
      setStartTime(now);
    }
    const generateEscMessage = getMockEscMessageGenerator(
      startTime || now,
      robot,
    );

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
    };

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

  const controls = (
    <div>
      <ButtonsHolder>
        {mockDataIntervalId ? StopButton : StartButton}
        <button
          onClick={() => {
            setRobot(getInitColossalAvian());
            setStartTime(null);
          }}
        >
          Clear fake data
        </button>
      </ButtonsHolder>
      <details>
        <summary>Debug</summary>
        <div>
          {Object.values(robot.escs).map((esc) => {
            const numValuesToShow = 5;
            return (
              <div key={esc.name}>
                <strong>{esc.name}</strong>
                <p>
                  {" "}
                  Timestamps: [
                  {esc.timestamps.slice(-numValuesToShow).join(",")}]
                </p>
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
            );
          })}
        </div>
      </details>
    </div>
  );

  return <RobotDisplay robot={robot} setRobot={setRobot} controls={controls} />;
};
