import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { IApiFullModel } from '@pages/data/api.model';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import _ from 'lodash';

interface LineChartVolumeProps {
  width?: number;
  height?: number;
  item: IApiFullModel[];
  label?: string;
  gradientColor?: string;
  gradientColorMix?: string;
  background?: string;
  axis?: string;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  disableAxis?: boolean;
}

const LineChartVolumeTooltip = ({
  width = 650,
  height = 350,
  item,
  label = '',
  gradientColor = '#1e2730',
  gradientColorMix = '#1e2730',
  background = '#1e2730',
  axis = '#4a667a',
  top = 20,
  right = 30,
  bottom = 30,
  left = 40,
  disableAxis = false,
}: LineChartVolumeProps) => {
  const [dataChart, setDataChart] = useState<IApiFullModel[]>([]);
  const [hoverData, setHoverData] = useState<{ x: number | Date | null; y: number | null }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDataChart(item);
  }, [item]);

  const buildChart = () => {
    if (dataChart.length && containerRef.current) {
      containerRef.current.append(lineChart(dataChart, label));
    }
  };

  useEffect(() => {
    buildChart();
  }, [dataChart]);

  function lineChart(data: IApiFullModel[], title: string) {
    const X = d3.map(data, x => new Date(x.date));
    const Y = d3.map(data, y => y.volume);
    const O = d3.map(data, d => d);
    const I = d3.map(data, (_, i) => i);

    // Compute default domains.
    const xDomain = d3.extent(X);
    const maxY = d3.max(Y) as number;

    const yDomain = ['0', !!maxY && maxY > 400 ? maxY.toString() : maxY + 100];

    // Construct scales and axes.
    const xScale = d3.scaleUtc(xDomain as Iterable<Date>, [left, width - right]);
    const yScale = d3.scaleLinear(yDomain as Iterable<d3.NumberValue>, [height - bottom, top]);
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(width / 80)
      .tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(height / 50);

    const svg = d3
      .create('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .style('-webkit-tap-highlight-color', 'transparent')
      .style('overflow', 'visible')
      .style('background-color', background);

    svg
      .append('g')
      .attr('transform', `translate(0,${height - bottom})`)
      .call(xAxis)
      .attr('color', axis)
      // hide the axis
      .style('visibility', disableAxis ? 'hidden' : 'visible');

    svg
      .append('g')
      .attr('transform', `translate(${left},0)`)
      .call(yAxis)
      // hide the axis
      .style('visibility', disableAxis ? 'hidden' : 'visible')
      .attr('color', axis)
      .call(g =>
        g
          .selectAll('.tick line')
          .clone()
          .attr('x2', width - left - right)
          .attr('stroke', axis)
          .attr('stroke-opacity', 0.1),
      )
      .call(g =>
        g
          .append('text')
          .attr('x', -left)
          .attr('y', 10)
          .attr('fill', axis)
          .attr('text-anchor', 'start')
          .attr('font-size', '22px')
          .attr('font-weight', '700')
          .attr('transform', `translate(${left},0)`)
          .text(title),
      );

    // create unique id for gradients
    const uid = Date.now();
    const chart = d3.select(containerRef.current);
    chart.attr('id', uid);

    // Construct gradients used by chart line and chart area
    function constructGradients() {
      const defs = svg.append('defs');

      defs
        .append('linearGradient')
        .attr('id', `lineGradient-${uid}`)
        .call(el => el.append('stop').attr('offset', '0').attr('stop-color', gradientColor))
        .call(el => el.append('stop').attr('offset', '100').attr('stop-color', gradientColorMix));

      defs
        .append('linearGradient')
        .attr('id', `shadowGradient-${uid}`)
        .attr('x1', '0%')
        .attr('x2', '0%')
        .attr('y1', '0%')
        .attr('y2', '100%')
        .call(el =>
          el.append('stop').attr('offset', '0').attr('stop-color', gradientColor).attr('stop-opacity', '0.07'),
        )
        .call(el =>
          el.append('stop').attr('offset', '0.2').attr('stop-color', gradientColor).attr('stop-opacity', '0.13'),
        )
        .call(el => el.append('stop').attr('offset', '1').attr('stop-color', gradientColor).attr('stop-opacity', '0'));
    }

    // Construct gradients used by chart line and chart area
    constructGradients();

    // Construct chart line
    const line = d3
      .line<number>()
      .curve(d3.curveLinear)
      .x(i => xScale(X[i]))
      .y(i => yScale(Y[i]));

    const verticalLine = svg
      .append('path')

      // add dashed line
      .attr('stroke-dasharray', '5,5')
      .attr('stroke-width', 2)
      .attr('fill', 'none');

    svg
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', `url(#lineGradient-${uid})`)
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', line(I))
      .on('mouseenter', event => {
        const [x, y] = d3.pointer(event, this);
        const date = xScale.invert(x);
        const volume = yScale.invert(y);
        // const debouncedUpdate = _.debounce((x, y) => {
        verticalLine
          .attr('d', `M ${x} ${yScale(y)} V ${y}`)
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .attr('fill', 'none');

        svg
          .append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 5)
          .attr('stroke-width', 2)
          .attr('fill', 'black')
          .attr('stroke-dasharray', '5,5');
        // }, 150);
        // debouncedUpdate(x, y);
        // svg.on('mousemove', function () {
        setHoverData({ x: date, y: volume });
        // });
        svg.dispatch('input', { bubbles: true } as d3.CustomEventParameters);
      })

      .on('mouseout', () => {
        setHoverData({ x: null, y: null });
        svg.selectAll('circle').remove();
        // when mouse leave, remove vertical line
        verticalLine.attr('d', '');
        svg.dispatch('input', { bubbles: true } as d3.CustomEventParameters);
      });

    // Construct chart area
    const area = d3
      .area<number>()
      .curve(d3.curveLinear)
      .x(i => xScale(X[i]))
      .y0(yScale(0))
      .y1(i => yScale(Y[i]));

    svg
      .append('path')
      .attr('fill', `url(#${`shadowGradient-${uid}`})`)
      .attr('d', area(I));

    return svg.node() as Node;
  }

  return (
    <>
      <Box display="flex" flexDirection="column" justifyContent="flex-start" alignItems="flex-start">
        <Typography color="primary" variant="h6" fontSize="12px">
          DAILY TRADING VOLUME
        </Typography>
        <Box display="flex" flexDirection="row" alignItems="center" borderRadius="50%">
          <Typography fontSize="32px" pr={2}>
            {hoverData.y?.toFixed(2) || 0}
          </Typography>
        </Box>
        <Typography fontSize="12px">View (last 24 hours )</Typography>
      </Box>

      {/* Chart */}
      <div ref={containerRef} />
    </>
  );
};

export default LineChartVolumeTooltip;
