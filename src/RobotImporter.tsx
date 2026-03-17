import CSVReader from "react-csv-reader";
import { getInitColossalAvian, type MatchMarker, type Robot } from "./robot";

type Props = {
  setRobot: (robot: Robot) => void;
};

const importRobot = (csvData: string[][]): Robot => {
  const robot = getInitColossalAvian();

  Object.values(robot.escs).forEach((esc) => {
    const dataRows = csvData.filter(
      (row) => row.includes(esc.name) && row[0] === "data",
    );
    esc.timestamps = dataRows.map((row) => Number(row[2]));
    Object.values(esc.measurements).forEach((measurement, index) => {
      measurement.values = dataRows.map((row) => Number(row[3 + index]));
    });

    const inputRows = csvData.filter(
      (row) => row.includes(esc.name) && row[0] === "input",
    );
    esc.inputs.timestamps = inputRows.map((row) => Number(row[2]));
    esc.inputs.values = inputRows.map((row) => Number(row[3]));
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
