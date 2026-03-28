import { mapMeasurements } from "./dataUtils";

export type Measurement = {
  name: string;
  unit: string;
  min: number;
  max: number;
  actualMin?: number;
  actualMax?: number;
  values: number[];
  colorThresholds?: Record<string, number>;
  highlightThreshold?: number;
  shouldShow: boolean;
  shouldShowPercent?: boolean;
};

export type Input = Omit<Measurement, "name"> & {
  name: typeof INPUT;
  timestamps: number[];
  shouldShow: boolean;
};

export const TEMPERATURE = "Temp";
export const RPM = "RPM";
export const VOLTAGE = "Voltage";
export const CURRENT = "Current";
export const CONSUMPTION = "Consumption";
export const INPUT = "Input" as const;
export const POWER = "Power" as const;
export const ERROR = "Error" as const;

export type MeasurementName =
  | typeof TEMPERATURE
  | typeof RPM
  | typeof VOLTAGE
  | typeof CURRENT
  | typeof CONSUMPTION;

export const TOTAL_CURRENT = "Total Current";
export const TOTAL_CONSUMPTION = "Total Consumption";

export const ALL_DERIVED_VALUES = [TOTAL_CURRENT, TOTAL_CONSUMPTION];
export type DerivedValueName = (typeof ALL_DERIVED_VALUES)[number];

type MeasurementMap = Record<string, Measurement>;
type EscError = {
  timestamp: number;
  // TODO: might have error codes or something later
};

export type ESC = {
  name: EscName;
  abbreviation: string;
  timestamps: number[];
  errors: EscError[];
  measurements: MeasurementMap;
  inputs: Input;
};

export const getInitEscMeasurements = ({
  rpmMax = 20000,
  rpmHighlight = undefined,
  voltageMin = 16,
  voltageMax = 26,
  maxCurrent = 30,
  maxConsumption = 3000,
}: {
  rpmMax?: number;
  rpmHighlight?: number;
  voltageMin?: number;
  voltageMax?: number;
  maxCurrent?: number;
  maxConsumption?: number;
}): MeasurementMap => {
  return {
    [RPM]: {
      name: RPM,
      unit: "RPM",
      min: 0,
      max: rpmMax,
      values: [],
      highlightThreshold: rpmHighlight,
      shouldShow: true,
    },
    [VOLTAGE]: {
      name: VOLTAGE,
      unit: "V",
      min: voltageMin,
      max: voltageMax,
      values: [],
      shouldShow: true,
    },
    [CURRENT]: {
      name: CURRENT,
      unit: "A",
      min: 0,
      max: maxCurrent,
      values: [],
      shouldShow: true,
    },
    [CONSUMPTION]: {
      name: CONSUMPTION,
      unit: "mAh",
      min: 0,
      max: maxConsumption,
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
      shouldShow: true,
    },
  };
};

export const getInitEsc = (
  name: EscName,
  measurements: MeasurementMap,
): ESC => {
  return {
    name,
    abbreviation: name
      .split("")
      .filter((char) => char.toUpperCase() === char)
      .join(""),
    timestamps: [],
    measurements,
    inputs: {
      name: INPUT,
      unit: "",
      min: -100,
      max: 100,
      values: [],
      timestamps: [],
      shouldShowPercent: false,
      shouldShow: true,
    },
    errors: [],
  };
};

export type MatchMarker = {
  type: "START" | "PAUSE" | "RESUME" | "END";
  timestamp: number;
};

export type UnknownMessage = {
  message: string;
  reason: string;
};

export type Robot = {
  name: string;
  escs: Record<EscName, ESC>;
  initialTimestamp: number | null;
  matchMarkers: MatchMarker[];
  unknownMessages: UnknownMessage[];
};

export const DRIVE_LEFT_ESC = "DriveLeft" as const;
export const DRIVE_RIGHT_ESC = "DriveRight" as const;
export const ARM_ESC = "Arm" as const;
export const WEAPON_ESC = "Weapon" as const;

export type EscName = string;
// TODO: fix types later?
// | typeof DRIVE_LEFT_ESC
// | typeof DRIVE_RIGHT_ESC
// | typeof WEAPON_ESC;
// | typeof ARM_ESC;

export const getInitColossalAvian = (): Robot => {
  // no arm yet
  const allEscs: EscName[] = [
    DRIVE_LEFT_ESC,
    DRIVE_RIGHT_ESC,
    WEAPON_ESC,
    ARM_ESC,
  ];
  const escs = allEscs.reduce(
    (acc, name) => {
      const measurementMap = getInitEscMeasurements({
        rpmMax:
          name === DRIVE_LEFT_ESC || name === DRIVE_RIGHT_ESC ? 35000 : 20000,
        rpmHighlight: name === WEAPON_ESC ? 15000 : undefined,
      });

      if (name === ARM_ESC) {
        mapMeasurements(measurementMap, (measurement) => {
          if (measurement.name !== INPUT) {
            measurement.shouldShow = false;
          }
        });
      }

      acc[name] = getInitEsc(name, measurementMap);
      return acc;
    },
    {} as Record<EscName, ESC>,
  );

  return {
    name: "Colossal Avian",
    escs,
    initialTimestamp: null,
    matchMarkers: [],
    unknownMessages: [],
  };
};

export const getInitStackOverflow = (): Robot => {
  const voltageMin = 0; // TODO: update?
  const voltageMax = 15.2;
  const rpmMax = 18000;
  const maxCurrent = 80;

  return {
    name: "Stack Overflow",
    escs: {
      [WEAPON_ESC]: getInitEsc(
        WEAPON_ESC,
        getInitEscMeasurements({
          rpmMax,
          rpmHighlight: rpmMax * 0.8,
          maxConsumption: 850,
          maxCurrent,
          voltageMin,
          voltageMax,
        }),
      ),
    },
    initialTimestamp: null,
    matchMarkers: [],
    unknownMessages: [],
  };
};
