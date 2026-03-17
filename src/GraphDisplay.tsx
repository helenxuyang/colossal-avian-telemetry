import ReactECharts from "echarts-for-react";
import { DRIVE_LEFT_ESC, RPM, WEAPON_ESC, type Robot } from "./robot";
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
import { StatusDot } from "./StatusDot";
import { getMeasurementId, parseMeasurementId } from "./dataUtils";

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

const getXAxis = (timestamps: number[]) => {
  const axis = {
    name: "seconds",
    nameLocation: "middle",
    max: timestamps.at(-1),
    axisLabel: {
      formatter: (value: string) => {
        const sec = Number(value) / 1000;
        return sec.toFixed(sec % 1 === 0 ? 0 : 2);
      },
    },
  };
  return axis;
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
  const dataXAxes = measurements.map(({ escName }, index) => {
    return {
      ...getXAxis(robot.escs[escName].timestamps),
      show: index === 0,
    };
  });
  const inputXAxes = Object.values(robot.escs).map((esc) => {
    return {
      ...getXAxis(esc.inputs.timestamps),
      show: false,
    };
  });

  return {
    series: measurements.map(({ escName, measurementName }, index) => {
      return {
        ...getSeries(robot, escName, measurementName),
        yAxisIndex: index,
        xAxisIndex: index,
      };
    }),
    xAxis: [...dataXAxes, ...inputXAxes],
    yAxis: measurements.map(({ escName, measurementName }, index) => {
      return {
        ...getYAxis(robot, escName, measurementName),
        offset: index > 1 ? index * 50 : 0,
      };
    }),
  };
};

const DropdownsHolder = styled.div`
  display: flex;
  gap: 4px;
  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const AutoscrollHolder = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: end;

  font-size: 12px;
  button {
    padding: 4px 8px;
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

  const onZoom = useCallback(() => {
    if (isAutoScrolling) {
      setIsAutoScrolling(false);
    }
    setLastZoomValues({
      // @ts-expect-error echarts is bad at types
      startValue: graphRef.current?.getEchartsInstance().getOption().dataZoom[0]
        .startValue,
      // @ts-expect-error echarts is bad at types
      endValue: graphRef.current?.getEchartsInstance().getOption().dataZoom[0]
        .endValue,
    });
  }, [isAutoScrolling]);

  const onEvents = useMemo(() => ({ datazoom: onZoom }), [onZoom]);

  const referenceTimestamps = robot.escs[WEAPON_ESC].timestamps;
  const autoscrollStart =
    referenceTimestamps.length > 0
      ? referenceTimestamps[referenceTimestamps.length - 1] - 5000
      : 0;

  const plotDataOptions = parsePlotData(robot, plotData);

  const option = {
    xAxis: plotDataOptions.xAxis,
    yAxis: plotDataOptions.yAxis,
    series: [
      ...plotDataOptions.series,
      ...robot.matchMarkers.map((marker) => {
        return {
          type: "line",
          name: marker.type,
          markLine: {
            silent: true,
            symbolSize: 5,
            data: [{ xAxis: marker.timestamp }],
            label: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter: (params: any) => {
                return params.seriesName;
              },
            },
          },
        };
      }),
    ],
    legend: {
      bottom: 50,
    },
    tooltip: {
      show: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        if (params.componentType === "markLine") {
          return;
        }
        const seriesInfo = params.seriesName.split(" ");
        const unit = robot.escs[seriesInfo[0]].measurements[seriesInfo[1]].unit;
        return String(
          `${params.value[1]} ${unit}(${params.value[0] / 1000} sec)`,
        );
      },
      textStyle: {
        fontSize: 10,
      },
      backgroundColor: "white",
      padding: 2,
      borderWidth: 0,
    },
    grid: { bottom: 110, left: 100 },
    dataZoom: [
      {
        type: "slider",
        show: true,
        xAxisIndex: [...Array(plotData.length).keys()],
        startValue: isAutoScrolling
          ? autoscrollStart
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
            <StyledSelectHolder key={escName}>
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
      {plotData.length > 0 && (
        <ReactECharts
          ref={graphRef}
          option={option}
          notMerge={true}
          onEvents={onEvents}
        />
      )}
      <AutoscrollHolder>
        <span>{isAutoScrolling && <StatusDot dot="🟢" />} Auto-scroll </span>
        <button
          onClick={() => {
            if (isAutoScrolling) {
              setLastZoomValues({
                startValue: autoscrollStart ?? 0,
                endValue: referenceTimestamps.at(-1) ?? 0,
              });
            } else {
              setLastZoomValues({});
            }
            setIsAutoScrolling((scrolling) => !scrolling);
          }}
        >
          {isAutoScrolling ? "⏸" : "▶"}
        </button>
      </AutoscrollHolder>
    </div>
  );
};
