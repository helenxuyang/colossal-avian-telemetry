import styled from "styled-components";
import {
  DRIVE_LEFT_ESC,
  DRIVE_RIGHT_ESC,
  WEAPON_ESC,
  type Robot,
} from "./data";
import { HorizontalBarDisplay } from "./HorizontalBarDisplay";
import { DriveESCDisplay } from "./DriveESCDIsplay";
import { WeaponESCDisplay } from "./WeaponESCDisplay";

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
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas: "driveLeft weapon driveRight";
`;

const DriveLeftESCSection = styled(DriveESCDisplay)`
  grid-area: driveLeft;
`;

const WeaponESCSection = styled(WeaponESCDisplay)`
  grid-area: weapon;
`;

// const ArmESCSection = styled(ESCDoughnutDisplay)`
//   grid-area: arm;
// `;

const DriveRightESCSection = styled(DriveESCDisplay)`
  grid-area: driveRight;
`;

const RobotSection = styled.div`
  background-color: #ccc;
  padding: 16px;
  border-radius: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RobotLayout = styled.div`
  display: flex;
  gap: 8px;
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
    <>
      <Layout>
        <RobotSection>
          <h1>Colossal Avian</h1>
          <RobotLayout>
            {Object.values(robot.measurements)
              .filter((measurement) => measurement.shouldShow !== false)
              .map((measurement) => {
                return (
                  <HorizontalBarDisplay
                    key={`${robot.name}-${measurement.name}`}
                    measurement={measurement}
                  />
                );
              })}
          </RobotLayout>
        </RobotSection>
        <ESCSection>
          <ESCGrid>
            <DriveLeftESCSection esc={driveLeftEsc} />
            <WeaponESCSection esc={weaponEsc} />
            <DriveRightESCSection esc={driveRightEsc} showColumnAfter={true} />
          </ESCGrid>
        </ESCSection>
        <h2>Controls</h2>
        {controls}
      </Layout>
    </>
  );
};
