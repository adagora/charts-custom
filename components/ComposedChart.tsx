import type { Dispatch, SetStateAction } from 'react';
import millify from 'millify';
import { ComposedChart as CChart, XAxis, YAxis, Bar, Area, Tooltip } from 'recharts';

type ComposedChartProps = {
  width?: number;
  height?: number;
  data: Array<any>;
  xAxisDataKey: string;
  barDataKey: string;
  areaDataKey: string;
  barFill: string;
  areaFill: string;
  tooltiped?: boolean;
  setHoverValue?: Dispatch<SetStateAction<[number, number] | undefined>>;
  setHoverDate?: Dispatch<SetStateAction<string | undefined>>;
  hideXAxis?: boolean;
  hideYAxis?: boolean;
  xAxisOrientation?: 'top' | 'bottom';
  yAxisOrientation?: 'left' | 'right';
};

const ComposedChart = ({
  width,
  height,
  data,
  xAxisDataKey,
  barDataKey,
  areaDataKey,
  barFill,
  areaFill,
  tooltiped,
  setHoverValue,
  setHoverDate,
  hideXAxis,
  hideYAxis,
  xAxisOrientation,
  yAxisOrientation,
}: ComposedChartProps) => {
  return (
    <CChart
      data={data}
      width={width}
      height={height}
      onMouseLeave={() => {
        if (setHoverValue) setHoverValue(undefined);
        if (setHoverDate) setHoverDate(undefined);
      }}
    >
      <XAxis
        hide={hideXAxis}
        orientation={xAxisOrientation}
        dataKey={xAxisDataKey}
        axisLine={false}
        tickLine={false}
        tickFormatter={val => (val.toLocaleDateString ? val.toLocaleDateString(undefined, { month: '2-digit' }) : '')}
        minTickGap={1}
        fontSize={12}
      />
      <YAxis
        hide={hideYAxis}
        orientation={yAxisOrientation}
        axisLine={false}
        tickLine={false}
        tickFormatter={val => `${millify(val)}`}
        fontSize={12}
      />
      {tooltiped && (
        <Tooltip
          contentStyle={{ display: 'none' }}
          formatter={(tooltipValue, name, props) => {
            if (setHoverValue) setHoverValue([props.payload?.[barDataKey], props.payload?.[areaDataKey]]);
            if (setHoverDate)
              setHoverDate(
                new Date(props.payload?.[xAxisDataKey]).toLocaleDateString(undefined, {
                  year: 'numeric',
                  day: 'numeric',
                  month: 'short',
                }),
              );

            return null as any;
          }}
        />
      )}
      <Bar dataKey={barDataKey} fill={barFill} />
      <Area type="monotone" dataKey={areaDataKey} fill={areaFill} stroke={areaFill} strokeWidth={2} />
    </CChart>
  );
};
export default ComposedChart;
