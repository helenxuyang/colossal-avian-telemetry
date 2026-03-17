import { useState } from "react";
import { getInitColossalAvian, type Robot } from "./robot";
import { RobotDisplay } from "./RobotDisplay";
import { DebugDisplay } from "./DebugDisplay";
import {
  getMockEscMessageGenerator,
  parseData,
  getUpdatedRobot,
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
            const newRobot = getUpdatedRobot(parsedData, robot);
            return newRobot;
          });
        }
      }
    };

    setMockDataIntervalId(setInterval(generateFakeData, intervalMs));
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
