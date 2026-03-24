import ReactECharts from "echarts-for-react";
import {
  ERROR,
  INPUT,
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
  getXAxis,
  parsePlotData,
  stringifyPlot,
  type Plot,
} from "./graphUtils";

const DropdownsHolder = styled.div`
  display: flex;
  gap: 4px;
  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const StyledSelectHolder = styled(FormControl)`
  width: 100%;
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

type Props = {
  robot: Robot;
};

export const GraphDisplay = ({ robot }: Props) => {
  const graphRef = useRef<ReactECharts>(null);
  const [plotIds, setPlotIds] = useState<Plot[]>([]);
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

  const defaultXAxis = { ...getXAxis(referenceTimestamps), show: true };
  const defaultYAxis = {
    type: "value",
    name: "errors",
    min: 0,
    max: 1,
  };
  const defaultSeries = {
    id: "placeholder-series",
    type: "line",
    data: referenceTimestamps.map((timestamp) => [timestamp, -1]),
    // showSymbol: false,
    symbolSize: 2,
    silent: true,
  };
  const hasOnlyErrors =
    plotDataOptions.xAxis.length === 0 &&
    plotDataOptions.errorSeries.length > 0;

  const finalXAxis = hasOnlyErrors ? defaultXAxis : plotDataOptions.xAxis;

  const finalYAxis = hasOnlyErrors
    ? defaultYAxis
    : plotDataOptions.yAxis.map((yAxis, index) => ({
        ...yAxis,
        offset: index > 1 ? index * 50 : 0,
      }));

  const finalSeries = [
    ...plotDataOptions.series.map((series, index) => {
      return {
        ...series,
        yAxisIndex: index,
        xAxisIndex: index,
      };
    }),
    ...plotDataOptions.errorSeries,
    hasOnlyErrors && defaultSeries,
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
  ].filter(Boolean);

  const option = {
    xAxis: finalXAxis,
    yAxis: finalYAxis,
    series: finalSeries,
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

  const handleDropdownChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    const ids = typeof value === "string" ? value.split(",") : value;

    const plots = ids.map((id) => {
      const components = id.split("-");
      const escName = components[0] as EscName;
      const typeOrMeasurement = components[1] as
        | typeof INPUT
        | typeof ERROR
        | MeasurementName;

      if (typeOrMeasurement === INPUT) {
        return {
          escName,
          type: INPUT,
        };
      } else if (typeOrMeasurement === ERROR) {
        return {
          escName,
          type: ERROR,
        };
      } else {
        return {
          escName,
          type: "data",
          measurementName: typeOrMeasurement,
        };
      }
    });

    setPlotIds(plots as Plot[]);
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
          const errorId = `${esc.name}-${ERROR}`;
          return (
            <StyledSelectHolder key={esc.name}>
              <InputLabel>{esc.name}</InputLabel>
              <Select
                multiple
                value={plotIds.map((plot) => stringifyPlot(plot))}
                onChange={handleDropdownChange}
                input={<OutlinedInput label={esc.name} />}
                MenuProps={MenuProps}
              >
                {[
                  ...Object.values(esc.measurements).map((measurement) => {
                    const id = `${esc.name}-${measurement.name}`;
                    return (
                      <MenuItem key={id} value={id}>
                        {measurement.name}
                      </MenuItem>
                    );
                  }),
                  <MenuItem key={inputId} value={inputId}>
                    {INPUT}
                  </MenuItem>,
                  <MenuItem key={errorId} value={errorId}>
                    Errors
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
