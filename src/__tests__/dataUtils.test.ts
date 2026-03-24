import { beforeEach, describe, expect, it } from "vitest";
import {
  CONSUMPTION,
  CURRENT,
  DRIVE_LEFT_ESC,
  DRIVE_RIGHT_ESC,
  getInitColossalAvian,
  TOTAL_CONSUMPTION,
  TOTAL_CURRENT,
  VOLTAGE,
  WEAPON_ESC,
  type Measurement,
  type Robot,
} from "../robot";
import {
  DEFAULT_COLOR,
  getColor,
  getLatestValue,
  getClampedPercent,
  HIGHLIGHT_COLOR,
  getLatestPercent,
  getLatestValueDisplay,
  calculateTotal,
  addDerivedValues,
} from "../dataUtils";

const mockMeasurement: Measurement = {
  name: VOLTAGE,
  unit: "",
  min: 20,
  max: 100,
  colorThresholds: {
    yellow: 40,
    red: 60,
  },
  highlightThreshold: 80,
  values: [],
};

const mockRobot: Robot = getInitColossalAvian();

describe("getColor", () => {
  const measurement: Measurement = { ...structuredClone(mockMeasurement) };
  it("gets correct color based on thresholds", () => {
    expect(getColor(measurement)).toBe(DEFAULT_COLOR);
    measurement.values.push(70);
    expect(getColor(measurement)).toBe("red");
    measurement.values.push(80);
    expect(getColor(measurement)).toBe(HIGHLIGHT_COLOR);
    measurement.values.push(40);
    expect(getColor(measurement)).toBe("yellow");
    measurement.values.push(20);
    expect(getColor(measurement)).toBe(DEFAULT_COLOR);
  });
});

describe("getClampedPercent", () => {
  it("calculates percent if value is 0", () => {
    expect(getClampedPercent(0, 0, 30)).toBe(0);
  });
  it("calculates percent for non-zero value", () => {
    expect(getClampedPercent(1, 0, 4)).toBe(25);
  });
  it("calculates percent for max value", () => {
    expect(getClampedPercent(150, 0, 150)).toBe(100);
  });
  it("calculates percent with non-zero minimum value", () => {
    expect(getClampedPercent(100, 50, 250)).toBe(25);
    expect(getClampedPercent(50, 50, 100)).toBe(0);
  });
  it("calculates percent with zero max value", () => {
    expect(getClampedPercent(100, 50, 250)).toBe(25);
  });
  it("calculates percent below min as 0", () => {
    expect(getClampedPercent(-10, 0, 100)).toBe(0);
  });
  it("calculates percent above max as 0", () => {
    expect(getClampedPercent(200, 0, 100)).toBe(100);
  });
});

describe("getLatestValue", () => {
  let measurement: Measurement;

  beforeEach(() => {
    measurement = { ...structuredClone(mockMeasurement) };
  });

  it("defaults to 0 if no values", () => {
    expect(getLatestValue(measurement)).toBe(0);
  });

  it("gets last value within min and max", () => {
    measurement.values.push(10);
    expect(getLatestValue(measurement)).toBe(10);
    measurement.values.push(90);
    expect(getLatestValue(measurement)).toBe(90);
  });

  it("gets last value if outside of min and max", () => {
    measurement.values.push(2);
    expect(getLatestValue(measurement)).toBe(2);
    measurement.values.push(200);
    expect(getLatestValue(measurement)).toBe(200);
  });
});

describe("getLatestPercent", () => {
  let measurement: Measurement;

  beforeEach(() => {
    measurement = { ...structuredClone(mockMeasurement) };
  });

  it("gets percent equivalent of last value", () => {
    measurement.values.push(20);
    measurement.values.push(100);
    expect(getLatestPercent(measurement)).toBe(100);
  });
});

describe("getLatestValueDisplay", () => {
  let measurement: Measurement;

  beforeEach(() => {
    measurement = { ...structuredClone(mockMeasurement) };
  });

  it("gets display value for measurement with percent unit", () => {
    measurement.unit = "%";
    measurement.values.push(40);
    expect(getLatestValueDisplay(measurement)).toBe("25%");
  });

  it("gets display value for measurement with non-percent unit", () => {
    measurement.unit = "V";
    measurement.values.push(40);
    expect(getLatestValueDisplay(measurement)).toBe("40 V");
  });

  it("gets display value for measurement with no unit", () => {
    measurement.values.push(40);
    expect(getLatestValueDisplay(measurement)).toBe("40");
  });
});

describe("calculateTotal", () => {
  it("calculates total and rounds", () => {
    const robot = { ...structuredClone(mockRobot) };
    expect(calculateTotal(VOLTAGE, robot)).toBe(0);
    robot.escs[DRIVE_LEFT_ESC].measurements[VOLTAGE].values.push(30);
    expect(calculateTotal(VOLTAGE, robot)).toBe(30);
    robot.escs[DRIVE_RIGHT_ESC].measurements[VOLTAGE].values.push(40.123);
    expect(calculateTotal(VOLTAGE, robot)).toBe(70.12);
  });
});

describe("addDerivedValues", () => {
  it("calculates voltage, current, and consumption", () => {
    const robot = {
      ...structuredClone(mockRobot),
    };
    robot.escs[DRIVE_LEFT_ESC].measurements[VOLTAGE].values.push(10);
    robot.escs[DRIVE_RIGHT_ESC].measurements[VOLTAGE].values.push(20);
    robot.escs[WEAPON_ESC].measurements[VOLTAGE].values.push(40);

    robot.escs[DRIVE_RIGHT_ESC].measurements[CURRENT].values.push(2);
    robot.escs[WEAPON_ESC].measurements[CURRENT].values.push(3);

    robot.escs[DRIVE_LEFT_ESC].measurements[CONSUMPTION].values.push(2);
    robot.escs[DRIVE_RIGHT_ESC].measurements[CONSUMPTION].values.push(4);

    addDerivedValues(robot);
    expect(robot.batteryVoltage.values).toContainEqual([10, 20, 40]);
    expect(robot.derivedValues[TOTAL_CURRENT].values).toContain(5);
    expect(robot.derivedValues[TOTAL_CONSUMPTION].values).toContain(6);
  });
});
