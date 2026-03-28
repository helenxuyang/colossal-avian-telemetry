import CSVReader from "react-csv-reader";
import { type Robot } from "./robot";
import { importRobot } from "./csvUtils";
import { getCurrentRobotConfig } from "./storageUtils";

type Props = {
  setRobot: (robot: Robot) => void;
};

export const RobotImporter = ({ setRobot }: Props) => {
  const handleFileLoaded = (data: string[][]) => {
    const robot = importRobot(getCurrentRobotConfig(), data);
    setRobot(robot);
  };
  return <CSVReader onFileLoaded={handleFileLoaded} />;
};
