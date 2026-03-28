import styled from "styled-components";
import {
  ARM_ESC,
  CONSUMPTION,
  CURRENT,
  DRIVE_LEFT_ESC,
  DRIVE_RIGHT_ESC,
  TOTAL_CONSUMPTION,
  TOTAL_CURRENT,
  WEAPON_ESC,
} from "./robot";
import { HorizontalBarDisplay } from "./HorizontalBarDisplay";
import { ESCDisplay } from "./ESCDisplay";
import { VoltageDisplay } from "./VoltageDisplay";
import { BACKGROUND, SMALL_VIEWPORT, WarningText } from "./styles";
import { ConsumptionDonut } from "./ConsumptionDonut";
import { NavigationTabs, type Tab } from "./Tabs";
import { GraphGrid } from "./GraphGrid";
import { RobotImporter } from "./RobotImporter";
import { RecordingControls } from "./RecordingControls";
import { MatchControls } from "./MatchControls";
import { CSVDownloader } from "./CSVWriter";
import { ConfigDisplay } from "./ConfigDisplay";
import { useCallback, useMemo } from "react";
import { calculateTotal } from "./dataUtils";
import { DebugDisplay } from "./DebugDisplay";
import { useRobot } from "./store";

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
  flex-wrap: wrap;
  gap: 8px;
`;

const SmallEscSection = styled(ESCDisplay)`
  flex: 1;
`;

const MediumEscSection = styled(ESCDisplay)`
  flex: 2;
`;

const LargeEscSection = styled(ESCDisplay)`
  flex: 3;
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

const LayoutColumn = styled.div`
  display: flex;
  flex-direction: column;
  background: ${BACKGROUND};
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
  controls?: React.ReactNode[];
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onClearRecording: () => void;
};

export const RobotDisplay = ({
  controls,
  isRecording,
  setIsRecording,
  onStartRecording,
  onPauseRecording,
  onClearRecording,
}: Props) => {
  const robot = useRobot();

  const driveLeftEsc = robot.escs[DRIVE_LEFT_ESC];
  const driveRightEsc = robot.escs[DRIVE_RIGHT_ESC];
  const weaponEsc = robot.escs[WEAPON_ESC];
  const armEsc = robot.escs[ARM_ESC];

  const totalCurrent = useMemo(
    () => calculateTotal(CURRENT, robot.escs),
    [robot.escs],
  );
  const totalConsumption = useMemo(
    () => calculateTotal(CONSUMPTION, robot.escs),
    [robot.escs],
  );

  const liveTabContent = useMemo(
    () => (
      <Layout>
        <RobotSection>
          <RobotLayout>
            <BarsHolder>
              <VoltageDisplay escs={robot.escs} />
              <HorizontalBarDisplay
                name={TOTAL_CURRENT}
                value={totalCurrent}
                min={robot.escs[WEAPON_ESC].measurements[CURRENT].min}
                max={robot.escs[WEAPON_ESC].measurements[CURRENT].max}
              />
              <HorizontalBarDisplay
                name={TOTAL_CONSUMPTION}
                value={totalConsumption}
                min={robot.escs[WEAPON_ESC].measurements[CONSUMPTION].min}
                max={robot.escs[WEAPON_ESC].measurements[CONSUMPTION].max}
              />
            </BarsHolder>
            <LayoutColumn>
              <ConsumptionDonut escs={robot.escs} />
              {robot.unknownMessages.length > 0 && (
                <div>
                  <h3>Errors</h3>
                  <WarningText>
                    <p>Unknown messages: {robot.unknownMessages.length}</p>
                    <p>First: {robot.unknownMessages[0].message}</p>
                  </WarningText>
                </div>
              )}
            </LayoutColumn>
          </RobotLayout>
        </RobotSection>
        <ESCSection>
          <ESCGrid>
            {driveLeftEsc && <MediumEscSection esc={driveLeftEsc} />}
            {weaponEsc && <LargeEscSection esc={weaponEsc} />}
            {driveRightEsc && <MediumEscSection esc={driveRightEsc} />}
            {armEsc && <SmallEscSection esc={armEsc} />}
          </ESCGrid>
        </ESCSection>
      </Layout>
    ),
    [
      robot.escs,
      robot.unknownMessages,
      totalCurrent,
      totalConsumption,
      driveLeftEsc,
      weaponEsc,
      driveRightEsc,
      armEsc,
    ],
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
        panelContent: <ConfigDisplay />,
      },
    ],
    [liveTabContent, robot],
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
          <DebugDisplay robot={robot} />
          <button onClick={() => console.log(robot)}>
            console.log full robot data
          </button>
          {/* <button onClick={() => cacheRobotData(robot)}>
            Cache robot data
          </button>
          <button
            onClick={() => {
              cacheRobotData(robot);
              setRobot(combineRobotWithCache(robot));
            }}
          >
            Fetch full robot
          </button> */}
        </ControlsSection>
        <ControlsSection>
          <h2>Import CSV</h2>
          <RobotImporter />
          <h2>Export CSV</h2>
          <CSVDownloader robot={robot} />
        </ControlsSection>
      </ControlsGrid>
    </Layout>
  );
};
