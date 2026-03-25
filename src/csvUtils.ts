import {
  type MatchMarker,
  type Robot,
  getInitColossalAvian,
  INPUT,
} from "./robot";

export type CSVRow = (string | number)[];

export const getCsvData = (robot: Robot): CSVRow[] => {
  const rows: CSVRow[] = [];
  Object.values(robot.escs).forEach((esc) => {
    const measurements = Object.values(esc.measurements);
    const measurementNames = measurements.map(
      (measurement) => measurement.name,
    );

    const dataRows = esc.timestamps.map((timestamp, index) => {
      return [
        "data",
        esc.name,
        timestamp,
        ...measurements.map((measurement) => measurement.values[index]),
      ];
    });
    if (dataRows.length > 0) {
      const dataHeaderRow = [
        "type",
        "escName",
        "timestamp",
        ...measurementNames,
      ];
      rows.push(dataHeaderRow);
      dataRows.forEach((row) => rows.push(row));
    }

    const inputRows =
      esc.inputs.timestamps?.map((timestamp, index) => {
        return ["input", esc.name, timestamp, esc.inputs.values[index]];
      }) ?? [];
    if (inputRows.length > 0) {
      const inputHeaderRow = ["type", "escName", "timestamp", INPUT];
      rows.push(inputHeaderRow);
      inputRows.forEach((row) => rows.push(row));
    }

    const errorRows = esc.errors.map((error) => [
      "error",
      esc.name,
      error.timestamp,
    ]);
    if (errorRows.length > 0) {
      const errorHeaderRow = ["type", "escName", "timestamp"];
      rows.push(errorHeaderRow);
      errorRows.forEach((row) => rows.push(row));
    }
  });

  const matchMarkerRows = robot.matchMarkers.map(({ type, timestamp }) => {
    return ["matchMarker", type, timestamp];
  });
  if (matchMarkerRows.length > 0) {
    const matchMarkerHeaderRow = ["type", "event", "timestamp"];
    rows.push(matchMarkerHeaderRow);
    matchMarkerRows.forEach((row) => rows.push(row));
  }

  return rows;
};

export const importRobot = (csvData: string[][]): Robot => {
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

    const errorRows = csvData.filter(
      (row) => row.includes(esc.name) && row[0] === "error",
    );
    errorRows.forEach((errorRow) => {
      esc.errors.push({
        timestamp: Number(errorRow[2]),
      });
    });
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
