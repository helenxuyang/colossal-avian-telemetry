import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Robot } from "./robot";
import { RobotDisplay } from "./RobotDisplay";
import { WebSocketConnector } from "./WebSocketConnector";
import styled from "styled-components";
import { getUpdatedRobot, parseMessage } from "./messageUtils";
import { getInitRobot } from "./storageUtils";

const WebSocketInfoHolder = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ConnectedDataDisplay = () => {
  const [robot, setRobot] = useState<Robot>(getInitRobot());
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const handleConnect = useCallback(() => {
    setIsRecording(true);
  }, []);

  const handleReceiveData = useCallback(
    (data: string) => {
      if (isRecording) {
        const parsedData = parseMessage(data);
        if (parsedData) {
          setRobot((robot) => getUpdatedRobot(parsedData, robot));
        }
      }
    },
    [isRecording],
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

  const handleClearRecording = useCallback(() => setRobot(getInitRobot()), []);

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
