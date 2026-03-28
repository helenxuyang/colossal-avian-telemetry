import { useCallback, useMemo, useRef, useState } from "react";
import { type EscName, type Robot } from "./robot";
import { RobotDisplay } from "./RobotDisplay";
import {
  parseMessage,
  getUpdatedRobot,
  getMockEscError,
  ALL_ESC_IDS,
  idToEscMap,
  generateMockESCMessage,
} from "./messageUtils";
import styled from "styled-components";
import { getInitRobot } from "./storageUtils";

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

  const [robot, setRobot] = useState<Robot>(getInitRobot());
  const [startTime, setStartTime] = useState<number | null>(0);
  const escIndex = useRef<number>(0);

  const [mockMessage, setMockMessage] = useState<string>("");

  const handleStart = useCallback(() => {
    const now = Date.now();
    if (!startTime) {
      setStartTime(now);
    }

    const handleMockMessage = () => {
      setRobot((robot) => {
        const escIds = ALL_ESC_IDS.filter((id) => {
          const escName = idToEscMap[id];
          return Object.keys(robot.escs).includes(escName);
        });
        const escId = escIds[escIndex.current];
        const data = generateMockESCMessage(startTime || now, escId, robot);
        const parsedData = parseMessage(data);
        const newRobot = getUpdatedRobot(parsedData, robot);

        escIndex.current =
          escIndex.current >= escIds.length - 1 ? 0 : escIndex.current + 1;

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
          const parsedData = parseMessage(mockError);
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
          const parsedData = parseMessage(message);
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
    setRobot(getInitRobot());
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
