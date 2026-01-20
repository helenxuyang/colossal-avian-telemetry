import styled from "styled-components";
import "./App.css";
import { MockDataDisplay } from "./MockDataDisplay";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { ConnectedDataDisplay } from "./ConnectedDataDisplay";
import { useState } from "react";
import { FullscreenButton } from "./FullscreenButton";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const DisplayHolder = styled.div`
  width: 100%;
`;

const ControlsHolder = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;
function App() {
  const [isUsingFakeData, setIsUsingFakeData] = useState(true);
  return (
    <Container>
      <DisplayHolder>
        {isUsingFakeData ? <MockDataDisplay /> : <ConnectedDataDisplay />}
      </DisplayHolder>
      <h2>App Controls</h2>
      <ControlsHolder>
        <button onClick={() => setIsUsingFakeData((isFake) => !isFake)}>
          Use {isUsingFakeData ? "real" : "fake"} data
        </button>
        <FullscreenButton />
      </ControlsHolder>
    </Container>
  );
}

export default App;
