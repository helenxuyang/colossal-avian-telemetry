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

export type Input = Omit<Measurement, "name"> & {
  name: typeof INPUT;
  timestamps: number[];
};

export type DerivedValue = Omit<Measurement, "name"> & {
  name: DerivedValueName;
  measurementName: MeasurementName;
};

export const TEMPERATURE = "Temp";
export const RPM = "RPM";
export const VOLTAGE = "Voltage";
export const CURRENT = "Current";
export const CONSUMPTION = "Consumption";
export const INPUT = "Input" as const;

export type MeasurementName =
  | typeof TEMPERATURE
  | typeof RPM
  | typeof VOLTAGE
  | typeof CURRENT
  | typeof CONSUMPTION;

export const BATTERY_VOLTAGE = "Battery Voltage";
export const TOTAL_CURRENT = "Total Current";
export const TOTAL_CONSUMPTION = "Total Consumption";

export const ALL_DERIVED_VALUES = [TOTAL_CURRENT, TOTAL_CONSUMPTION];
export type DerivedValueName = (typeof ALL_DERIVED_VALUES)[number];

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

type MeasurementMap = Record<MeasurementName, Measurement>;

export type ESC = {
  name: EscName;
  abbreviation: string;
  timestamps: number[];
  measurements: MeasurementMap;
  inputs: Input;
};

export const getInitEscMeasurements = ({
  rpmMax = 20000,
  rpmHighlight,
}: {
  rpmMax?: number;
  rpmHighlight?: number;
}): MeasurementMap => {
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
  escs: Record<EscName, ESC>;
  derivedValues: Record<DerivedValueName, DerivedValue>;
  batteryVoltage: BatteryVoltageMeasurement;
  initialTimestamp: number | null;
  matchMarkers: MatchMarker[];
};

export const DRIVE_LEFT_ESC = "DriveLeft";
export const DRIVE_RIGHT_ESC = "DriveRight";
export const ARM_ESC = "Arm";
export const WEAPON_ESC = "Weapon";

// no arm yet
export const ALL_ESCS = [DRIVE_LEFT_ESC, DRIVE_RIGHT_ESC, WEAPON_ESC] as const;
export type EscName = (typeof ALL_ESCS)[number];

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

  const derivedValues: Record<DerivedValueName, DerivedValue> = {
    [TOTAL_CURRENT]: {
      name: TOTAL_CURRENT,
      measurementName: CURRENT,
      unit: "A",
      min: 0,
      max: 400,
      values: [],
    },
    [TOTAL_CONSUMPTION]: {
      name: TOTAL_CONSUMPTION,
      measurementName: CONSUMPTION,
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
