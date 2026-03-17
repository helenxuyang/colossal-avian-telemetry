import CSVReader from "react-csv-reader";
import { getInitColossalAvian, type MatchMarker, type Robot } from "./robot";

type Props = {
  setRobot: (robot: Robot) => void;
};

const importRobot = (csvData: string[][]): Robot => {
  const robot = getInitColossalAvian();

  Object.keys(robot.escs).forEach((escName) => {
    const dataRows = csvData.filter(
      (row) => row.includes(escName) && row[0] === "data",
    );
    robot.escs[escName].timestamps = dataRows.map((row) => Number(row[2]));
    Object.keys(robot.escs[escName].measurements).forEach(
      (measurementName, index) => {
        robot.escs[escName].measurements[measurementName].values = dataRows.map(
          (row) => Number(row[3 + index]),
        );
      },
    );

    const inputRows = csvData.filter(
      (row) => row[0] === escName && row[0] === "input",
    );
    robot.escs[escName].inputs.timestamps = inputRows.map((row) =>
      Number(row[2]),
    );
    robot.escs[escName].inputs.values = inputRows.map((row) => Number(row[3]));
  });

  const matchMarkerRows = csvData.filter((row) => row[0] === "matchMarker");
  robot.matchMarkers = matchMarkerRows.map(
    (row) =>
      ({
        type: row[1],
        timestamp: Number(row[2]),
      }) as MatchMarker,
  );
  return robot;
};

export const RobotImporter = ({ setRobot }: Props) => {
  const handleFileLoaded = (data: string[][]) => {
    const robot = importRobot(data);
    setRobot(robot);
  };
  return <CSVReader onFileLoaded={handleFileLoaded} />;
};
