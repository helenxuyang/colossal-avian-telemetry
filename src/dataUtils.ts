import {
  CONSUMPTION,
  CURRENT,
  TOTAL_CONSUMPTION,
  TOTAL_CURRENT,
  VOLTAGE,
  type Measurement,
  type Robot,
} from "./robot";

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
  const { values } = measurement;
  return values.at(-1) ?? 0;
};

export const getLatestPercent = (measurement: Measurement) => {
  return getPercent(
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
    return `${getLatestValue(measurement)} ${unit}`;
  }
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
  newRobot.batteryVoltage.values.push(voltages);

  newRobot.derivedValues[TOTAL_CURRENT].values.push(
    calculateTotal(CURRENT, robot),
  );
  newRobot.derivedValues[TOTAL_CONSUMPTION].values.push(
    calculateTotal(CONSUMPTION, robot),
  );
  return newRobot;
};

const measurementIdDelimiter = "-";
export const getMeasurementId = (escName: string, measurementName: string) => {
  return `${escName}${measurementIdDelimiter}${measurementName}`;
};
export const parseMeasurementId = (id: string) => {
  const [escName, measurementName] = id.split(measurementIdDelimiter);
  return {
    escName,
    measurementName,
  };
};
