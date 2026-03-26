import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Robot, getInitColossalAvian } from "./robot";
import { RobotDisplay } from "./RobotDisplay";
import { WebSocketConnector } from "./WebSocketConnector";
import styled from "styled-components";
import { getUpdatedRobot, parseData } from "./messageUtils";

const WebSocketInfoHolder = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ConnectedDataDisplay = () => {
  const [robot, setRobot] = useState<Robot>(getInitColossalAvian());
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const handleReceiveData = useCallback(
    (data: string) => {
      if (isRecording) {
        const parsedData = parseData(data);
        if (parsedData) {
          setRobot(getUpdatedRobot(parsedData, robot));
        }
      }
    },
    [robot, isRecording],
  );

  const handleReceiveDataCallback = useRef<(data: string) => void | null>(null);
  useEffect(() => {
    handleReceiveDataCallback.current = handleReceiveData;
  }, [handleReceiveData]);

  const controls = useMemo(
    () => [
      <WebSocketInfoHolder>
        <WebSocketConnector
          onReceiveData={handleReceiveDataCallback}
          onConnect={() => {
            setIsRecording(true);
          }}
        />
      </WebSocketInfoHolder>,
    ],
    [],
  );

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
  }, []);

  const handlePauseRecording = useCallback(() => setIsRecording(false), []);

  const handleClearRecording = useCallback(
    () => setRobot(getInitColossalAvian()),
    [],
  );

  return (
    <RobotDisplay
      robot={robot}
      setRobot={setRobot}
      controls={controls}
      isRecording={isRecording}
      setIsRecording={setIsRecording}
      onStartRecording={handleStartRecording}
      onPauseRecording={handlePauseRecording}
      onClearRecording={handleClearRecording}
    />
  );
};
