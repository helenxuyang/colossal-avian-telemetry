import { addDerivedValues } from "./dataUtils";
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
  type EscName,
  type Measurement,
  type MeasurementName,
  type Robot,
} from "./robot";

export const mergeBytes = (byte1: number, byte2: number) => {
  return (byte1 << 8) + byte2;
};

type EscId = "a" | "b" | "c" | "w" | "x" | "y";
const escDataIds = ["a", "b", "c"];
const escInputIds = ["w", "x", "y"];
const idToEscMap: Record<EscId, EscName> = {
  a: DRIVE_LEFT_ESC,
  b: DRIVE_RIGHT_ESC,
  c: WEAPON_ESC,
  w: DRIVE_LEFT_ESC,
  x: DRIVE_RIGHT_ESC,
  y: WEAPON_ESC,
};
const escToIdMap: Record<EscName, EscId> = Object.entries(idToEscMap).reduce(
  (acc, [key, val]) => {
    acc[val] = key as EscId;
    return acc;
  },
  {} as Record<EscName, EscId>,
);

export type EscData = {
  dataType: "data";
  [TEMPERATURE]: number;
  [VOLTAGE]: number;
  [CURRENT]: number;
  [CONSUMPTION]: number;
  [RPM]: number;
};

export type EscInputData = {
  dataType: "input";
  [INPUT]: number;
};

export type ParsedData = {
  escName: EscName;
  timestamp: number;
  escData: EscData | EscInputData;
};

export const parseData = (data: string) => {
  /* Data formats:
  
  ESC telemetry data: 
  ESC ID (a, b, c, or d)
  Byte 0: Temperature
  Byte 1: Voltage high byte
  Byte 2: Voltage low byte
  Byte 3: Current high byte
  Byte 4: Current low byte
  Byte 5: Consumption high byte
  Byte 6: Consumption low byte
  Byte 7: Rpm high byte
  Byte 8: Rpm low byte
  Byte 9: Checksum (ignore for now)
  Timestamp

  ESC input data: 
  ESC ID (w, x, y, z)
  Value
  Timestamp

  Error:
  ESC ID (a, b, c, d)
  "x" 
  Timestamp

  Data conversions:
  temp: as-is, in C
  voltage: / 100, in V
  current: / 100, in A
  consumption: as-is, in mAh
  rpm: * 100, then divide by 6 for drive, divide by 7 for arm/weapon
  time since start: as-is, in ms
 */

  const splitData = data.slice(1, data.length - 1).split(" ");
  const escId = splitData[0];
  const escName = idToEscMap[escId as EscId];

  const values = splitData.slice(1).map((entry) => Number("0x" + entry));

  if (escDataIds.includes(escId)) {
    const rpmFactor =
      escId === escToIdMap[WEAPON_ESC]
        ? 1 / 7 // TODO: if add arm, it's also 1/7
        : 1 / 6;
    const timestamp = Number(values[10]);

    const parsedData: ParsedData = {
      escName,
      timestamp,
      escData: {
        dataType: "data",
        [TEMPERATURE]: values[0],
        [VOLTAGE]: Number((mergeBytes(values[1], values[2]) / 100).toFixed(2)),
        [CURRENT]: Number((mergeBytes(values[3], values[4]) / 100).toFixed(2)),
        [CONSUMPTION]: mergeBytes(values[5], values[6]),
        [RPM]: Math.round(mergeBytes(values[7], values[8]) * 100 * rpmFactor),
      },
    };
    return parsedData;
  } else if (escInputIds.includes(escId)) {
    const value = values[0];
    const timestamp = values[1];
    const parsedData: ParsedData = {
      escName,
      timestamp,
      escData: {
        dataType: "input",
        [INPUT]: Math.round(0.2 * value - 300), // scale from [1000, 2000] -> [-100, 100]
      },
    };
    return parsedData;
  }
  throw Error("invalid message");
};

export const getUpdatedRobot = (data: ParsedData, robot: Robot) => {
  const { escName, timestamp, escData } = data;
  const newRobot = structuredClone(robot);
  if (newRobot.initialTimestamp === null) {
    newRobot.initialTimestamp = Date.now() - timestamp;
  }

  const { dataType, ...dataValues } = escData;

  if (dataType === "data") {
    Object.entries(dataValues).forEach(([measurementKey, measurementValue]) => {
      newRobot.escs[escName].measurements[
        measurementKey as MeasurementName
      ].values.push(measurementValue);
    });
    newRobot.escs[escName].timestamps.push(timestamp);
  } else if (dataType === "input") {
    newRobot.escs[escName].inputs.timestamps.push(timestamp);
    newRobot.escs[escName].inputs.values.push(escData[INPUT]);
  }

  addDerivedValues(newRobot);
  return newRobot;
};

export const generateMockValue = (measurement: Measurement) => {
  const { min, max, values } = measurement;
  const previousValue = values.at(-1);
  if (!previousValue) {
    const randomValue = Math.round(Math.random() * (max - min) + min);
    return randomValue;
  }
  const sign = Math.random() > 0.5 ? 1 : -1;

  const randomValue = Math.round(
    Math.min(max, Math.max(min, previousValue + 1 * sign)),
  );
  return randomValue;
};

export const generateMockValueTwoByteHex = (num: number) => {
  const highByte = ((num & Number("0xFF00")) >> 8).toString(16);
  const lowByte = (num & Number("0x00FF")).toString(16);
  const combined = `${highByte} ${lowByte}`;
  return combined;
};

const escIds = ["a", "b", "c", "w", "x", "y"];
let escIndex = 0;

export const getMockEscMessageGenerator = (startTime: number, robot: Robot) => {
  const generateMockESCMessage = () => {
    const escId = escIds[escIndex] as EscId;
    const escName = idToEscMap[escId];
    const esc = robot.escs[escName];
    const messageComponents = [];
    const timestamp = Date.now() - startTime;

    if (escDataIds.includes(escId)) {
      // component 0: temp
      const mockTemp = generateMockValue(
        esc.measurements[TEMPERATURE],
      ).toString(16);
      messageComponents.push(mockTemp);

      // component 1-2: voltage
      const mockVoltage = generateMockValue(esc.measurements[VOLTAGE]) * 100;
      const mockVoltageHex = generateMockValueTwoByteHex(mockVoltage);
      messageComponents.push(mockVoltageHex);

      // component 3-4: current
      const mockCurrent = generateMockValue(esc.measurements[CURRENT]) * 100;
      const mockCurrentHex = generateMockValueTwoByteHex(mockCurrent);
      messageComponents.push(mockCurrentHex);

      // component 5-6: consumption
      const mockConsumption = generateMockValue(esc.measurements[CONSUMPTION]);
      const mockConsumptionHex = generateMockValueTwoByteHex(mockConsumption);
      messageComponents.push(mockConsumptionHex);

      // component 7-8: RPM
      const mockRPM =
        (generateMockValue(esc.measurements[RPM]) / 100) *
        (escName === WEAPON_ESC ? 7 : 6); // TODO: if add arm, it's also 7
      const mockRPMHex = generateMockValueTwoByteHex(mockRPM);
      messageComponents.push(mockRPMHex);

      // component 9: checksum (ignore for now)
      messageComponents.push("00");

      // component 10: timestamp
      messageComponents.push(timestamp.toString(16));
    } else if (escInputIds.includes(escId)) {
      // component 1: input
      const mockInput = (generateMockValue(esc.inputs) + 300) * 5;
      messageComponents.push(mockInput.toString(16));
      // component 2: timestamp
      messageComponents.push(timestamp.toString(16));
    }

    const message = `<${escId} ${messageComponents.join(" ")}>`;
    // end marker
    escIndex = escIndex >= escIds.length - 1 ? 0 : escIndex + 1;
    return message;
  };

  return generateMockESCMessage;
};
