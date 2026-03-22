import {
  INPUT,
  VOLTAGE,
  type EscName,
  type Input,
  type Measurement,
  type MeasurementName,
  type Robot,
} from "./robot";

export const DEFAULT_COLOR = "skyblue";
export const HIGHLIGHT_COLOR = "green";

export const getColor = (measurement: Measurement) => {
  const { colorThresholds, highlightThreshold } = measurement;
  let barColor = DEFAULT_COLOR;
  const latestValue = getLatestValue(measurement);

  const shouldHighlight = highlightThreshold
    ? latestValue >= highlightThreshold
    : false;

  if (shouldHighlight) {
    barColor = HIGHLIGHT_COLOR;
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

export const getClampedPercent = (value: number, min: number, max: number) => {
  const percent = ((value - min) / (max - min)) * 100;
  return Math.round(Math.max(Math.min(percent, 100), 0));
};

export const getLatestValue = (measurement: Measurement) => {
  const { values } = measurement;
  return values.at(-1) ?? 0;
};

export const getLatestPercent = (measurement: Measurement) => {
  return getClampedPercent(
    getLatestValue(measurement),
    measurement.min,
    measurement.max,
  );
};

export const getLatestValueDisplay = (measurement: Measurement) => {
  const { unit } = measurement;
  if (unit === "%") {
    return `${getLatestPercent(measurement)}%`;
  } else {
    return `${getLatestValue(measurement)}${unit && ` ${unit}`}`;
  }
};

export const calculateTotal = (
  measurementName: MeasurementName,
  robot: Robot,
) => {
  const values = Object.values(robot.escs).map((esc) =>
    getLatestValue(esc.measurements[measurementName]),
  );
  const total = values.reduce((sum, curr) => sum + curr, 0);
  return Number(total.toFixed(2));
};

export const addDerivedValues = (robot: Robot) => {
  // battery voltage
  const voltages = Object.values(robot.escs).map((esc) =>
    getLatestValue(esc.measurements[VOLTAGE]),
  );
  robot.batteryVoltage.values.push(voltages);

  // calculate totals
  Object.values(robot.derivedValues).forEach(({ values, measurementName }) =>
    values.push(calculateTotal(measurementName, robot)),
  );
  return robot;
};

export const getMeasurementOrInput = (
  robot: Robot,
  esc: EscName,
  key: MeasurementName | typeof INPUT,
): Input | Measurement => {
  return key === INPUT
    ? robot.escs[esc].inputs
    : robot.escs[esc].measurements[key];
};

export type MeasurementId = `${EscName}-${MeasurementName}`;
export type InputId = `${EscName}-${typeof INPUT}`;
export type PlotId = MeasurementId | InputId;
export type PlotMeasurementName = MeasurementName | typeof INPUT;

const measurementIdDelimiter = "-";
export const getMeasurementId = (
  escName: EscName,
  measurementName: MeasurementName,
) => {
  return `${escName}${measurementIdDelimiter}${measurementName}` as MeasurementId;
};

export const parseMeasurementId = (
  id: PlotId,
): {
  escName: EscName;
  measurementName: PlotMeasurementName;
} => {
  const [escName, measurementName] = id.split(measurementIdDelimiter);
  return {
    escName: escName as EscName,
    measurementName: measurementName as PlotMeasurementName,
  };
};
