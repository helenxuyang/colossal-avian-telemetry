import { beforeEach, describe, expect, it } from "vitest";
import {
  CONSUMPTION,
  CURRENT,
  DRIVE_LEFT_ESC,
  DRIVE_RIGHT_ESC,
  INPUT,
  RPM,
  TEMPERATURE,
  VOLTAGE,
  WEAPON_ESC,
  type Robot,
} from "../robot";
import { getCsvData, importRobot } from "../csvUtils";
import { getMockRobotWithData } from "./testData";
import { getDefaultColossalAvianConfig } from "../storageUtils";

describe("csvUtils", () => {
  let robot: Robot;

  beforeEach(() => {
    robot = getMockRobotWithData();
  });

  const expectedCsvData = [
    [
      "type",
      "escName",
      "timestamp",
      RPM,
      VOLTAGE,
      CURRENT,
      CONSUMPTION,
      TEMPERATURE,
    ],
    ["data", DRIVE_LEFT_ESC, 1, 1000, 30, 100, 500, 25],
    ["data", DRIVE_LEFT_ESC, 5, 2000, 20, 100, 600, 50],
    ["data", DRIVE_LEFT_ESC, 10, 3000, 10, 100, 700, 75],
    ["type", "escName", "timestamp", INPUT],
    ["input", DRIVE_LEFT_ESC, 3, 0],
    ["input", DRIVE_LEFT_ESC, 6, 100],
    [
      "type",
      "escName",
      "timestamp",
      RPM,
      VOLTAGE,
      CURRENT,
      CONSUMPTION,
      TEMPERATURE,
    ],
    ["data", DRIVE_RIGHT_ESC, 2, 5000, 20, 80, 700, 50],
    ["data", DRIVE_RIGHT_ESC, 4, 6000, 30, 90, 800, 50],
    ["type", "escName", "timestamp", INPUT],
    ["input", DRIVE_RIGHT_ESC, 5, -100],
    ["input", DRIVE_RIGHT_ESC, 8, -100],
    ["type", "escName", "timestamp"],
    ["error", WEAPON_ESC, 11],
    ["error", WEAPON_ESC, 12],
    ["type", "event", "timestamp"],
    ["matchMarker", "START", 0],
    ["matchMarker", "PAUSE", 15],
    ["matchMarker", "RESUME", 20],
    ["matchMarker", "END", 25],
  ];

  describe("getCsvData", () => {
    it("exports data, inputs, errors, and match markers", () => {
      const csvData = getCsvData(robot);
      expect(csvData).toEqual(expectedCsvData);
    });
  });

  describe("importRobot", () => {
    it("imports robot", () => {
      const mockCsvData = expectedCsvData.map((row) =>
        row.map((entry) => String(entry)),
      );
      const importedRobot = importRobot(
        getDefaultColossalAvianConfig(),
        mockCsvData,
      );
      expect(importedRobot).toEqual(robot);
    });
  });
});
