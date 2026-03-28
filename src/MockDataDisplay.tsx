import { useCallback, useMemo, useState } from "react";
import { getInitColossalAvian, type EscName, type Robot } from "./robot";
import { RobotDisplay } from "./RobotDisplay";
import {
  getMockEscMessageGenerator,
  parseData,
  getUpdatedRobot,
  getMockEscError,
} from "./messageUtils";
import styled from "styled-components";

const MockDataControls = styled.div`
  color: red;
`;

const ButtonsHolder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const MockDataDisplay = () => {
  const intervalMs = 8;
  const [mockDataIntervalId, setMockDataIntervalId] = useState<number | null>(
    null,
  );

  const [robot, setRobot] = useState<Robot>(getInitColossalAvian());
  const [startTime, setStartTime] = useState<number | null>(0);

  const [mockMessage, setMockMessage] = useState<string>("");

  const handleStart = useCallback(() => {
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
  }, [startTime]);

  const handleMockError = useCallback(
    (escName?: EscName) => {
      setRobot((robot) => {
        if (startTime) {
          const mockError = getMockEscError(startTime, escName);
          const parsedData = parseData(mockError);
          return getUpdatedRobot(parsedData, robot);
        }
        return robot;
      });
    },
    [startTime],
  );

  const handleMockMessage = useCallback(
    (message: string) => {
      setRobot((robot) => {
        if (startTime) {
          const parsedData = parseData(message);
          return getUpdatedRobot(parsedData, robot);
        }
        return robot;
      });
    },
    [startTime],
  );

  const handlePause = useCallback(() => {
    if (mockDataIntervalId) {
      clearInterval(mockDataIntervalId);
    }
    setMockDataIntervalId(null);
  }, [mockDataIntervalId]);

  const handleClear = useCallback(() => {
    setRobot(getInitColossalAvian());
    setStartTime(null);
  }, []);

  const controls = useMemo(() => {
    return [
      <MockDataControls>
        <h2>Data</h2>
        <p>⚠ USING FAKE DATA ⚠</p>
        <ButtonsHolder>
          {Object.keys(robot.escs).map((esc) => (
            <button key={esc} onClick={() => handleMockError(esc as EscName)}>
              Mock {esc} error
            </button>
          ))}
        </ButtonsHolder>
        <input
          value={mockMessage}
          onChange={(e) => setMockMessage(e.target.value)}
        />
        <button onClick={() => handleMockMessage(mockMessage)}>
          Mock message
        </button>
      </MockDataControls>,
    ];
  }, [handleMockError, handleMockMessage, mockMessage, robot]);

  return (
    <RobotDisplay
      robot={robot}
      setRobot={setRobot}
      controls={controls}
      isRecording={mockDataIntervalId !== null}
      setIsRecording={handleStart}
      onStartRecording={handleStart}
      onPauseRecording={handlePause}
      onClearRecording={handleClear}
    />
  );
};
