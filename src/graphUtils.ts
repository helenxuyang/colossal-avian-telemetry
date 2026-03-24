import {
  type Robot,
  type EscName,
  type MeasurementName,
  INPUT,
  type Input,
  type Measurement,
  ERROR,
} from "./robot";

type DataPlot = {
  escName: EscName;
  type: "data";
  measurementName: MeasurementName;
};

type InputPlot = {
  escName: EscName;
  type: typeof INPUT;
};

type ErrorPlot = {
  escName: EscName;
  type: typeof ERROR;
};

export type Plot = DataPlot | InputPlot | ErrorPlot;
export type PlotMeasurementName = MeasurementName | typeof INPUT;

export const stringifyPlot = (plot: Plot) => {
  if (plot.type === "data") {
    return `${plot.escName}-${plot.measurementName}`;
  } else {
    return `${plot.escName}-${plot.type}`;
  }
};

export const parsePlot = (id: string): Plot => {
  const idComponents = id.split("-");
  const escName = idComponents[0] as EscName;
  const part = idComponents[1];
  if (part === INPUT || part === ERROR) {
    return {
      escName,
      type: part,
    };
  } else {
    return {
      escName,
      type: "data",
      measurementName: part as MeasurementName,
    };
  }
};

export const getMeasurementOrInput = (
  robot: Robot,
  esc: EscName,
  key: PlotMeasurementName,
): Input | Measurement => {
  return key === INPUT
    ? robot.escs[esc].inputs
    : robot.escs[esc].measurements[key];
};

export const getSeries = (
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

export const getInputSeries = (robot: Robot, escName: EscName) => {
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

export const getXAxis = (timestamps: number[]) => {
  const axis = {
    name: "seconds",
    nameLocation: "middle",
    max: timestamps.at(-1) ?? 0,
    axisLabel: {
      formatter: (value: string) => {
        const sec = Number(value) / 1000;
        return sec.toFixed(sec % 1 === 0 ? 0 : 2);
      },
    },
  };
  return axis;
};

export const getYAxis = (
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

export const parsePlotData = (robot: Robot, plots: Plot[]) => {
  const dataPlots = plots.filter((plot) => plot.type === "data");
  const dataXAxes = dataPlots.map(({ escName }, index) => {
    return {
      ...getXAxis(robot.escs[escName].timestamps),
      show: index === 0,
    };
  });
  const dataYAxes = dataPlots.map(({ escName, measurementName }) => {
    return getYAxis(robot, escName, measurementName);
  });
  const dataSeries = dataPlots.map((plot) => {
    return getSeries(robot, plot.escName, plot.measurementName);
  });

  const inputPlots = plots.filter((plot) => plot.type === INPUT);
  const inputXAxes = inputPlots.map((plot) => {
    return {
      ...getXAxis(robot.escs[plot.escName].inputs.timestamps),
      show: false,
    };
  });
  const inputYAxes = inputPlots.map(({ escName }) => {
    return getYAxis(robot, escName, INPUT);
  });
  const inputSeries = inputPlots.map(({ escName }) => {
    return {
      ...getInputSeries(robot, escName),
    };
  });

  const errorPlots = plots.filter((plot) => plot.type === ERROR);
  const errorSeries = errorPlots
    .map((plot) => {
      const escErrors = robot.escs[plot.escName].errors;
      return {
        type: "line",
        name: `${plot.escName} ${ERROR}`,
        markLine: {
          silent: true,
          symbolSize: 5,
          data: escErrors.map((error) => {
            return { name: "error", xAxis: error.timestamp };
          }),
          label: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter: (params: any) => {
              return params.seriesName;
            },
          },
        },
      };
    })
    .flat();

  return {
    series: [...dataSeries, ...inputSeries],
    errorSeries,
    xAxis: [...dataXAxes, ...inputXAxes],
    yAxis: [...dataYAxes, ...inputYAxes],
  };
};
