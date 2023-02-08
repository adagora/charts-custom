import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/system';
import { Chip, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { IApiFullModel } from '@pages/data/api.model';

type LineChartProps = {
  width: number;
  height: number;
  data: IApiFullModel[];
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
  defaultValue: number | string;
  showTooltip?: boolean;
};
export const LineChart = ({
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
    y: number | string;
  }>({
    x: undefined,
    y: defaultValue,
  });

  // bounds = area inside the graph axis = calculated by substracting the margins
  const boundsWidth = width - right - left;
  const boundsHeight = height - top - bottom;

  // Y axis
  const [min, max] = d3.extent(data, d => d.volume);

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, max || 0])
      .range([boundsHeight, 0]);
  }, [max, boundsHeight]);

  // X axis
  const [xMin, xMax] = d3.extent(data, d => d.date);
  const X = d3.map(data, x => new Date(x.date));
  const Y = d3.map(data, y => y.volume);
  const O = d3.map(data, d => d);
  const I = d3.map(data, (_, i) => i);
  // Compute default domains.
  const xDomain = d3.extent(X);
  const maxY = d3.max(Y);
  // Construct scales and axes.
  const xScale = d3.scaleUtc(xDomain as Iterable<Date>, [left, width - right]);

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
        let closestPoint = { x: 0, y: 0 };
        let minDistance = Number.MAX_VALUE;
        O.forEach(point => {
          const distance = distanceBetweenPoints(xScale(point.date), yScale(point.volume), x, y);
          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = { x: xScale(point.date), y: yScale(point.volume) };
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

        setHoverData({ x: dateCLOSEST, y: volumeCLOSEST });

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
    .line<IApiFullModel>()
    .x(d => xScale(d.date))
    .y(d => yScale(d.volume));

  const linePath = lineBuilder(data);
  if (!linePath) {
    return null;
  }

  return (
    <div>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        width={300}
        height={150}
      >
        <Typography color="primary" variant="h6" fontSize="12px">
          {hoverData.y === defaultValue ? 'AVERAGE DAILY TRADING VOLUME' : 'DAILY TRADING VOLUME'}
        </Typography>
        <Box display="flex" flexDirection="row" alignItems="center" borderRadius="50%">
          {hoverData && (
            <Typography fontSize="32px" pr={2} width={300}>
              {Number(hoverData.y).toFixed(2)} USDC
            </Typography>
          )}
          <Chip
            sx={{ bgcolor: '#1e2929', color: '#2FC882' }}
            icon={['collection'].length > 0 ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            label="8%"
          />
        </Box>
        <Typography color="#737474" fontSize="12px">
          View (last 24 hours )
        </Typography>
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

export default LineChart;
