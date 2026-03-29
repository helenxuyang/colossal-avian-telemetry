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
  useToggleFakeData,
  useUpdateRobot,
} from "./store";
import { getInitRobot } from "./storageUtils";
import {
  ALL_ESC_IDS,
  idToEscMap,
  generateMockESCMessage,
  parseMessage,
  type ParsedMessage,
  getUpdatedRobot,
} from "./messageUtils";
import { MockDataControls } from "./MockDataControls";
import { ConnectedDataControls } from "./ConnectedDataControls";
import { FullscreenButton } from "./FullscreenButton";
import { RobotDisplay } from "./RobotDisplay";
import type { Robot } from "./robot";
import { extractLatestRobot } from "./dataUtils";

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
  const robotRef = useRef<Robot>(getInitRobot()); // all data
  const [renderedRobot, setRenderedRobot] = useState<Robot>(getInitRobot()); // only what's rendered
  const renderInterval = useRef<number | null>(null);

  const updateRobot = useUpdateRobot();
  const messages = useMessages();

  const isFakeData = useIsFakeData();
  const toggleFakeData = useToggleFakeData();
  const [isRecording, setIsRecording] = useState<boolean>(false);

  useEffect(() => {
    renderInterval.current = setInterval(() => {
      setRenderedRobot(extractLatestRobot(robotRef.current));
    }, 200);

    return () => {
      if (renderInterval.current) {
        clearInterval(renderInterval.current);
        renderInterval.current = null;
      }
    };
  }, []);

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
        panelContent: <RobotDisplay renderedRobot={renderedRobot} />,
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
    [renderedRobot],
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
      setMockDataIntervalId(null);
    } else if (renderInterval.current) {
      clearInterval(renderInterval.current);
    }
  }, [mockDataIntervalId]);

  const handleClearRecording = useCallback(() => {
    robotRef.current = getInitRobot();
    setRenderedRobot(getInitRobot());
    startTime.current = null;
  }, []);

  const handleUpdateRobot = useCallback((parsedMessage: ParsedMessage) => {
    const updatedRobot = getUpdatedRobot(parsedMessage, robotRef.current);
    robotRef.current = updatedRobot;
  }, []);

  return (
    <Layout>
      <HeaderHolder>
        <h1>{renderedRobot.name}</h1>
        <MatchControls robot={renderedRobot} onStart={handleStartRecording} />
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
              updateRobot={handleUpdateRobot}
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
          <DebugDisplay robot={renderedRobot} />
          <button
            onClick={() =>
              console.log({ rendered: renderedRobot, full: robotRef.current })
            }
          >
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
              {messages.slice(-1).map((message) => (
                <p>
                  {message}{" "}
                  {Number(
                    `0x${message.substring(message.lastIndexOf(" ") + 1, message.length - 1)}`,
                  )}
                </p>
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
          <CSVDownloader robot={robotRef} />
        </ControlsSection>
      </ControlsGrid>
    </Layout>
  );
};
