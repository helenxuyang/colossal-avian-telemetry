import { useCallback, useEffect, useRef, useState } from "react";
import { type Robot, getInitColossalAvian } from "./data";
import { RobotDisplay } from "./RobotDisplay";
import { getUpdatedRobot, parseData } from "./dataUtils";
import { WebSocketConnector } from "./WebSocketConnector";
import styled from "styled-components";
import { BACKGROUND, Container } from "./styles";

const WebSocketInfoHolder = styled(Container)`
  display: flex;
  flex-direction: column;
  background-color: ${BACKGROUND}y;
`;

export const ConnectedDataDisplay = () => {
  const [robot, setRobot] = useState<Robot>(getInitColossalAvian());

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

  const handleReceiveDataCallback = useRef<(data: string) => void | null>(null);
  useEffect(() => {
    handleReceiveDataCallback.current = handleReceiveData;
  }, [handleReceiveData]);

  return (
    <RobotDisplay
      robot={robot}
      status={
        <WebSocketInfoHolder>
          <WebSocketConnector onReceiveData={handleReceiveDataCallback} />
        </WebSocketInfoHolder>
      }
    />
  );
};
