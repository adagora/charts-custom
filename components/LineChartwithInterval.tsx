/* eslint-disable no-restricted-globals */
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/system';
import { Button, Chip, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

type LineChartProps = {
  width: number;
  height: number;
  data: any[];
  label?: string;
  gradientColor: string;
  gradientColorMix: string;
  background?: string;
  axis?: string;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  // when not disableAxis play with top/right/bottom/left to adjust the chart position
  disableAxis?: boolean;
  defaultValue?: number | string;
  showTooltip?: boolean;
};

const LineChartwithInterval = ({
  width,
  height,
  data,
  label = '',
  gradientColor = '#1e2730',
  gradientColorMix = '#1e2730',
  background = '#1e2730',
  axis = '#4a667a',
  top = 20,
  right = 0,
  bottom = 0,
  left = 0,
  disableAxis = false,
  defaultValue,
  showTooltip = true,
}: LineChartProps) => {
  const axesRef = useRef(null);
  const [hoverData, setHoverData] = useState<{
    x: Date | number | string | null | undefined;
    y: number | string | null | undefined;
    z?: number | string | null | undefined;
  }>({
    x: undefined,
    y: defaultValue,
    z: undefined,
  });

  const intervalOptions = [
    { interval: d3.timeDay, label: '1D' },
    { interval: d3.timeWeek, label: '1W' },
    { interval: d3.timeMonth, label: '1M' },
    { interval: d3.timeYear, label: '1Y' },
  ];

  const [chosenInterval, setChosenInterval] = useState<any>(intervalOptions[2]);

  const [showAllData, setShowAllData] = useState(false);
  // Get the minimum and maximum dates from the data
  const [minDate, maxDate] = d3.extent(data, d => d.date);
  // Generate the intervals based on the chosen interval
  const intervals = chosenInterval?.interval.range(minDate, maxDate);

  const filteredData = useMemo(() => {
    return showAllData
      ? data
      : data.filter(
          d =>
            chosenInterval.interval.floor(d.date).getTime() === chosenInterval.interval.floor(intervals[0]).getTime() ||
            chosenInterval.interval.floor(d.date).getTime() ===
              chosenInterval.interval.ceil(intervals[intervals.length - 1]).getTime(),
        );
  }, [data, showAllData, chosenInterval, intervals]);

  // bounds = area inside the graph axis = calculated by substracting the margins
  const boundsWidth = width - right - left;
  const boundsHeight = height - top - bottom;

  // Y axis
  const [min, max] = d3.extent(data, d => d.avg_transfer_value);

  const maxYTransferCount: any = d3.max(filteredData, function (d) {
    return +d.transfers_count;
  });

  const maxY: any = d3.max(filteredData, function (d) {
    return +d.avg_transfer_value;
  });

  const yScale = useMemo(() => {
    return d3.scaleLinear().domain([0, maxY]).range([boundsHeight, 0]);
  }, [maxY, boundsHeight]);

  const X = d3.map(filteredData, x => new Date(x.date));
  const Y = d3.map(filteredData, y => y.avg_transfer_value);

  const O = d3.map(filteredData, d => d);
  const I = d3.map(filteredData, (_, i) => i);
  // Compute default domains.
  const xDomain = d3.extent(X);
  // Construct scales and axes.
  const xScale = d3.scaleUtc(xDomain as Iterable<Date>, [left, width - right]);

  const volumeScale = useMemo(() => {
    return d3
      .scaleLinear()
      .range([boundsHeight / 10, 0])
      .domain([0, maxYTransferCount]);
  }, [maxYTransferCount, boundsHeight]);

  // Render the X and Y axis using d3.js, not react
  useLayoutEffect(() => {
    const svgElement = d3.select(axesRef.current);
    svgElement.selectAll('*').remove();
    const xAxisGenerator = d3.axisBottom(xScale);
    svgElement
      .append('g')
      .attr('transform', `translate(0,${boundsHeight})`)
      .call(xAxisGenerator)
      // hide the axis
      .style('visibility', disableAxis ? 'hidden' : 'visible');

    const yAxisGenerator = d3.axisLeft(yScale);

    svgElement
      .append('g')
      .call(yAxisGenerator)
      // hide the axis
      .style('visibility', disableAxis ? 'hidden' : 'visible')

      .call(g =>
        g
          .append('text')
          .attr('x', -left / 2)
          .attr('y', 5)
          .attr('fill', axis)
          .attr('text-anchor', 'start')
          .attr('font-size', '22px')
          .attr('font-weight', '700')
          .attr('transform', `translate(${left},0)`)
          .text(label),
      );

    // create unique id for gradients
    const uid = Date.now();
    const chart = d3.select(axesRef.current);
    chart.attr('id', uid);

    function constructGradients() {
      const defs = svgElement.append('defs');

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

    constructGradients();

    // Construct chart area
    const area = d3
      .area<number>()
      .curve(d3.curveLinear)
      .x(i => xScale(X[i]))
      .y0(yScale(0))
      .y1(i => yScale(Y[i]));

    svgElement
      .append('path')
      .attr('fill', `url(#${`shadowGradient-${uid}`})`)
      .attr('d', area(I) as any);

    // Construct chart line
    const line = d3
      .line<number>()
      .curve(d3.curveLinear)
      .x(i => xScale(X[i]))
      .y(i => yScale(Y[i]));

    const lineOnChart = svgElement
      .append('path')
      .attr('stroke-dasharray', '5,5')
      .attr('stroke-width', 1)
      .attr('fill', 'transparent')
      .attr('stroke', 'rgba(255,255,255,0.5)')
      .style('visibility', showTooltip ? 'visible' : 'hidden');

    svgElement
      .append('path')
      .attr('fill', 'none')
      .style('pointer-events', 'all')
      .attr('stroke', `url(#lineGradient-${uid})`)
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', line(I) as any);

    const distanceBetweenPoints = (x1, y1, x2, y2) => {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    };

    // Add the volume bars
    svgElement
      .selectAll('.bar')
      .data(filteredData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.date))
      .attr('y', d => boundsHeight - volumeScale(d.transfers_count))
      .attr('width', 2)
      .attr('height', d => Math.max(0, volumeScale(d.transfers_count)))
      .attr('fill', 'steelblue')
      .attr('opacity', 0.5);

    svgElement
      .append('rect')
      .attr('class', 'RectClass')
      .attr('fill', 'none')
      .style('pointer-events', 'all')
      .attr('width', boundsWidth)
      .attr('height', boundsHeight)
      .style('visibility', showTooltip ? 'visible' : 'hidden')
      .on('mouseover', event => {
        if (!showTooltip) return;
        // Find the exact point where the vertical line intersects the line chart
        const [x, y] = d3.pointer(event, this);

        // Find the closest point on the line chart to the current mouse position
        let closestPoint = { x: 0, y: 0, z: 0 };
        let minDistance = Number.MAX_VALUE;
        O.forEach(point => {
          const distance = distanceBetweenPoints(xScale(point.date), yScale(point.avg_transfer_value), x, y);
          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = { x: xScale(point.date), y: yScale(point.avg_transfer_value), z: point.transfers_count };
          }
        });

        lineOnChart.attr('d', `M0 ${closestPoint.y} L${boundsWidth} ${closestPoint.y}`);

        svgElement
          .append('circle')
          .attr('cx', closestPoint.x)
          .attr('cy', closestPoint.y)
          .attr('r', 4)
          .attr('fill', 'transparent')
          .attr('stroke', `url(#lineGradient-${uid})`)
          .attr('stroke-width', 2);

        const dateCLOSEST = xScale.invert(closestPoint.x);
        const volumeCLOSEST = yScale.invert(closestPoint.y);

        // format to UTC time
        const date = new Date(dateCLOSEST);
        const dateUTC = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

        setHoverData({ x: dateUTC, y: volumeCLOSEST, z: closestPoint.z });

        svgElement.dispatch('input', { bubbles: true } as d3.CustomEventParameters);
      });

    d3.select(document).on('mouseout', event => {
      if (!event.relatedTarget || !d3.select(event.relatedTarget).classed('RectClass')) {
        // reset hover data
        setHoverData({ x: undefined, y: defaultValue });
        svgElement.selectAll('circle').remove();
        lineOnChart.style('display', 'none');
        svgElement.dispatch('input', { bubbles: true } as d3.CustomEventParameters);
      }
    });
  }, [
    xScale,
    yScale,
    boundsHeight,
    I,
    X,
    Y,
    gradientColor,
    gradientColorMix,
    disableAxis,
    left,
    axis,
    label,
    defaultValue,
    hoverData.x,
    hoverData.y,
  ]);

  // Build the line
  const lineBuilder = d3
    .line<any>()
    .x(d => xScale(d.date))
    .y(d => yScale(d.avg_transfer_value));

  const linePath = lineBuilder(data);
  if (!linePath) {
    return null;
  }

  return (
    <div>
      <Box width={250} display="flex" justifyContent="space-between" pb={1}>
        <Button
          onClick={() => {
            setShowAllData(false);
            setChosenInterval(intervalOptions[0]);
          }}
          disabled={chosenInterval?.label === intervalOptions[0]?.label}
        >
          {intervalOptions[0]?.label}
        </Button>
        <Button
          onClick={() => {
            setShowAllData(false);
            setChosenInterval(intervalOptions[1]);
          }}
          disabled={chosenInterval?.label === intervalOptions[1]?.label}
        >
          {intervalOptions[0]?.label}
        </Button>
        <Button
          onClick={() => {
            setShowAllData(false);
            setChosenInterval(intervalOptions[2]);
          }}
          disabled={chosenInterval?.label === intervalOptions[2]?.label}
        >
          {intervalOptions[2]?.label}
        </Button>
        <Button
          onClick={() => {
            setShowAllData(false);
            setChosenInterval(intervalOptions[3]);
          }}
          disabled={chosenInterval?.label === intervalOptions[3]?.label}
        >
          {intervalOptions[3]?.label}
        </Button>

        <Button
          onClick={() => {
            setShowAllData(true);
            setChosenInterval(null);
          }}
          disabled={showAllData}
        >
          All
        </Button>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        width={300}
        height={150}
      >
        <Typography color="primary" variant="h6" fontSize="12px">
          {hoverData.y === defaultValue
            ? `${showAllData ? `All` : chosenInterval.label} TRADING VOLUME`
            : 'TRADING VOLUME'}
        </Typography>
        <Box display="flex" flexDirection="row" alignItems="center" borderRadius="50%">
          {isNaN(Number(hoverData.y)) ? (
            defaultValue
          ) : (
            <Typography fontSize="32px" pr={2} width={300}>
              {Number(hoverData.y).toFixed(2)}
            </Typography>
          )}
          <Chip
            sx={{ bgcolor: '#1e2929', color: '#2FC882' }}
            icon={['collection'].length > 0 ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            label="X%"
          />
        </Box>
        <Typography color="#737474" fontSize="12px">
          {hoverData.x ? hoverData.x.toString() : showAllData ? `All` : `Last ${chosenInterval?.label}`}
        </Typography>

        {hoverData.z && (
          <Typography color="steelblue" fontSize="12px">
            Transaction count: {hoverData.z && hoverData.z}
          </Typography>
        )}
      </Box>
      <svg width={width} height={height} style={{ backgroundColor: background }}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          ref={axesRef}
          transform={`translate(${[left, top].join(',')})`}
          color={axis}
        />
      </svg>
    </div>
  );
};

export default LineChartwithInterval;
