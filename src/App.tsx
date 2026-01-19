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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DisplayHolder = styled.div`
  width: 100%;
`;

function App() {
  const useFakeData = false;
  return (
    <DisplayHolder>
      {useFakeData ? <MockDataDisplay /> : <ConnectedDataDisplay />}
    </DisplayHolder>
  );
}

export default App;
