import { useCallback, useEffect, useRef } from "react";
import { WebSocketConnector } from "./WebSocketConnector";
import styled from "styled-components";
import { parseMessage, type ParsedMessage } from "./messageUtils";
import { useAddMessage } from "./store";
import type {
  HandleConnectCallback,
  HandleReceiveDataCallback,
} from "./useWebSocket";

const WebSocketInfoHolder = styled.div`
  display: flex;
  flex-direction: column;
`;

type Props = {
  updateRobot: (parsedMessage: ParsedMessage) => void;
  isRecording: boolean;
  startRecording: () => void;
};

const MESSAGE_THROTTLE = 10;

export const ConnectedDataControls = ({
  updateRobot,
  isRecording,
  startRecording,
}: Props) => {
  const addMessage = useAddMessage();
  const messageCount = useRef<number>(0);

  const handleMessage = useCallback(
    (data: string) => {
      addMessage(data);
      if (isRecording) {
        messageCount.current++;
        if (messageCount.current > MESSAGE_THROTTLE) {
          messageCount.current = 0;
          const parsedData = parseMessage(data);
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
