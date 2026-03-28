import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RobotDisplay } from "./RobotDisplay";
import { WebSocketConnector } from "./WebSocketConnector";
import styled from "styled-components";
import { parseMessage } from "./messageUtils";
import { getInitRobot } from "./storageUtils";
import {
  useAddMessage,
  useMessages,
  useSetRobot,
  useUpdateRobot,
} from "./store";

const WebSocketInfoHolder = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ConnectedDataDisplay = () => {
  const setRobot = useSetRobot();
  const updateRobot = useUpdateRobot();
  const messages = useMessages();
  const addMessage = useAddMessage();

  const [isRecording, setIsRecording] = useState<boolean>(false);

  const handleConnect = useCallback(() => {
    setIsRecording(true);
  }, []);

  const handleMessage = useCallback(
    (data: string) => {
      addMessage(data);
      if (isRecording) {
        const parsedData = parseMessage(data);
        if (parsedData) {
          updateRobot(parsedData);
        }
      }
    },
    [isRecording, updateRobot, addMessage],
  );

  // use ref so websocket doesn't re-render
  const handleMessageCallback = useRef<(data: string) => void | null>(null);

  useEffect(() => {
    handleMessageCallback.current = handleMessage;
  }, [handleMessage]);

  const controls = useMemo(
    () => [
      <WebSocketInfoHolder>
        <WebSocketConnector
          onReceiveData={handleMessageCallback}
          onConnect={handleConnect}
        />
      </WebSocketInfoHolder>,
      <div>
        <h3>Messages</h3>
        {messages.length > 0 ? (
          <>
            {messages.slice(0, 5)}
            ...
            {messages.slice(messages.length - 6)}
          </>
        ) : (
          "None"
        )}
      </div>,
    ],
    [handleConnect, messages],
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
