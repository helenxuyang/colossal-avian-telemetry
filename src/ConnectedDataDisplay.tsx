import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RobotDisplay } from "./RobotDisplay";
import { WebSocketConnector } from "./WebSocketConnector";
import styled from "styled-components";
import { parseMessage } from "./messageUtils";
import { getInitRobot } from "./storageUtils";
import { useSetRobot, useUpdateRobot } from "./store";

const WebSocketInfoHolder = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ConnectedDataDisplay = () => {
  const setRobot = useSetRobot();
  const updateRobot = useUpdateRobot();

  const [isRecording, setIsRecording] = useState<boolean>(false);

  const handleConnect = useCallback(() => {
    setIsRecording(true);
  }, []);

  const handleReceiveData = useCallback(
    (data: string) => {
      if (isRecording) {
        const parsedData = parseMessage(data);
        if (parsedData) {
          updateRobot(parsedData);
        }
      }
    },
    [isRecording, updateRobot],
  );

  // use ref so websocket doesn't re-render
  const handleReceiveDataCallback = useRef<(data: string) => void | null>(null);

  useEffect(() => {
    handleReceiveDataCallback.current = handleReceiveData;
  }, [handleReceiveData]);

  const controls = useMemo(
    () => [
      <WebSocketInfoHolder>
        <WebSocketConnector
          onReceiveData={handleReceiveDataCallback}
          onConnect={handleConnect}
        />
      </WebSocketInfoHolder>,
    ],
    [handleConnect],
  );

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
  }, []);

  const handlePauseRecording = useCallback(() => setIsRecording(false), []);

  const handleClearRecording = useCallback(
    () => setRobot(getInitRobot()),
    [setRobot],
  );

  return (
    <RobotDisplay
      controls={controls}
      isRecording={isRecording}
      setIsRecording={setIsRecording}
      onStartRecording={handleStartRecording}
      onPauseRecording={handlePauseRecording}
      onClearRecording={handleClearRecording}
    />
  );
};
