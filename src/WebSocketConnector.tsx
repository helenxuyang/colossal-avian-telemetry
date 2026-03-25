import { useState } from "react";
import {
  useWebSocket,
  type HandleReceiveDataCallbackRef,
} from "./useWebSocket";
import styled from "styled-components";

const Status = styled.p`
  font-size: 40px;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
`;

type Props = {
  onReceiveData: HandleReceiveDataCallbackRef;
  onConnect: () => void;
};

type WebSocketStatus = 0 | 1 | 2 | 3;
const connectionMap: Record<WebSocketStatus, string> = {
  [WebSocket.CONNECTING]: "👀 Connecting",
  [WebSocket.OPEN]: "✅ Open",
  [WebSocket.CLOSING]: "⚠️ Closing",
  [WebSocket.CLOSED]: "❌ Closed",
};

export const WebSocketConnector = ({ onReceiveData, onConnect }: Props) => {
  const [shouldAutoRetryConnection, setShouldAutoRetryConnection] =
    useState<boolean>(true);

  const { connection, status, closeCodes, retryConnection } = useWebSocket(
    shouldAutoRetryConnection,
    onReceiveData,
    onConnect,
  );

  const closeConnection = () => {
    connection.current?.close();
  };

  return (
    <div>
      <h3>Connection</h3>
      <Status>
        {status === null ? "none" : connectionMap[status as WebSocketStatus]}
      </Status>
      <p>Close codes received: {closeCodes?.join(", ") ?? "none"}</p>
      <Controls>
        {status === WebSocket.OPEN && (
          <button onClick={closeConnection}>Close connection</button>
        )}
        {status === WebSocket.CLOSED && (
          <button onClick={retryConnection}>Retry connection</button>
        )}
        <label>
          <input
            type="checkbox"
            checked={shouldAutoRetryConnection}
            onChange={(event) =>
              setShouldAutoRetryConnection(event.target.checked)
            }
          />
          Auto retry connection
        </label>
      </Controls>
    </div>
  );
};
