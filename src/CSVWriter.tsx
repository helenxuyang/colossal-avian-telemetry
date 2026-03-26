import { CSVLink } from "react-csv";
import { type Robot } from "./robot";
import { useCallback, useState } from "react";
import styled from "styled-components";
import { getCsvData, type CSVRow } from "./csvUtils";

const StyledCSVLink = styled(CSVLink)`
  display: block;
  color: black;
  border: 2px solid black;
  padding: 0.6em 1.2em;
  border-radius: 8px;
  width: fit-content;
`;

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

  const prepareDownload = useCallback(() => {
    setCsvData(getCsvData(robot));
    setFileName(`colossal-avian-${getFormattedFirstTimestamp(robot)}.csv`);
  }, [robot]);

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
