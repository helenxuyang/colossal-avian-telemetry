import { getConfig, type RobotConfig } from "./dataUtils";
import type { Robot } from "./robot";

const ROBOT_STORAGE_KEY = "robots_telemetry";

export const getRobotStorage = () => {
  const robotStorage = localStorage.getItem(ROBOT_STORAGE_KEY);
  if (!robotStorage) {
    localStorage.setItem(ROBOT_STORAGE_KEY, "");
    return {};
  }
  return JSON.parse(robotStorage);
};

export const setRobotStorage = (robotStorage: Record<string, RobotConfig>) => {
  localStorage.setItem(ROBOT_STORAGE_KEY, JSON.stringify(robotStorage));
};

export const saveRobotConfig = (robot: Robot) => {
  const robotStorage = getRobotStorage();
  robotStorage[robot.name] = getConfig(robot);
  setRobotStorage(robotStorage);
};

export const getRobotConfig = (name: string) => {
  const storage = getRobotStorage();
  const robot = storage[name];
  if (!robot) {
    throw Error(`robot config for ${name} not found in local storage`);
  }
  return robot;
};

export const deleteRobotConfig = (name: string) => {
  const storage = getRobotStorage();
  console.log(storage);
  console.log(name, storage[name]);
  delete storage[name];
  console.log(storage);
  setRobotStorage(storage);
};
