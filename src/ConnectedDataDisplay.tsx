import { useCallback, useEffect, useRef, useState } from "react";
import { type Robot, getInitColossalAvian } from "./data";
import { RobotDisplay } from "./RobotDisplay";
import { useWebSocket } from "./useWebSocket";
import { getUpdatedRobot, parseData } from "./dataUtils";

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

  const connection = useWebSocket(handleReceiveDataCallback);

  const closeConnection = () => {
    connection.current?.close();
  };

  const controls = <button onClick={closeConnection}>Close connection</button>;
  return <RobotDisplay robot={robot} controls={controls} />;
};
