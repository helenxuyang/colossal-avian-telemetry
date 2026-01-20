import styled from "styled-components";
import {
  DRIVE_LEFT_ESC,
  DRIVE_RIGHT_ESC,
  WEAPON_ESC,
  type Robot,
} from "./data";
import { HorizontalBarDisplay } from "./HorizontalBarDisplay";
import { WeaponESCDisplay } from "./WeaponESCDisplay";
import { VoltageDisplay } from "./VoltageDisplay";
import { SMALL_VIEWPORT } from "./styles";
import { ConsumptionDonut } from "./ConsumptionDonut";

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const ESCSection = styled.div`
  flex: 4;
`;

const ESCGrid = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: 2fr 3fr 2fr;
  grid-template-areas: "driveLeft weapon driveRight";

  @media (max-width: ${SMALL_VIEWPORT}px) {
    grid-template-columns: 1fr;
    grid-template-areas: "driveLeft" "weapon" "driveRight";
  }
`;

const DriveLeftESCSection = styled(WeaponESCDisplay)`
  grid-area: driveLeft;
`;

const WeaponESCSection = styled(WeaponESCDisplay)`
  grid-area: weapon;
`;

// const ArmESCSection = styled(ESCDoughnutDisplay)`
//   grid-area: arm;
// `;

const DriveRightESCSection = styled(WeaponESCDisplay)`
  grid-area: driveRight;
`;

const RobotSection = styled.div`
  background-color: #ccc;
  padding: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RobotLayout = styled.div`
  display: flex;
  gap: 8px;
  justify-content: space-evenly;

  > * {
    width: 100%;
  }

  @media (max-width: ${SMALL_VIEWPORT}px) {
    flex-direction: column;
    > * {
      width: auto;
    }
  }
`;

type Props = {
  robot: Robot;
  controls: React.ReactNode;
};

export const RobotDisplay = ({ robot, controls }: Props) => {
  const driveLeftEsc = robot.escs[DRIVE_LEFT_ESC];
  const driveRightEsc = robot.escs[DRIVE_RIGHT_ESC];
  const weaponEsc = robot.escs[WEAPON_ESC];

  return (
    <Layout>
      <RobotSection>
        <h1>Colossal Avian</h1>
        <RobotLayout>
          <VoltageDisplay batteryVoltage={robot.batteryVoltage} />
          {Object.values(robot.derivedValues)
            .filter((measurement) => measurement.shouldShow !== false)
            .map((measurement) => {
              return (
                <HorizontalBarDisplay
                  key={`${robot.name}-${measurement.name}`}
                  measurement={measurement}
                />
              );
            })}
          <ConsumptionDonut robot={robot} />
        </RobotLayout>
      </RobotSection>
      <ESCSection>
        <ESCGrid>
          <DriveLeftESCSection esc={driveLeftEsc} />
          <WeaponESCSection esc={weaponEsc} />
          <DriveRightESCSection esc={driveRightEsc} />
        </ESCGrid>
      </ESCSection>
      <h2>Data Controls</h2>
      {controls}
    </Layout>
  );
};
