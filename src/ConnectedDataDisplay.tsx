import { useCallback, useEffect, useRef, useState } from "react";
import { type Robot, getInitColossalAvian } from "./data";
import { RobotDisplay } from "./RobotDisplay";
import { useWebSocket } from "./useWebSocket";
import { parseData } from "./dataUtils";

export const ConnectedDataDisplay = () => {
  const [robot, setRobot] = useState<Robot>(getInitColossalAvian());

  const handleReceiveDataCallback = useRef<(data: string) => void | null>(null);

  const handleReceiveData = useCallback(
    (data: string) => {
      const parsedData = parseData(data);
      console.log(parsedData);
      if (parsedData) {
        // console.log("parsed", parsedData);
        const { escName, ...escData } = parsedData;
        const newRobot = { ...robot };

        Object.entries(escData).forEach(
          ([measurementKey, measurementValue]) => {
            newRobot.escs[escName].measurements[measurementKey].values.push(
              measurementValue
            );
          }
        );
        console.log(newRobot);
        setRobot(newRobot);
      }
    },
    [robot]
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
