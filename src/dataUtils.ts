import {
  ARM_ESC,
  calculateDerivedValues,
  CONSUMPTION,
  CURRENT,
  DRIVE_LEFT_ESC,
  DRIVE_RIGHT_ESC,
  INPUT,
  RPM,
  TEMPERATURE,
  VOLTAGE,
  WEAPON_ESC,
  type Robot,
} from "./data";

const mergeBytes = (byte1: number, byte2: number) => {
  return (byte1 << 8) + byte2;
};

type EscId = "a" | "b" | "c" | "d" | "w" | "x" | "y" | "z";
const escDataIds = ["a", "b", "c", "d"];
const escInputIds = ["w", "x", "y", "z"];
const idToEscMap: Record<EscId, string> = {
  a: DRIVE_LEFT_ESC,
  b: DRIVE_RIGHT_ESC,
  c: WEAPON_ESC,
  d: ARM_ESC,
  w: DRIVE_LEFT_ESC,
  x: DRIVE_RIGHT_ESC,
  y: WEAPON_ESC,
  z: ARM_ESC,
};
const escToIdMap: Record<string, EscId> = Object.entries(idToEscMap).reduce(
  (acc, [key, val]) => {
    acc[val] = key as EscId;
    return acc;
  },
  {} as Record<string, EscId>,
);

type ParsedData = {
  escName: string;
  escData: {
    [TEMPERATURE]?: number;
    [VOLTAGE]?: number;
    [CURRENT]?: number;
    [CONSUMPTION]?: number;
    [RPM]?: number;
    [INPUT]?: number;
  };
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
  Time: Time since start byte

  ESC input data: 
  ESC ID (w, x, y, z)
 
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

  // TODO: remove when we actually have arm
  if (escName === ARM_ESC) {
    return null;
  }

  const escData = splitData.slice(1).map((entry) => Number("0x" + entry));

  if (escDataIds.includes(escId)) {
    const rpmFactor =
      escId === escToIdMap[WEAPON_ESC] || escId === escToIdMap[ARM_ESC]
        ? 1 / 7
        : 1 / 6;
    const parsedData: ParsedData = {
      escName,
      escData: {
        [TEMPERATURE]: escData[0],
        [VOLTAGE]: Number(
          (mergeBytes(escData[1], escData[2]) / 100).toFixed(2),
        ),
        [CURRENT]: Number(
          (mergeBytes(escData[3], escData[4]) / 100).toFixed(2),
        ),
        [CONSUMPTION]: mergeBytes(escData[5], escData[6]),
        [RPM]: Math.round(mergeBytes(escData[7], escData[8]) * 100 * rpmFactor),
      },
    };
    return parsedData;
  } else if (escInputIds.includes(escId)) {
    const parsedData: ParsedData = {
      escName,
      escData: {
        [INPUT]: escData[0],
      },
    };
    return parsedData;
  }
  return null;
};

export const getUpdatedRobot = (data: ParsedData, robot: Robot) => {
  const { escName, escData } = data;
  let newRobot = { ...robot };

  Object.entries(escData).forEach(([measurementKey, measurementValue]) => {
    newRobot.escs[escName].measurements[measurementKey].values.push(
      measurementValue,
    );
  });

  newRobot = calculateDerivedValues(newRobot);
  return newRobot;
};
