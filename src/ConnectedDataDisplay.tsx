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
  background-color: ${BACKGROUND};
`;

const ButtonsHolder = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;

export const ConnectedDataDisplay = () => {
  const [robot, setRobot] = useState<Robot>(getInitColossalAvian());
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const handleReceiveData = useCallback(
    (data: string) => {
      if (isRecording) {
        const parsedData = parseData(data);
        console.log(parsedData);
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

  return (
    <RobotDisplay
      robot={robot}
      setRobot={setRobot}
      status={
        <WebSocketInfoHolder>
          <WebSocketConnector onReceiveData={handleReceiveDataCallback} />
        </WebSocketInfoHolder>
      }
      controls={
        <div>
          <strong>Status: </strong>
          {isRecording ? <span>🔴 RECORDING</span> : <span>Paused</span>}

          <ButtonsHolder>
            <button
              onClick={() => {
                setIsRecording((recording) => !recording);
              }}
            >
              {isRecording ? "Pause" : "Start"} recording
            </button>
            <button onClick={() => setRobot(getInitColossalAvian())}>
              Clear recording
            </button>
          </ButtonsHolder>
        </div>
      }
    />
  );
};
