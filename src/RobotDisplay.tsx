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
import { CSVDownloader } from "./CSVWriter";
import { NavigationTabs, type Tab } from "./Tabs";
import { GraphGrid } from "./GraphGrid";
import { RobotImporter } from "./RobotImporter";

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

const ControlsGrid = styled.div`
  display: flex;
  gap: 8px;
`;
const ControlsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 3px solid black;
  padding: 16px;
  flex: 1;
`;

type Props = {
  status?: React.ReactNode;
  robot: Robot;
  setRobot: (robot: Robot) => void;
  controls?: React.ReactNode;
};

export const RobotDisplay = ({ status, robot, setRobot, controls }: Props) => {
  const driveLeftEsc = robot.escs[DRIVE_LEFT_ESC];
  const driveRightEsc = robot.escs[DRIVE_RIGHT_ESC];
  const weaponEsc = robot.escs[WEAPON_ESC];

  const liveTabContent = (
    <Layout>
      <RobotSection>
        <h1>Colossal Avian</h1>
        <RobotLayout>
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
    </Layout>
  );

  const tabs: Tab[] = [
    {
      name: "Live",
      panelContent: liveTabContent,
    },
    {
      name: "Graph",
      panelContent: <GraphGrid robot={robot} />,
    },
  ];
  return (
    <Layout>
      <NavigationTabs tabs={tabs} />
      {status}

      <ControlsGrid>
        {controls && (
          <ControlsSection>
            <h2>Data Controls</h2>
            {controls}
          </ControlsSection>
        )}
        <ControlsSection>
          <h2>CSV Controls</h2>
          <h3>Import</h3>
          <RobotImporter setRobot={setRobot} />
          <h3>Export</h3>
          <CSVDownloader />
        </ControlsSection>
      </ControlsGrid>
    </Layout>
  );
};
