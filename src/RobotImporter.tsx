import CSVReader from "react-csv-reader";
import { importRobot, type Robot } from "./data";

type Props = {
  setRobot: (robot: Robot) => void;
};
export const RobotImporter = ({ setRobot }: Props) => {
  const handleFileLoaded = (data: string[][]) => {
    const robot = importRobot(data);
    setRobot(robot);
  };
  return <CSVReader onFileLoaded={handleFileLoaded} />;
};
