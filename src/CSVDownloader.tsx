import { useRobot } from "./store";
import type { Robot } from "./robot";

const getRowFromLine = (line: string) => {
  return line.split(",");
};

const getSectionHeader = (type: string, row: string[], robot: Robot) => {
  if (type === "data") {
    const escName = row[1];
    const measurementNames = robot.escs[escName]
      ? Object.values(robot.escs[escName].measurements).map(
          (measurement) => measurement.name,
        )
      : [...Array(row.length - 3).keys()].map((num) => `value${num}`);

    return ["type", "esc", "timestamp", ...measurementNames];
  }

  if (type === "input") {
    return ["type", "esc", "timestamp", "input"];
  }

  if (type === "error") {
    return ["type", "esc", "timestamp"];
  }

  if (type === "matchMarker") {
    return ["type", "event", "timestamp"];
  }

  if (type === "unknownMessage") {
    return ["message", "reason"];
  }

  return ["type", "esc", "timestamp"];
};

const normalizeMessageTimestamps = (rows: string[][]) => {
  const timestampRows = rows.filter(
    (row) =>
      ["data", "input", "error", "matchMarker"].includes(row[0]) &&
      row.length > 2 &&
      !Number.isNaN(Number(row[2])),
  );
  if (timestampRows.length === 0) {
    return;
  }

  const minTimestamp = Math.min(...timestampRows.map((row) => Number(row[2])));
  if (!Number.isFinite(minTimestamp) || minTimestamp === 0) {
    return;
  }

  timestampRows.forEach((row) => {
    row[2] = String(Number(row[2]) - minTimestamp);
  });
};

const getCsvText = (text: string, robot: Robot) => {
  const rows = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(getRowFromLine);

  normalizeMessageTimestamps(rows);

  const escRows = rows.filter(
    (row) => row.length >= 3 && ["data", "input", "error"].includes(row[0]),
  );
  const escNames = Array.from(new Set(escRows.map((row) => row[1]))).sort();

  const typeOrder = ["data", "input", "error"];
  const outputRows: string[][] = [];

  for (const escName of escNames) {
    for (const type of typeOrder) {
      const sectionRows = escRows.filter(
        (row) => row[0] === type && row[1] === escName,
      );
      if (sectionRows.length === 0) continue;

      const header = getSectionHeader(type, sectionRows[0], robot);
      outputRows.push(header);

      const sortedSection = [...sectionRows].sort(
        (a, b) => Number(a[2] ?? 0) - Number(b[2] ?? 0),
      );
      outputRows.push(...sortedSection);
    }
  }

  const otherRows = rows.filter(
    (row) =>
      !["data", "input", "error", "matchMarker", "unknownMessage"].includes(
        row[0],
      ),
  );

  const groupedOtherRows = otherRows.reduce<Record<string, string[][]>>(
    (acc, row) => {
      const groupKey = row[0] ?? "unknown";
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(row);
      return acc;
    },
    {},
  );

  for (const type of Object.keys(groupedOtherRows)) {
    const sectionRows = groupedOtherRows[type];
    if (sectionRows.length === 0) continue;
    outputRows.push(getSectionHeader(type, sectionRows[0], robot));
    outputRows.push(...sectionRows);
  }

  if (robot.matchMarkers.length > 0) {
    outputRows.push(["type", "event", "timestamp"]);
    const sortedMatchMarkers = [...robot.matchMarkers].sort(
      (a, b) => a.timestamp - b.timestamp,
    );
    sortedMatchMarkers.forEach((marker) => {
      outputRows.push(["matchMarker", marker.type, String(marker.timestamp)]);
    });
  }

  if (robot.unknownMessages.length > 0) {
    outputRows.push(["unknownMessage", "reason"]);
    robot.unknownMessages.forEach((unknownMessage) => {
      outputRows.push([unknownMessage.message, unknownMessage.reason]);
    });
  }

  return outputRows.map((row) => row.join(",")).join("\n");
};

export const CSVDownloader = () => {
  const robot = useRobot();

  return (
    <button
      onClick={async () => {
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle("data.csv");
        const file = await fileHandle.getFile();
        const fileText = await file.text();
        const csvText = getCsvText(fileText, robot);
        const blob = new Blob([csvText], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }}
    >
      Download CSV
    </button>
  );
};
