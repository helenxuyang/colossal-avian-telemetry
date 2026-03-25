import { beforeEach, describe, expect, it } from "vitest";
import {
  CONSUMPTION,
  CURRENT,
  DRIVE_LEFT_ESC,
  DRIVE_RIGHT_ESC,
  getInitColossalAvian,
  INPUT,
  RPM,
  TEMPERATURE,
  VOLTAGE,
  WEAPON_ESC,
  type Robot,
} from "../robot";
import { getCsvData, importRobot } from "../csvUtils";

describe("csvUtils", () => {
  let robot: Robot;

  beforeEach(() => {
    robot = getInitColossalAvian();

    robot.escs[DRIVE_LEFT_ESC].timestamps = [1, 5, 10];
    robot.escs[DRIVE_LEFT_ESC].measurements[RPM].values = [1000, 2000, 3000];
    robot.escs[DRIVE_LEFT_ESC].measurements[VOLTAGE].values = [30, 20, 10];
    robot.escs[DRIVE_LEFT_ESC].measurements[CURRENT].values = [100, 100, 100];
    robot.escs[DRIVE_LEFT_ESC].measurements[CONSUMPTION].values = [
      500, 600, 700,
    ];
    robot.escs[DRIVE_LEFT_ESC].measurements[TEMPERATURE].values = [25, 50, 75];
    robot.escs[DRIVE_LEFT_ESC].inputs.timestamps = [3, 6];
    robot.escs[DRIVE_LEFT_ESC].inputs.values = [0, 100];

    robot.escs[DRIVE_RIGHT_ESC].timestamps = [2, 4];
    robot.escs[DRIVE_RIGHT_ESC].measurements[RPM].values = [5000, 6000];
    robot.escs[DRIVE_RIGHT_ESC].measurements[VOLTAGE].values = [20, 30];
    robot.escs[DRIVE_RIGHT_ESC].measurements[CURRENT].values = [80, 90];
    robot.escs[DRIVE_RIGHT_ESC].measurements[CONSUMPTION].values = [700, 800];
    robot.escs[DRIVE_RIGHT_ESC].measurements[TEMPERATURE].values = [50, 50];
    robot.escs[DRIVE_RIGHT_ESC].inputs.timestamps = [5, 8];
    robot.escs[DRIVE_RIGHT_ESC].inputs.values = [-100, -100];

    robot.escs[WEAPON_ESC].errors = [{ timestamp: 11 }, { timestamp: 12 }];

    robot.matchMarkers = [
      {
        type: "START",
        timestamp: 0,
      },
      {
        type: "PAUSE",
        timestamp: 15,
      },
      {
        type: "RESUME",
        timestamp: 20,
      },
      {
        type: "END",
        timestamp: 25,
      },
    ];
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
      const importedRobot = importRobot(mockCsvData);
      expect(importedRobot).toEqual(robot);
    });
  });
});
