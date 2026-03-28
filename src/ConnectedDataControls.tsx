import { useCallback, useEffect, useRef } from "react";
import { WebSocketConnector } from "./WebSocketConnector";
import styled from "styled-components";
import { parseMessage } from "./messageUtils";
import { useAddMessage, useUpdateRobot } from "./store";
import type {
  HandleConnectCallback,
  HandleReceiveDataCallback,
} from "./useWebSocket";

const WebSocketInfoHolder = styled.div`
  display: flex;
  flex-direction: column;
`;

type Props = {
  isRecording: boolean;
  startRecording: () => void;
};

export const ConnectedDataControls = ({
  isRecording,
  startRecording,
}: Props) => {
  const updateRobot = useUpdateRobot();
  const addMessage = useAddMessage();

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
  const handleMessageCallback = useRef<HandleReceiveDataCallback>(null);
  const handleConnectCallback = useRef<HandleConnectCallback>(startRecording);

  useEffect(() => {
    handleMessageCallback.current = handleMessage;
  }, [handleMessage]);

  return (
    <WebSocketInfoHolder>
      <WebSocketConnector
        onReceiveData={handleMessageCallback}
        onConnect={handleConnectCallback}
      />
    </WebSocketInfoHolder>
  );
};
