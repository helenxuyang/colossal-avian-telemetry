import { Line } from "react-chartjs-2";
import styled from "styled-components";

const GraphDisplay = styled.div`
  height: 50px;
  canvas {
    width: 100% !important;
  }
`;

type Props = {
  timeRange?: number;
  values: number[];
};
export const LineGraphDisplay = ({ values, timeRange = 100 }: Props) => {
  // note: do NOT memoize, it breaks plotting
  const lineData = {
    labels: [...Array(timeRange).keys()],
    datasets: [
      {
        label: "measurement",
        data: values.slice(-timeRange),
        pointRadius: 0,
        borderColor: "white",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0,
    },
    scales: {
      // to remove the labels
      x: {
        ticks: {
          display: false,
        },

        // to remove the x-axis grid
        grid: {
          drawBorder: false,
          display: false,
        },
      },
      // to remove the y-axis labels
      y: {
        ticks: {
          display: false,
          beginAtZero: true,
        },
        // to remove the y-axis grid
        grid: {
          drawBorder: false,
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <GraphDisplay>
      <Line data={lineData} options={options} />
    </GraphDisplay>
  );
};
