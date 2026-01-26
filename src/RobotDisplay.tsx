import styled from "styled-components";
import {
  DRIVE_LEFT_ESC,
  DRIVE_RIGHT_ESC,
  WEAPON_ESC,
  type Robot,
} from "./data";
import { HorizontalBarDisplay } from "./HorizontalBarDisplay";
import { ESCDisplay } from "./ESCDisplay";
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

const DriveLeftESCSection = styled(ESCDisplay)`
  grid-area: driveLeft;
`;

const WeaponESCSection = styled(ESCDisplay)`
  grid-area: weapon;
`;

// const ArmESCSection = styled(InputDisplay)`
//   grid-area: arm;
// `;

const DriveRightESCSection = styled(ESCDisplay)`
  grid-area: driveRight;
`;

const RobotSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const RobotLayout = styled.div`
  display: flex;

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

const BarsHolder = styled.div`
  display: flex;
  flex-direction: column;
`;

type Props = {
  status?: React.ReactNode;
  robot: Robot;
  controls?: React.ReactNode;
};

export const RobotDisplay = ({ status, robot, controls }: Props) => {
  const driveLeftEsc = robot.escs[DRIVE_LEFT_ESC];
  const driveRightEsc = robot.escs[DRIVE_RIGHT_ESC];
  const weaponEsc = robot.escs[WEAPON_ESC];

  return (
    <Layout>
      <RobotSection>
        <h1>Colossal Avian</h1>
        <RobotLayout>
          {status}
          <BarsHolder>
            <VoltageDisplay batteryVoltage={robot.batteryVoltage} />
            {Object.values(robot.derivedValues)
              .filter((measurement) => measurement.shouldShow !== false)
              .map((measurement) => {
                return (
                  <HorizontalBarDisplay
                    key={`${robot.name}-${measurement.name}`}
                    barColor="skyblue"
                    measurement={measurement}
                  />
                );
              })}
          </BarsHolder>
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
      {controls && (
        <>
          <h2>Data Controls</h2>
          {controls}
        </>
      )}
    </Layout>
  );
};
