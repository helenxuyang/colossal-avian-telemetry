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

export type ESC = {
  name: string;
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
      shouldPlot: true,
    },
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
      min: 5,
      max: 28,
      values: [],
      shouldShow: true,
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
      max: 30,
      values: [],
      shouldShow: false,
    },
    [INPUT]: {
      name: INPUT,
      unit: "%",
      min: 1000,
      max: 2000,
      values: [],
      shouldPlot: true,
      shouldShowPercent: true,
    },
  };
};

export type Robot = {
  name: string;
  escs: Record<string, ESC>;
  measurements: Record<string, Measurement>;
};

export const DRIVE_LEFT_ESC = "DriveLeft";
export const DRIVE_RIGHT_ESC = "DriveRight";
export const ARM_ESC = "Arm";
export const WEAPON_ESC = "Weapon";

export const getInitColossalAvian = () => {
  const escs = [DRIVE_LEFT_ESC, DRIVE_RIGHT_ESC, ARM_ESC, WEAPON_ESC].reduce(
    (acc, name) => {
      acc[name] = {
        name,
        measurements: getInitEscMeasurements({
          rpmMax:
            name === DRIVE_LEFT_ESC || name === DRIVE_RIGHT_ESC ? 35000 : 20000,
          rpmHighlight: name === WEAPON_ESC ? 15000 : undefined,
        }),
      };
      return acc;
    },
    {} as Record<string, ESC>
  );
  const measurements: Record<string, Measurement> = {
    batteryVoltage: {
      name: "Battery Voltage",
      unit: "V",
      min: 5,
      max: 28,
      values: [],
    },
    totalCurrent: {
      name: "Total Current",
      unit: "A",
      min: 0,
      max: 400,
      values: [],
    },
    totalConsumption: {
      name: "Total Consumption",
      unit: "mAh",
      min: 0,
      max: 0,
      values: [],
    },
  };
  return {
    name: "Colossal Avian",
    escs,
    measurements,
  };
};

export const getColor = (measurement: Measurement) => {
  const { colorThresholds, highlightThreshold, values } = measurement;
  let barColor = "skyblue";
  const latestValue = values.at(-1) ?? 0;

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
      }
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

export const getLatestValue = (measurement: Measurement) => {
  const { values, shouldShowPercent, min, max } = measurement;
  const latestValue = values.at(-1) ?? 0;
  if (shouldShowPercent) {
    return Math.min(100, ((latestValue - min) / (max - min)) * 100);
  }
};
