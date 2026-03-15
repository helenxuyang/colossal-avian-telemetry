import { CSVLink } from "react-csv";
import { INPUT, type Robot } from "./data";
import { useState } from "react";
import styled from "styled-components";

type CSVRow = (string | number)[];

const StyledCSVLink = styled(CSVLink)`
  display: block;
  color: black;
  border: 2px solid black;
  padding: 0.6em 1.2em;
  border-radius: 8px;
  width: fit-content;
`;

const getCsvData = (robot: Robot): CSVRow[] => {
  const rows: CSVRow[] = [];
  Object.keys(robot.escs).forEach((escName) => {
    const esc = robot.escs[escName];
    const dataMeasurementsNames = [
      ...Object.keys(esc.measurements).filter((name) => name !== INPUT),
    ];
    const dataHeaderRow = [
      "type",
      "escName",
      "timestamp",
      ...dataMeasurementsNames,
    ];
    rows.push(dataHeaderRow);

    const dataRows = esc.timestamps.map((timestamp, index) => {
      return [
        "data",
        escName,
        timestamp,
        ...dataMeasurementsNames.map(
          (name) => esc.measurements[name].values[index],
        ),
      ];
    });
    dataRows.forEach((row) => rows.push(row));

    const inputHeaderRow = ["type", "escName", "timestamp", INPUT];
    rows.push(inputHeaderRow);
    const inputRows =
      esc.measurements[INPUT].timestamps?.map((timestamp, index) => {
        return [
          "input",
          escName,
          timestamp,
          esc.measurements[INPUT].values[index],
        ];
      }) ?? [];
    inputRows.forEach((row) => rows.push(row));

    const matchMarkerHeaderRow = ["type", "event", "timestamp"];
    rows.push(matchMarkerHeaderRow);

    const matchMarkerRows = robot.matchMarkers.map(({ type, timestamp }) => {
      return ["matchMarker", type, timestamp];
    });
    matchMarkerRows.forEach((row) => rows.push(row));
  });
  return rows;
};

const getFormattedFirstTimestamp = (robot: Robot): string => {
  const date = robot.initialTimestamp
    ? new Date(robot.initialTimestamp)
    : new Date();
  return date.toISOString();
};

type Props = {
  robot: Robot;
};

export const CSVDownloader = ({ robot }: Props) => {
  const [fileName, setFileName] = useState<string>("");
  const [csvData, setCsvData] = useState<CSVRow[]>([]);

  const prepareDownload = () => {
    setCsvData(getCsvData(robot));
    setFileName(`colossal-avian-${getFormattedFirstTimestamp(robot)}.csv`);
  };

  return (
    <StyledCSVLink
      onClick={() => {
        prepareDownload();
      }}
      data={csvData}
      filename={fileName}
    >
      Download CSV
    </StyledCSVLink>
  );
};
