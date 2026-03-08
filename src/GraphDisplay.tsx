import ReactECharts from 'echarts-for-react';
import { ALL_ESCS, TEMPERATURE, WEAPON_ESC, type Robot } from './data';
import { useRef } from 'react';

type Props = {
    robot: Robot;
}

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
export const GraphDisplay = ({ robot }: Props) => {
    const graphRef = useRef<ReactECharts>(null);
    // const [option, setOption] = useState({});

    const referenceTimestamps = robot.escs[WEAPON_ESC].timestamps;
    const lastN = 100;

    const option = {
        xAxis: {},
        yAxis: {},
        series: ALL_ESCS.map(esc => getSeries(robot, esc, TEMPERATURE)),
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
                yAxisIndex: [0],
                filterMode: 'none'
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

    return <div>
        <ReactECharts ref={graphRef} option={option} notMerge={true} />
    </div>;
}