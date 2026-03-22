import ReactECharts from "echarts-for-react";
import {
  DRIVE_LEFT_ESC,
  INPUT,
  RPM,
  WEAPON_ESC,
  type EscName,
  type MeasurementName,
  type Robot,
} from "./robot";
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
import {
  getMeasurementId,
  getMeasurementOrInput,
  parseMeasurementId,
  type PlotId,
  type PlotMeasurementName,
} from "./dataUtils";

type Props = {
  robot: Robot;
};

const StyledSelectHolder = styled(FormControl)`
  width: 100%;
`;

const getSeries = (
  robot: Robot,
  escName: EscName,
  measurementName: MeasurementName | typeof INPUT,
) => {
  const timestamps = robot.escs[escName].timestamps;
  const measurement =
    measurementName === INPUT
      ? robot.escs[escName].inputs
      : robot.escs[escName].measurements[measurementName];
  const values = measurement.values;
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

const getInputSeries = (robot: Robot, escName: EscName) => {
  const { timestamps, values } = robot.escs[escName].inputs;
  if (!timestamps) {
    return {};
  }
  const seriesData = [
    ...timestamps.map((time, index) => {
      return [time, values[index]];
    }),
  ];
  const series = {
    id: `${escName} ${INPUT}`,
    type: "line",
    name: `${escName} ${INPUT}`,
    data: seriesData,
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

const getYAxis = (
  robot: Robot,
  escName: EscName,
  measurementName: PlotMeasurementName,
) => {
  const esc = robot.escs[escName];
  const measurement = getMeasurementOrInput(robot, escName, measurementName);
  const axis = {
    type: "value",
    name: `${esc.abbreviation}-${measurement.unit.length > 0 ? measurement.unit : measurementName}`,
    min: Math.min(measurement.min, measurement.actualMin ?? measurement.min),
    max: Math.max(measurement.max, measurement.actualMax ?? measurement.max),
  };
  return axis;
};

const parsePlotData = (robot: Robot, ids: PlotId[]) => {
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
    dataSeries: measurements.map(({ escName, measurementName }, index) => {
      return {
        ...getSeries(robot, escName, measurementName),
        yAxisIndex: index,
        xAxisIndex: index,
      };
    }),
    inputSeries: measurements.map(({ escName }, index) => {
      return {
        ...getInputSeries(robot, escName),
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
  const [plotIds, setPlotIds] = useState<PlotId[]>([
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

  const plotDataOptions = parsePlotData(robot, plotIds);

  const option = {
    xAxis: plotDataOptions.xAxis,
    yAxis: plotDataOptions.yAxis,
    series: [
      ...plotDataOptions.dataSeries,
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
        const [escName, measurementOrInputName] = params.seriesName.split(" ");

        const unit =
          measurementOrInputName === INPUT
            ? robot.escs[escName as EscName].inputs.unit
            : (robot.escs[escName as EscName].measurements[
                measurementOrInputName as MeasurementName
              ].unit ?? null);
        return [params.value[1], unit, `(${params.value[0] / 1000} sec)`]
          .filter(Boolean)
          .join(" ");
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
        xAxisIndex: [...Array(plotIds.length).keys()],
        startValue: isAutoScrolling
          ? autoscrollStart
          : lastZoomValues.startValue,
        endValue: isAutoScrolling ? undefined : lastZoomValues.endValue,
        filterMode: "none",
      },
      {
        type: "slider",
        show: true,
        yAxisIndex: [...Array(plotIds.length).keys()],
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

  const handleDropdownChange = (event: SelectChangeEvent<typeof plotIds>) => {
    const {
      target: { value },
    } = event;
    const ids = typeof value === "string" ? value.split(",") : value;
    setPlotIds(ids as PlotId[]);
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
        {Object.values(robot.escs).map((esc) => {
          const inputId = `${esc.name}-${INPUT}`;
          return (
            <StyledSelectHolder key={esc.name}>
              <InputLabel>{esc.name}</InputLabel>
              <Select
                multiple
                value={plotIds}
                onChange={handleDropdownChange}
                input={<OutlinedInput label={esc.name} />}
                MenuProps={MenuProps}
              >
                {[
                  ...Object.values(esc.measurements).map((measurement) => {
                    const id = getMeasurementId(
                      esc.name,
                      measurement.name as MeasurementName,
                    );
                    return (
                      <MenuItem key={id} value={id}>
                        {measurement.name}
                      </MenuItem>
                    );
                  }),
                  <MenuItem key={inputId} value={inputId}>
                    {INPUT}
                  </MenuItem>,
                ]}
              </Select>
            </StyledSelectHolder>
          );
        })}
      </DropdownsHolder>
      {plotIds.length > 0 && (
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
