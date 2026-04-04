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
    const timestamp = Number("0x" + splitData[2]);
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
  if (
    parsedMessage.messageType === "data" ||
    parsedMessage.messageType === "input"
  ) {
    const { messageType, escName, timestamp, escData } = parsedMessage;
    return [messageType, escName, timestamp, ...Object.values(escData)].join(
      ",",
    );
  } else {
    return Object.values(parsedMessage).join(",");
  }
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
    console.log("error", timestamp);
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
