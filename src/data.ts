export type Measurement = {
  name: string;
  unit: string;
  min: number;
  max: number;
  values: number[];
  colorThresholds?: Record<string, number>;
  highlightThreshold?: number;
  shouldShow?: boolean;
  shouldPlot?: boolean;
  shouldShowPercent?: boolean;
};

export const TEMPERATURE = "Temp";
export const RPM = "RPM";
export const VOLTAGE = "Voltage";
export const CURRENT = "Current";
export const CONSUMPTION = "Consumption";
export const INPUT = "Input";

export const BATTERY_VOLTAGE = "Battery Voltage";
export const TOTAL_CURRENT = "Total Current";
export const TOTAL_CONSUMPTION = "Total Consumption";

export type BatteryVoltageRange = {
  min: number;
  max: number;
};
export type BatteryVoltageMeasurement = {
  name: string;
  unit: string;
  min: number;
  max: number;
  minValues: number[];
  maxValues: number[];
};

export type ESC = {
  name: string;
  abbreviation: string;
  measurements: Record<string, Measurement>;
};

export const getInitEscMeasurements = ({
  rpmMax = 20000,
  rpmHighlight,
}: {
  rpmMax?: number;
  rpmHighlight?: number;
}): Record<string, Measurement> => {
  return {
    [RPM]: {
      name: RPM,
      unit: "RPM",
      min: 0,
      max: rpmMax,
      values: [],
      highlightThreshold: rpmHighlight,
      shouldPlot: false,
    },
    [VOLTAGE]: {
      name: VOLTAGE,
      unit: "V",
      min: 16,
      max: 26,
      values: [],
      shouldShow: false,
    },
    [CURRENT]: {
      name: CURRENT,
      unit: "A",
      min: 0,
      max: 30,
      values: [],
      shouldPlot: false,
    },
    [CONSUMPTION]: {
      name: CONSUMPTION,
      unit: "mAh",
      min: 0,
      max: 3000,
      values: [],
      shouldShow: false,
    },
    [TEMPERATURE]: {
      name: TEMPERATURE,
      unit: "°C",
      min: 25,
      max: 100,
      values: [],
      colorThresholds: {
        gold: 68,
        orange: 75,
        red: 85,
      },
      shouldPlot: false,
    },
    [INPUT]: {
      name: INPUT,
      unit: "%",
      min: 1000,
      max: 2000,
      values: [],
      shouldPlot: false,
      shouldShowPercent: true,
    },
  };
};

export type Robot = {
  name: string;
  escs: Record<string, ESC>;
  derivedValues: Record<string, Measurement>;
  batteryVoltage: BatteryVoltageMeasurement;
};

export const DRIVE_LEFT_ESC = "DriveLeft";
export const DRIVE_RIGHT_ESC = "DriveRight";
export const ARM_ESC = "Arm";
export const WEAPON_ESC = "Weapon";

export const getInitColossalAvian = () => {
  const escs = [DRIVE_LEFT_ESC, DRIVE_RIGHT_ESC, WEAPON_ESC, ARM_ESC].reduce(
    (acc, name) => {
      acc[name] = {
        name,
        abbreviation: name
          .split("")
          .filter((char) => char.toUpperCase() === char)
          .join(""),
        measurements: getInitEscMeasurements({
          rpmMax:
            name === DRIVE_LEFT_ESC || name === DRIVE_RIGHT_ESC ? 35000 : 20000,
          rpmHighlight: name === WEAPON_ESC ? 15000 : undefined,
        }),
      };
      return acc;
    },
    {} as Record<string, ESC>,
  );
  const derivedValues: Record<string, Measurement> = {
    [TOTAL_CURRENT]: {
      name: TOTAL_CURRENT,
      unit: "A",
      min: 0,
      max: 400,
      values: [],
    },
    [TOTAL_CONSUMPTION]: {
      name: TOTAL_CONSUMPTION,
      unit: "mAh",
      min: 0,
      max: 12000,
      values: [],
      shouldShow: false,
    },
  };
  const batteryVoltage: BatteryVoltageMeasurement = {
    name: BATTERY_VOLTAGE,
    unit: "V",
    min: 16,
    max: 26,
    minValues: [],
    maxValues: [],
  };
  return {
    name: "Colossal Avian",
    escs,
    derivedValues,
    batteryVoltage,
  };
};

export const getColor = (measurement: Measurement) => {
  const { colorThresholds, highlightThreshold } = measurement;
  let barColor = "skyblue";
  const latestValue = getLatestValue(measurement);

  const shouldHighlight = highlightThreshold
    ? latestValue >= highlightThreshold
    : false;

  if (shouldHighlight) {
    barColor = "green";
  } else {
    if (!colorThresholds) {
      return barColor;
    }
    const sortedColorThresholds = [...Object.keys(colorThresholds)].sort(
      (color1, color2) => {
        return colorThresholds[color1] > colorThresholds[color2] ? 1 : -1;
      },
    );
    sortedColorThresholds.forEach((color) => {
      const threshold = colorThresholds[color];
      if (latestValue >= threshold) {
        barColor = color;
      }
    });
  }
  return barColor;
};

export const getPercent = (value: number, min: number, max: number) => {
  const percent = ((value - min) / (max - min)) * 100;
  return Math.round(Math.max(Math.min(percent, 100), 0));
};

export const getLatestValue = (measurement: Measurement) => {
  const { values, shouldShowPercent, min, max } = measurement;
  const latestValue = values.at(-1) ?? 0;
  if (shouldShowPercent) {
    return getPercent(latestValue, min, max);
  }
  return values.at(-1) ?? 0;
};

export const getLatestPercent = (measurement: Measurement) => {
  return getPercent(
    getLatestValue(measurement),
    measurement.min,
    measurement.max,
  );
};

export const calculateTotal = (measurementName: string, robot: Robot) => {
  const values = Object.values(robot.escs).map((esc) =>
    getLatestValue(esc.measurements[measurementName]),
  );
  const total = values.reduce((sum, curr) => sum + curr, 0);
  return Number(total.toFixed(2));
};

export const calculateDerivedValues = (robot: Robot) => {
  const newRobot = { ...robot };
  const voltages = Object.values(robot.escs).map((esc) =>
    getLatestValue(esc.measurements[VOLTAGE]),
  );
  newRobot.batteryVoltage.minValues.push(Math.min(...voltages));
  newRobot.batteryVoltage.maxValues.push(Math.max(...voltages));

  newRobot.derivedValues[TOTAL_CURRENT].values.push(
    calculateTotal(CURRENT, robot),
  );
  newRobot.derivedValues[TOTAL_CONSUMPTION].values.push(
    calculateTotal(CONSUMPTION, robot),
  );
  return newRobot;
};
