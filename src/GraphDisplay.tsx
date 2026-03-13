import ReactECharts from 'echarts-for-react';
import { getMeasurementId, parseMeasurementId, WEAPON_ESC, type Robot } from './data';
import { useRef, useState } from 'react';
import { type SelectChangeEvent, Select, OutlinedInput, MenuItem, ListSubheader, FormControl, InputLabel } from '@mui/material';
import styled from 'styled-components';

type Props = {
    robot: Robot;
}

const StyledSelectHolder = styled(FormControl)`
    width: 300px;
`;

const getSeries = (robot: Robot, escName: string, measurementName: string) => {
    const timestamps = robot.escs[escName].timestamps;
    const values = robot.escs[escName].measurements[measurementName].values;
    if (!timestamps) {
        return {};
    }
    const seriesData = [...timestamps.map((time, index) => {
        return [time, values[index]];
    })];
    const series = {
        id: `${escName} ${measurementName}`,
        type: 'line',
        name: `${escName} ${measurementName}`,
        data: seriesData,
        // showSymbol: false,
        symbolSize: 2,
    };
    return series;
}

const getYAxis = (robot: Robot, escName: string, measurementName: string) => {
    const esc = robot.escs[escName];
    const measurement = esc.measurements[measurementName];
    const axis = {
        type: 'value',
        name: `${esc.abbreviation}-${measurement.unit.length > 0 ? measurement.unit : measurementName}`,
        min: measurement.min,
        max: measurement.max,
    };
    return axis;
}

const parsePlotData = (robot: Robot, ids: string[]) => {
    const measurements = ids.map(id => parseMeasurementId(id));
    return {
        series: measurements.map(({ escName, measurementName }, index) => {
            return { ...getSeries(robot, escName, measurementName), yAxisIndex: index }
        }),
        yAxis: measurements.map(({ escName, measurementName }, index) => {
            return { ...getYAxis(robot, escName, measurementName), offset: index > 1 ? index * 70 : 0 };
        }),
    }
}

export const GraphDisplay = ({ robot }: Props) => {
    const graphRef = useRef<ReactECharts>(null);
    const [plotData, setPlotData] = useState<string[]>([]);

    const referenceTimestamps = robot.escs[WEAPON_ESC].timestamps;
    const lastN = 100;

    const plotDataOptions = parsePlotData(robot, plotData);

    const option = {
        xAxis: {},
        yAxis: plotDataOptions.yAxis,
        series: plotDataOptions.series,
        legend: {
        },
        dataZoom: [
            {
                type: 'slider',
                show: true,
                xAxisIndex: [0],
                startValue: referenceTimestamps.at(-(lastN + 1)),
                // endValue: referenceTimestamps.at(-1),
                filterMode: 'none'
            },
            {
                type: 'slider',
                show: true,
                yAxisIndex: [...Array(plotData.length).keys()],
                filterMode: 'none',
                left: 0
            },
            {
                type: 'inside',
                show: true,
                xAxisIndex: [0],
                filterMode: 'none'
            },
            {
                type: 'inside',
                show: true,
                yAxisIndex: [0],
                filterMode: 'none'
            },
        ],
        toolbox: {
            feature: {
                // select rectangle to zoom
                dataZoom: {
                    show: true,
                },
            }
        },
        animation: false
    };

    const handleDropdownChange = (event: SelectChangeEvent<typeof plotData>) => {
        const {
            target: { value },
        } = event;
        console.log(event);
        setPlotData(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: 300,
                width: 250,
            },
        },
    };

    return <div>
        <StyledSelectHolder>
            <InputLabel>Data</InputLabel>
            <Select
                multiple
                value={plotData}
                onChange={handleDropdownChange}
                input={<OutlinedInput label="Data" />}
                MenuProps={MenuProps}
            >

                {Object.values(robot.escs).map((esc) => {
                    return (
                        [
                            <ListSubheader>{esc.name}</ListSubheader >,
                            ...Object.values(esc.measurements).map((measurement) => {
                                const id = getMeasurementId(esc.name, measurement.name);
                                return (
                                    <MenuItem
                                        key={id}
                                        value={id}
                                    >
                                        {esc.abbreviation} {measurement.name}
                                    </MenuItem>
                                );
                            })
                        ]
                    )
                })}
            </Select>
        </StyledSelectHolder>
        {plotData.length > 0 && <ReactECharts ref={graphRef} option={option} notMerge={true} />}
    </div>;
}