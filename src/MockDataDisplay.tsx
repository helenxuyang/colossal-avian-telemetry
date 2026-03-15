import { useState } from "react";
import {
  calculateDerivedValues,
  getInitColossalAvian,
  type Robot,
} from "./data";
import { RobotDisplay } from "./RobotDisplay";
import {
  getMockEscMessageGenerator,
  getUpdatedRobot,
  parseData,
} from "./dataUtils";
import { CSVWriterSingleton } from "./CSVWriter";
import { DebugDisplay } from "./DebugDisplay";

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
            let newRobot = getUpdatedRobot(parsedData, robot);
            newRobot = calculateDerivedValues(newRobot);
            return newRobot;
          });
          CSVWriterSingleton.getInstance().addData(parsedData);
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
