import { useCallback, useEffect, useRef, useState } from "react";
import { type Robot, getInitColossalAvian } from "./data";
import { RobotDisplay } from "./RobotDisplay";
import { useWebSocket } from "./useWebSocket";
import { getUpdatedRobot, parseData } from "./dataUtils";
import { Container } from "./styles";
import styled from "styled-components";

type WebSocketStatus = 0 | 1 | 2 | 3;
const connectionMap: Record<WebSocketStatus, string> = {
  [WebSocket.CONNECTING]: "👀 Connecting",
  [WebSocket.OPEN]: "✅ Open",
  [WebSocket.CLOSING]: "⚠️ Closing",
  [WebSocket.CLOSED]: "❌ Closed",
};

const Status = styled.p`
  font-size: 40px;
`;

export const ConnectedDataDisplay = () => {
  const [robot, setRobot] = useState<Robot>(getInitColossalAvian());

  const handleReceiveDataCallback = useRef<(data: string) => void | null>(null);

  const handleReceiveData = useCallback(
    (data: string) => {
      const parsedData = parseData(data);
      console.log(parsedData);
      if (parsedData) {
        setRobot(getUpdatedRobot(parsedData, robot));
      }
    },
    [robot],
  );

  useEffect(() => {
    handleReceiveDataCallback.current = handleReceiveData;
  }, [handleReceiveData]);

  const { connection, status, closeCodes } = useWebSocket(
    handleReceiveDataCallback,
  );

  const closeConnection = () => {
    connection.current?.close();
  };

  const connectionStatus = (
    <Container>
      <h3>Connection</h3>
      <Status>
        {status === null ? "none" : connectionMap[status as WebSocketStatus]}
      </Status>
      <p>Close codes received: {closeCodes?.join(", ") ?? "none"}</p>
      <button onClick={closeConnection}>Close connection</button>
    </Container>
  );

  return <RobotDisplay robot={robot} status={connectionStatus} />;
};
