import { create } from "zustand";
import { getInitRobot } from "./storageUtils";
import { INPUT, type Robot } from "./robot";
import { immer } from "zustand/middleware/immer";
import type { ParsedMessage } from "./messageUtils";

type State = {
  robot: Robot;
};

type Action = {
  setRobot: (robot: State["robot"]) => void;
  updateRobot: (parsedMessage: ParsedMessage) => void;
};

const useRobotStore = create<State & Action, [["zustand/immer", never]]>(
  immer((set) => ({
    robot: getInitRobot(),
    setRobot: (robot: Robot) => set(() => ({ robot })),
    updateRobot: (parsedMessage: ParsedMessage) =>
      set((state) => {
        const { messageType } = parsedMessage;
        const robot = state.robot;

        if (parsedMessage.messageType === "unknown") {
          robot.unknownMessages.push({
            message: parsedMessage.message,
            reason: parsedMessage.reason,
          });
          return;
        }

        const { timestamp, escName } = parsedMessage;

        // for Stack--no drive but can still get drive inputs from noise
        if (!robot.escs[escName]) {
          return;
        }

        if (robot.initialTimestamp === null) {
          robot.initialTimestamp = Date.now() - timestamp;
        }

        if (messageType === "data") {
          const { escData } = parsedMessage;
          Object.entries(escData).forEach(
            ([measurementKey, measurementValue]) => {
              const measurement =
                robot.escs[escName].measurements[measurementKey];
              measurement.values.push(measurementValue);
              if (measurementValue < measurement.min) {
                measurement.actualMin = measurementValue;
              }
              if (measurementValue > measurement.max) {
                measurement.actualMax = measurementValue;
              }
            },
          );
          robot.escs[escName].timestamps.push(timestamp);
        } else if (messageType === "input") {
          const { escData } = parsedMessage;
          robot.escs[escName].inputs.timestamps.push(timestamp);
          robot.escs[escName].inputs.values.push(escData[INPUT]);
        } else if (messageType === "error") {
          robot.escs[escName].errors.push({ timestamp });
        }
      }),
  })),
);

export const useRobot = () => useRobotStore((state) => state.robot);
export const useSetRobot = () => useRobotStore((state) => state.setRobot);
export const useUpdateRobot = () => useRobotStore((state) => state.updateRobot);
