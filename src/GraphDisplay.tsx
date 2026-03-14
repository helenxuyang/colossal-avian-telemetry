import ReactECharts from "echarts-for-react";
import {
  DRIVE_LEFT_ESC,
  getMeasurementId,
  parseMeasurementId,
  RPM,
  WEAPON_ESC,
  type Robot,
} from "./data";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  type SelectChangeEvent,
  Select,
  OutlinedInput,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import styled from "styled-components";

type Props = {
  robot: Robot;
};

const StyledSelectHolder = styled(FormControl)`
  width: 100%;
`;

const getSeries = (robot: Robot, escName: string, measurementName: string) => {
  const timestamps = robot.escs[escName].timestamps;
  const values = robot.escs[escName].measurements[measurementName].values;
  if (!timestamps) {
    return {};
  }
  const seriesData = [
    ...timestamps.map((time, index) => {
      return [time, values[index]];
    }),
  ];
  const series = {
    id: `${escName} ${measurementName}`,
    type: "line",
    name: `${escName} ${measurementName}`,
    data: seriesData,
    // showSymbol: false,
    symbolSize: 2,
  };
  return series;
};

const getYAxis = (robot: Robot, escName: string, measurementName: string) => {
  const esc = robot.escs[escName];
  const measurement = esc.measurements[measurementName];
  const axis = {
    type: "value",
    name: `${esc.abbreviation}-${measurement.unit.length > 0 ? measurement.unit : measurementName}`,
    min: measurement.min,
    max: measurement.max,
  };
  return axis;
};

const parsePlotData = (robot: Robot, ids: string[]) => {
  const measurements = ids.map((id) => parseMeasurementId(id));
  return {
    series: measurements.map(({ escName, measurementName }, index) => {
      return {
        ...getSeries(robot, escName, measurementName),
        yAxisIndex: index,
      };
    }),
    yAxis: measurements.map(({ escName, measurementName }, index) => {
      return {
        ...getYAxis(robot, escName, measurementName),
        offset: index > 1 ? index * 70 : 0,
      };
    }),
  };
};

const DropdownsHolder = styled.div`
  display: flex;
  gap: 4px;
  @media (max-width: 450px) {
    flex-direction: column;
  }
`;

export const GraphDisplay = ({ robot }: Props) => {
  const graphRef = useRef<ReactECharts>(null);
  const [plotData, setPlotData] = useState<string[]>([
    `${DRIVE_LEFT_ESC}-${RPM}`,
  ]);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(true);
  const [lastZoomValues, setLastZoomValues] = useState<{
    startValue?: number;
    endValue?: number;
  }>({});

  const onZoom = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (params: any) => {
      console.log("zoom", params);
      if (isAutoScrolling) {
        setIsAutoScrolling(false);
      }
      setLastZoomValues({
        // @ts-expect-error echarts is bad at types
        startValue: graphRef.current?.getEchartsInstance().getOption()
          .dataZoom[0].startValue,
        // @ts-expect-error echarts is bad at types
        endValue: graphRef.current?.getEchartsInstance().getOption().dataZoom[0]
          .endValue,
      });
    },
    [isAutoScrolling],
  );

  const onEvents = useMemo(() => ({ datazoom: onZoom }), [onZoom]);

  const referenceTimestamps = robot.escs[WEAPON_ESC].timestamps;
  const lastN = 100; // change to last 3 sec

  const plotDataOptions = parsePlotData(robot, plotData);

  console.log("LAST", referenceTimestamps.at(-1));
  const option = {
    xAxis: {
      max: referenceTimestamps.at(-1),
    },
    yAxis: plotDataOptions.yAxis,
    series: plotDataOptions.series,
    legend: {},
    dataZoom: [
      {
        type: "slider",
        show: true,
        xAxisIndex: [0],
        startValue: isAutoScrolling
          ? referenceTimestamps.at(-(lastN + 1))
          : lastZoomValues.startValue,
        endValue: isAutoScrolling ? undefined : lastZoomValues.endValue,
        filterMode: "none",
      },
      {
        type: "slider",
        show: true,
        yAxisIndex: [...Array(plotData.length).keys()],
        filterMode: "none",
        left: 0,
      },
      {
        type: "inside",
        show: true,
        xAxisIndex: [0],
        filterMode: "none",
      },
      {
        type: "inside",
        show: true,
        yAxisIndex: [0],
        filterMode: "none",
      },
    ],
    toolbox: {
      feature: {
        // select rectangle to zoom
        dataZoom: {
          show: true,
        },
      },
    },
    animation: false,
  };

  const handleDropdownChange = (event: SelectChangeEvent<typeof plotData>) => {
    const {
      target: { value },
    } = event;
    setPlotData(typeof value === "string" ? value.split(",") : value);
  };

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: 300,
        width: 250,
      },
    },
  };

  return (
    <div>
      <DropdownsHolder>
        {Object.keys(robot.escs).map((escName) => {
          const esc = robot.escs[escName];
          return (
            <StyledSelectHolder>
              <InputLabel>{escName}</InputLabel>
              <Select
                multiple
                value={plotData}
                onChange={handleDropdownChange}
                input={<OutlinedInput label={escName} />}
                MenuProps={MenuProps}
              >
                {Object.values(esc.measurements).map((measurement) => {
                  const id = getMeasurementId(esc.name, measurement.name);
                  return (
                    <MenuItem key={id} value={id}>
                      {measurement.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </StyledSelectHolder>
          );
        })}
      </DropdownsHolder>
      <button
        onClick={() => {
          if (isAutoScrolling) {
            setLastZoomValues({
              startValue: referenceTimestamps.at(-(lastN + 1)) ?? 0,
              endValue: referenceTimestamps.at(-1) ?? 0,
            });
          } else {
            setLastZoomValues({});
          }
          setIsAutoScrolling((scrolling) => !scrolling);
        }}
      >
        {isAutoScrolling ? "Stop" : "Start"} auto-scrolling
      </button>
      {plotData.length > 0 && (
        <ReactECharts
          ref={graphRef}
          option={option}
          notMerge={true}
          onEvents={onEvents}
        />
      )}
    </div>
  );
};
