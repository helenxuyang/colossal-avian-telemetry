import {
  ARM_ESC,
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
  type Robot,
} from "./robot";

export const mergeBytes = (byte1: number, byte2: number) => {
  return (byte1 << 8) + byte2;
};

const escDataIds = ["a", "b", "c"] as const;
const escInputIds = ["w", "x", "y", "z"] as const;
type EscDataId = (typeof escDataIds)[number];
type EscInputId = (typeof escInputIds)[number];
type EscId = EscDataId | EscInputId;

export const idToEscMap: Record<EscId, EscName> = {
  a: DRIVE_LEFT_ESC,
  b: DRIVE_RIGHT_ESC,
  c: WEAPON_ESC,
  w: DRIVE_LEFT_ESC,
  x: DRIVE_RIGHT_ESC,
  y: WEAPON_ESC,
  z: ARM_ESC,
};
const escToIdMap: Record<EscName, EscId> = Object.entries(idToEscMap).reduce(
  (acc, [key, val]) => {
    acc[val] = key as EscId;
    return acc;
  },
  {} as Record<EscName, EscId>,
);

const ERROR_MARKER = "x";

export type EscDataMessage = {
  messageType: "data";
  escName: EscName;
  timestamp: number;
  escData: {
    [TEMPERATURE]: number;
    [VOLTAGE]: number;
    [CURRENT]: number;
    [CONSUMPTION]: number;
    [RPM]: number;
  };
};

export type EscInputMessage = {
  messageType: "input";
  escName: EscName;
  timestamp: number;
  escData: {
    [INPUT]: number;
  };
};

export type EscErrorMessage = {
  messageType: "error";
  escName: EscName;
  timestamp: number;
};

export type UnknownMessage = {
  messageType: "unknown";
  message: string;
  reason: string;
};

export type ParsedMessage =
  | EscDataMessage
  | EscInputMessage
  | EscErrorMessage
  | UnknownMessage;

export const getUnknownMessageReason = (message: string): string | null => {
  if (typeof message !== "string") {
    return "message is not string";
  }
  const components = message.slice(1, message.length - 1).split(" ");

  if (components.length < 3) {
    return "message does not have enough components";
  }
  if (message[0] !== "<") {
    return "message missing start marker";
  }
  const id = components[0];
  if (
    !escDataIds.includes(id as EscDataId) &&
    !escInputIds.includes(id as EscInputId)
  ) {
    return "message does not have valid ESC ID";
  }

  if (components[1] === "x") {
    if (isNaN(Number("0x" + components[2]))) {
      return "message has invalid timestamp";
    }
  } else {
    for (let i = 1; i < components.length - 1; i++) {
      if (isNaN(Number("0x" + components[i]))) {
        return `message has invalid component ${components[i]}`;
      }
    }
  }

  if (message[message.length - 1] !== ">") {
    return "message missing end marker";
  }

  return null;
};

export const parseMessage = (message: string): ParsedMessage => {
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

  const unknownErrorReason = getUnknownMessageReason(message);
  if (unknownErrorReason) {
    return {
      messageType: "unknown",
      message,
      reason: unknownErrorReason,
    };
  }

  const splitData = message.slice(1, message.length - 1).split(" ");
  const escId = splitData[0] as EscId;
  const escName = idToEscMap[escId];

  if (splitData[1] === ERROR_MARKER) {
    const timestamp = Number(splitData[2]);
    return {
      messageType: "error",
      escName,
      timestamp,
    };
  }

  const values = splitData.slice(1).map((entry) => Number("0x" + entry));

  if (escDataIds.includes(escId as EscDataId)) {
    const rpmFactor =
      escId === escToIdMap[WEAPON_ESC] || escId === escToIdMap[ARM_ESC]
        ? 1 / 7
        : 1 / 6;
    const timestamp = Number(values[10]);

    const parsedMessage: ParsedMessage = {
      messageType: "data",
      escName,
      timestamp,
      escData: {
        [TEMPERATURE]: values[0],
        [VOLTAGE]: Number((mergeBytes(values[1], values[2]) / 100).toFixed(2)),
        [CURRENT]: Number((mergeBytes(values[3], values[4]) / 100).toFixed(2)),
        [CONSUMPTION]: mergeBytes(values[5], values[6]),
        [RPM]: Math.round(mergeBytes(values[7], values[8]) * 100 * rpmFactor),
      },
    };
    return parsedMessage;
  } else if (escInputIds.includes(escId as EscInputId)) {
    const value = values[0];
    const timestamp = values[1];
    const parsedMessage: ParsedMessage = {
      messageType: "input",
      escName,
      timestamp,
      escData: {
        [INPUT]: Math.round(0.2 * value - 300), // scale from [1000, 2000] -> [-100, 100]
      },
    };
    return parsedMessage;
  }
  throw Error("invalid message");
};

export const stringifyMessage = (parsedMessage: ParsedMessage) => {
  return JSON.stringify(Object.values(parsedMessage)); // [parsedMessage.messageType].join(",");
};

export const getUpdatedRobot = (parsedMessage: ParsedMessage, robot: Robot) => {
  const newRobot = structuredClone(robot);

  const { messageType } = parsedMessage;

  if (parsedMessage.messageType === "unknown") {
    newRobot.unknownMessages.push({
      message: parsedMessage.message,
      reason: parsedMessage.reason,
    });
    return newRobot;
  }

  const { timestamp, escName } = parsedMessage;

  // for Stack--no drive but can still get drive inputs from noise
  if (!newRobot.escs[escName]) {
    return newRobot;
  }

  if (newRobot.initialTimestamp === null) {
    newRobot.initialTimestamp = Date.now() - timestamp;
  }

  if (messageType === "error") {
    newRobot.escs[escName].errors.push({ timestamp });
    return newRobot;
  }

  if (messageType === "data") {
    const { escData } = parsedMessage;
    Object.entries(escData).forEach(([measurementKey, measurementValue]) => {
      newRobot.escs[escName].measurements[measurementKey].values = [
        measurementValue,
      ];
    });
    newRobot.escs[escName].timestamps = [timestamp];
  } else if (messageType === "input") {
    const { escData } = parsedMessage;
    newRobot.escs[escName].inputs.timestamps = [timestamp];
    newRobot.escs[escName].inputs.values = [escData[INPUT]];
  }

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

export const ALL_ESC_IDS = [...escDataIds, ...escInputIds];

export const generateMockESCMessage = (
  startTime: number,
  escId: EscId,
  robot: Robot,
) => {
  const escName = idToEscMap[escId];
  if (!escName) {
    throw Error("generated mock message with invalid ESC ID");
  }
  const esc = robot.escs[escName];
  if (!esc) {
    throw Error("generated mock message with ESC ID that robot does not have");
  }

  const messageComponents = [];
  const timestamp = Date.now() - startTime;

  if (escDataIds.includes(escId as EscDataId)) {
    // component 0: temp
    const mockTemp = generateMockValue(esc.measurements[TEMPERATURE]).toString(
      16,
    );
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
      (escName === WEAPON_ESC || escName === ARM_ESC ? 7 : 6);
    const mockRPMHex = generateMockValueTwoByteHex(mockRPM);
    messageComponents.push(mockRPMHex);

    // component 9: checksum (ignore for now)
    messageComponents.push("00");

    // component 10: timestamp
    messageComponents.push(timestamp.toString(16));
  } else if (escInputIds.includes(escId as EscInputId)) {
    // component 1: input
    const mockInput = (generateMockValue(esc.inputs) + 300) * 5;
    messageComponents.push(mockInput.toString(16));
    // component 2: timestamp
    messageComponents.push(timestamp.toString(16));
  }

  const message = `<${escId} ${messageComponents.join(" ")}>`;

  return message;
};

export const getMockEscError = (startTime: number, escName?: EscName) => {
  const escId: EscId = escName ? escToIdMap[escName] : "a";
  const timestamp = Date.now() - startTime;

  return `<${escId} x ${timestamp}>`;
};
