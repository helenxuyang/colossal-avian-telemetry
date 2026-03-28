import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type EscName } from "./robot";
import { RobotDisplay } from "./RobotDisplay";
import {
  parseMessage,
  getMockEscError,
  ALL_ESC_IDS,
  idToEscMap,
  generateMockESCMessage,
} from "./messageUtils";
import styled from "styled-components";
import { getInitRobot } from "./storageUtils";
import { useRobot, useSetRobot, useUpdateRobot } from "./store";

const MockDataControls = styled.div`
  color: red;
`;

const ButtonsHolder = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const intervalMs = 8;

export const MockDataDisplay = () => {
  const robot = useRobot();
  const setRobot = useSetRobot();
  const updateRobot = useUpdateRobot();

  // to avoid stale closure in setInterval when mocking messages depending on robot state:
  const robotRef = useRef(robot);
  useEffect(() => {
    robotRef.current = robot;
  }, [robot]);

  const [mockDataIntervalId, setMockDataIntervalId] = useState<number | null>(
    null,
  );
  const [mockMessage, setMockMessage] = useState<string>("");

  const startTime = useRef<number | null>(null);
  const escIndex = useRef<number>(0);

  const mockReceiveAndHandleMessage = useCallback(() => {
    if (!startTime.current) {
      return;
    }
    const escIds = ALL_ESC_IDS.filter((id) => {
      const escName = idToEscMap[id];
      return Object.keys(robotRef.current.escs).includes(escName);
    });
    const escId = escIds[escIndex.current];
    const data = generateMockESCMessage(
      startTime.current,
      escId,
      robotRef.current,
    );
    console.log("mock message", data);
    const parsedData = parseMessage(data);

    escIndex.current =
      escIndex.current >= escIds.length - 1 ? 0 : escIndex.current + 1;

    updateRobot(parsedData);
  }, [startTime, updateRobot]);

  const mockReceiveAndHandleError = useCallback(
    (escName?: EscName) => {
      if (!startTime.current) {
        return;
      }
      const mockError = getMockEscError(startTime.current, escName);
      const parsedData = parseMessage(mockError);
      updateRobot(parsedData);
    },
    [startTime, updateRobot],
  );

  const handleStart = useCallback(() => {
    if (!startTime.current) {
      startTime.current = Date.now();
    }
    setMockDataIntervalId(setInterval(mockReceiveAndHandleMessage, intervalMs));
  }, [mockReceiveAndHandleMessage]);

  const handlePause = useCallback(() => {
    if (mockDataIntervalId) {
      clearInterval(mockDataIntervalId);
    }
    setMockDataIntervalId(null);
  }, [mockDataIntervalId]);

  const handleClear = useCallback(() => {
    setRobot(getInitRobot());
    startTime.current = null;
  }, [setRobot]);

  const controls = useMemo(() => {
    return [
      <MockDataControls>
        <h2>Data</h2>
        <p>⚠ USING FAKE DATA ⚠</p>
        <ButtonsHolder>
          {Object.keys(robot.escs).map((esc) => (
            <button
              key={esc}
              onClick={() => mockReceiveAndHandleError(esc as EscName)}
            >
              Mock {esc} error
            </button>
          ))}
        </ButtonsHolder>
        <input
          value={mockMessage}
          onChange={(e) => setMockMessage(e.target.value)}
        />
        <button onClick={mockReceiveAndHandleMessage}>Mock message</button>
      </MockDataControls>,
    ];
  }, [
    mockReceiveAndHandleError,
    mockReceiveAndHandleMessage,
    mockMessage,
    robot,
  ]);

  return (
    <RobotDisplay
      controls={controls}
      isRecording={mockDataIntervalId !== null}
      setIsRecording={handleStart}
      onStartRecording={handleStart}
      onPauseRecording={handlePause}
      onClearRecording={handleClear}
    />
  );
};
