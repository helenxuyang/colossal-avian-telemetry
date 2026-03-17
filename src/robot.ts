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

export type Input = Measurement & {
  timestamps: number[];
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
  values: number[][];
};

export type ESC = {
  name: string;
  abbreviation: string;
  timestamps: number[];
  measurements: Record<string, Measurement>;
  inputs: Input;
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
      shouldPlot: true,
    },
    [VOLTAGE]: {
      name: VOLTAGE,
      unit: "V",
      min: 16,
      max: 26,
      values: [],
      shouldShow: false,
      // shouldPlot: true,
    },
    [CURRENT]: {
      name: CURRENT,
      unit: "A",
      min: 0,
      max: 30,
      values: [],
      shouldPlot: true,
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
  };
};

export type MatchMarker = {
  type: "START" | "PAUSE" | "RESUME" | "END";
  timestamp: number;
};

export type Robot = {
  name: string;
  escs: Record<string, ESC>;
  derivedValues: Record<string, Measurement>;
  batteryVoltage: BatteryVoltageMeasurement;
  initialTimestamp: number | null;
  matchMarkers: MatchMarker[];
};

export const DRIVE_LEFT_ESC = "DriveLeft";
export const DRIVE_RIGHT_ESC = "DriveRight";
export const ARM_ESC = "Arm";
export const WEAPON_ESC = "Weapon";

// no arm yet
export const ALL_ESCS = [DRIVE_LEFT_ESC, DRIVE_RIGHT_ESC, WEAPON_ESC];

export const getInitColossalAvian = (): Robot => {
  const escs = ALL_ESCS.reduce(
    (acc, name) => {
      acc[name] = {
        name,
        abbreviation: name
          .split("")
          .filter((char) => char.toUpperCase() === char)
          .join(""),
        timestamps: [],
        measurements: getInitEscMeasurements({
          rpmMax:
            name === DRIVE_LEFT_ESC || name === DRIVE_RIGHT_ESC ? 35000 : 20000,
          rpmHighlight: name === WEAPON_ESC ? 15000 : undefined,
        }),
        inputs: {
          name: INPUT,
          unit: "",
          min: -100,
          max: 100,
          values: [],
          timestamps: [],
          shouldPlot: false,
          shouldShowPercent: false,
        },
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
    values: [],
  };
  return {
    name: "Colossal Avian",
    escs,
    derivedValues,
    batteryVoltage,
    initialTimestamp: null,
    matchMarkers: [],
  };
};
