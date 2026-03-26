import styled from "styled-components";
import {
  DRIVE_LEFT_ESC,
  DRIVE_RIGHT_ESC,
  WEAPON_ESC,
  type Robot,
} from "./robot";
import { HorizontalBarDisplay } from "./HorizontalBarDisplay";
import { ESCDisplay } from "./ESCDisplay";
import { VoltageDisplay } from "./VoltageDisplay";
import { SMALL_VIEWPORT } from "./styles";
import { ConsumptionDonut } from "./ConsumptionDonut";
import { NavigationTabs, type Tab } from "./Tabs";
import { GraphGrid } from "./GraphGrid";
import { RobotImporter } from "./RobotImporter";
import { RecordingControls } from "./RecordingControls";
import { MatchControls } from "./MatchControls";
import { CSVDownloader } from "./CSVWriter";
import { ConfigDisplay } from "./RobotConfig";
import { useCallback, useMemo } from "react";

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const HeaderHolder = styled.div`
  display: flex;

  justify-content: space-between;
`;

const ESCSection = styled.div`
  flex: 4;
`;

const ESCGrid = styled.div`
  display: flex;
  gap: 8px;
`;

const DriveLeftESCSection = styled(ESCDisplay)`
  flex: 2;
`;

const WeaponESCSection = styled(ESCDisplay)`
  flex: 3;
`;

const DriveRightESCSection = styled(ESCDisplay)`
  flex: 2;
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
  flex-wrap: wrap;
  gap: 8px;
`;

const ControlsSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 3px solid black;
  padding: 16px;
  flex: 1;
`;

type Props = {
  robot: Robot;
  setRobot: (robot: Robot) => void;
  controls?: React.ReactNode[];
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onClearRecording: () => void;
};

export const RobotDisplay = ({
  robot,
  setRobot,
  controls,
  isRecording,
  setIsRecording,
  onStartRecording,
  onPauseRecording,
  onClearRecording,
}: Props) => {
  const driveLeftEsc = robot.escs[DRIVE_LEFT_ESC];
  const driveRightEsc = robot.escs[DRIVE_RIGHT_ESC];
  const weaponEsc = robot.escs[WEAPON_ESC];

  const liveTabContent = useMemo(
    () => (
      <Layout>
        <RobotSection>
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
            {driveLeftEsc.shouldShow && (
              <DriveLeftESCSection esc={driveLeftEsc} />
            )}
            {weaponEsc.shouldShow && <WeaponESCSection esc={weaponEsc} />}
            {driveRightEsc.shouldShow && (
              <DriveRightESCSection esc={driveRightEsc} />
            )}
          </ESCGrid>
        </ESCSection>
      </Layout>
    ),
    [driveLeftEsc, driveRightEsc, robot, weaponEsc],
  );

  const tabs: Tab[] = useMemo(
    () => [
      {
        name: "Live",
        panelContent: liveTabContent,
      },
      {
        name: "Graph",
        panelContent: <GraphGrid robot={robot} />,
      },
      {
        name: "Config",
        panelContent: <ConfigDisplay robot={robot} setRobot={setRobot} />,
      },
    ],
    [liveTabContent, robot, setRobot],
  );

  const handleStartRecording = useCallback(() => {
    if (!isRecording) {
      setIsRecording(true);
    }
  }, [isRecording, setIsRecording]);

  return (
    <Layout>
      <HeaderHolder>
        <h1>{robot.name}</h1>
        <MatchControls robot={robot} onStart={handleStartRecording} />
      </HeaderHolder>
      <NavigationTabs tabs={tabs} />
      <ControlsGrid>
        {controls &&
          controls.map((control, index) => (
            <ControlsSection key={index}>{control}</ControlsSection>
          ))}
        <ControlsSection>
          <h2>Recording</h2>
          <RecordingControls
            isRecording={isRecording}
            onStart={onStartRecording}
            onPause={onPauseRecording}
            onClear={onClearRecording}
          />
        </ControlsSection>
        <ControlsSection>
          <h2>Robot</h2>
          <button onClick={() => console.log(robot)}>Log robot data</button>
        </ControlsSection>
        <ControlsSection>
          <h2>Import CSV</h2>
          <RobotImporter setRobot={setRobot} />
          <h2>Export CSV</h2>
          <CSVDownloader robot={robot} />
        </ControlsSection>
      </ControlsGrid>
    </Layout>
  );
};
