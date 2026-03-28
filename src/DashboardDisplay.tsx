import styled from "styled-components";
import { NavigationTabs, type Tab } from "./Tabs";
import { GraphGrid } from "./GraphGrid";
import { RobotImporter } from "./RobotImporter";
import { RecordingControls } from "./RecordingControls";
import { MatchControls } from "./MatchControls";
import { CSVDownloader } from "./CSVWriter";
import { ConfigDisplay } from "./ConfigDisplay";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DebugDisplay } from "./DebugDisplay";
import {
  useIsFakeData,
  useMessages,
  useRobot,
  useSetRobot,
  useToggleFakeData,
  useUpdateRobot,
} from "./store";
import { getInitRobot } from "./storageUtils";
import {
  ALL_ESC_IDS,
  idToEscMap,
  generateMockESCMessage,
  parseMessage,
} from "./messageUtils";
import { MockDataControls } from "./MockDataControls";
import { ConnectedDataControls } from "./ConnectedDataControls";
import { FullscreenButton } from "./FullscreenButton";
import { RobotDisplay } from "./RobotDisplay";

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

const intervalMs = 8;

export const DashboardDisplay = () => {
  const robot = useRobot();
  const setRobot = useSetRobot();
  const updateRobot = useUpdateRobot();
  const messages = useMessages();

  const isFakeData = useIsFakeData();
  const toggleFakeData = useToggleFakeData();
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // to avoid stale closure in setInterval when mocking messages depending on robot state:
  const robotRef = useRef(robot);
  useEffect(() => {
    robotRef.current = robot;
  }, [robot]);

  const [mockDataIntervalId, setMockDataIntervalId] = useState<number | null>(
    null,
  );

  const startTime = useRef<number | null>(null);
  const escIndex = useRef<number>(0);

  const mockReceiveAndHandleMessage = useCallback(() => {
    if (!startTime.current) {
      return;
    }
    const escIds = ALL_ESC_IDS.filter((id) => {
      const escName = idToEscMap[id];
      return Object.keys(robotRef.current.escs).includes(escName);
    });
    const escId = escIds[escIndex.current];
    const data = generateMockESCMessage(
      startTime.current,
      escId,
      robotRef.current,
    );
    const parsedData = parseMessage(data);

    escIndex.current =
      escIndex.current >= escIds.length - 1 ? 0 : escIndex.current + 1;

    updateRobot(parsedData);
  }, [startTime, updateRobot]);

  const tabs: Tab[] = useMemo(
    () => [
      {
        name: "Live",
        panelContent: <RobotDisplay />,
      },
      {
        name: "Graph",
        panelContent: <GraphGrid />,
      },
      {
        name: "Config",
        panelContent: <ConfigDisplay />,
      },
    ],
    [],
  );

  const handleStartRecording = useCallback(() => {
    setIsRecording(true);
    if (isFakeData) {
      if (!startTime.current) {
        startTime.current = Date.now();
      }
      setMockDataIntervalId(
        setInterval(mockReceiveAndHandleMessage, intervalMs),
      );
    }
  }, [isFakeData, mockReceiveAndHandleMessage]);

  const handlePauseRecording = useCallback(() => {
    setIsRecording(false);
    if (mockDataIntervalId) {
      clearInterval(mockDataIntervalId);
    }
    setMockDataIntervalId(null);
  }, [mockDataIntervalId]);

  const handleClearRecording = useCallback(() => {
    setRobot(getInitRobot());
    startTime.current = null;
  }, [setRobot]);

  return (
    <Layout>
      <HeaderHolder>
        <h1>{robot.name}</h1>
        <MatchControls robot={robot} onStart={handleStartRecording} />
      </HeaderHolder>
      <NavigationTabs tabs={tabs} />
      <ControlsGrid>
        <ControlsSection>
          <h2>App Controls</h2>
          <button onClick={toggleFakeData}>
            Use {isFakeData ? "real" : "fake"} data
          </button>
          <FullscreenButton />
        </ControlsSection>
        <ControlsSection>
          {isFakeData ? (
            <MockDataControls startTime={startTime} />
          ) : (
            <ConnectedDataControls
              isRecording={isRecording}
              startRecording={() => setIsRecording(true)}
            />
          )}
        </ControlsSection>
        <ControlsSection>
          <h2>Recording</h2>
          <RecordingControls
            isRecording={isRecording}
            onStart={handleStartRecording}
            onPause={handlePauseRecording}
            onClear={handleClearRecording}
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
          <h2>Messages</h2>
          {messages.length > 0 ? (
            <div>
              <p>Latest:</p>
              {messages.slice(-5).map((message) => (
                <p>{message}</p>
              ))}
            </div>
          ) : (
            "None"
          )}
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
