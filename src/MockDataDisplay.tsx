import { useState } from "react";
import {
  ALL_ESCS,
  getInitColossalAvian,
  type EscName,
  type Robot,
} from "./robot";
import { RobotDisplay } from "./RobotDisplay";
import { DebugDisplay } from "./DebugDisplay";
import {
  getMockEscMessageGenerator,
  parseData,
  getUpdatedRobot,
  getMockEscError,
} from "./messageUtils";

export const MockDataDisplay = () => {
  const intervalMs = 30;
  const [mockDataIntervalId, setMockDataIntervalId] = useState<number | null>(
    null,
  );

  const [robot, setRobot] = useState<Robot>(getInitColossalAvian());
  const [startTime, setStartTime] = useState<number | null>(0);

  const handleStart = () => {
    const now = Date.now();
    if (!startTime) {
      setStartTime(now);
    }

    const handleMockMessage = () => {
      setRobot((robot) => {
        const generateEscMessage = getMockEscMessageGenerator(
          startTime || now,
          robot,
        );

        const data = generateEscMessage();
        const parsedData = parseData(data);
        const newRobot = getUpdatedRobot(parsedData, robot);
        return newRobot;
      });
    };

    setMockDataIntervalId(setInterval(handleMockMessage, intervalMs));
  };

  const handleMockError = (escName?: EscName) => {
    setRobot((robot) => {
      if (startTime) {
        const mockError = getMockEscError(startTime, escName);
        const parsedData = parseData(mockError);
        return getUpdatedRobot(parsedData, robot);
      }
      return robot;
    });
  };

  const handlePause = () => {
    if (mockDataIntervalId) {
      clearInterval(mockDataIntervalId);
    }
    setMockDataIntervalId(null);
  };

  const handleClear = () => {
    setRobot(getInitColossalAvian());
    setStartTime(null);
  };

  const controls = (
    <div>
      <h2>Data</h2>
      <p>⚠ USING FAKE DATA ⚠</p>
      {ALL_ESCS.map((esc) => (
        <button onClick={() => handleMockError(esc)}>Mock {esc} error</button>
      ))}

      <DebugDisplay robot={robot} />
    </div>
  );

  return (
    <RobotDisplay
      robot={robot}
      setRobot={setRobot}
      controls={[controls]}
      isRecording={mockDataIntervalId !== null}
      setIsRecording={handleStart}
      onStartRecording={handleStart}
      onPauseRecording={handlePause}
      onClearRecording={handleClear}
    />
  );
};
