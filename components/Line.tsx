import { useLayoutEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { IApiFullModel } from '@pages/data/api.model';

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

const size = {
  width: 640,
  height: 350,
};

const color = {
  background: '#1e2730',
  axis: '#4a667a',
};

type LineChartProps = {
  width: number;
  height: number;
  data: IApiFullModel[];
};

export const Line = ({ width, height, data }: LineChartProps) => {
  // bounds = area inside the graph axis = calculated by substracting the margins
  const axesRef = useRef(null);

  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Y axis
  const [min, max] = d3.extent(data, d => d.volume);
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, max || 0])
      .range([boundsHeight, 0]);
  }, [data, height]);

  // X axis
  const [xMin, xMax] = d3.extent(data, d => d.date);
  const X = d3.map(data, x => new Date(x.date));
  const Y = d3.map(data, y => y.volume);
  const O = d3.map(data, d => d);
  const I = d3.map(data, (_, i) => i);
  // Compute default domains.
  const xDomain = d3.extent(X);
  const maxY = d3.max(Y);
  const yDomain = ['0', !!maxY && maxY > 400 ? maxY.toString() : '400'];
  // Construct scales and axes.
  const xScale = d3.scaleUtc(xDomain as Iterable<Date>, [MARGIN.left, size.width - MARGIN.right]);

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
      .style('visibility', 'hidden');

    const yAxisGenerator = d3.axisLeft(yScale);
    svgElement
      .append('g')
      .call(yAxisGenerator)
      // hide the axis
      .style('visibility', 'hidden');

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    constructGradients(svgElement);

    // Construct chart line
    const line = d3
      .line<number>()
      .curve(d3.curveLinear)
      .x(i => xScale(X[i]))
      .y(i => yScale(Y[i]));

    svgElement
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', 'url(#lineGradient)')
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', line(I));

    // Construct chart area
    const area = d3
      .area<number>()
      .curve(d3.curveLinear)
      .x(i => xScale(X[i]))
      .y0(yScale(0))
      .y1(i => yScale(Y[i]));
    svgElement.append('path').attr('fill', 'url(#shadowGradient)').attr('d', area(I));
  }, [xScale, yScale, boundsHeight]);

  // Build the line
  const lineBuilder = d3
    .line<IApiFullModel>()
    .x(d => xScale(d.date))
    .y(d => yScale(d.volume));
  const linePath = lineBuilder(data);
  if (!linePath) {
    return null;
  }

  function constructGradients(svg: any) {
    const defs = svg.append('defs');

    defs
      .append('linearGradient')
      .attr('id', 'lineGradient')
      .call(el => el.append('stop').attr('offset', '0').attr('stop-color', '#2FC882'))
      .call(el => el.append('stop').attr('offset', '100').attr('stop-color', '#24c1ed'));

    defs
      .append('linearGradient')
      .attr('id', 'shadowGradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%')
      .call(el => el.append('stop').attr('offset', '0').attr('stop-color', '#2FC882').attr('stop-opacity', '0.07'))
      .call(el => el.append('stop').attr('offset', '0.2').attr('stop-color', '#2FC882').attr('stop-opacity', '0.13'))
      .call(el => el.append('stop').attr('offset', '1').attr('stop-color', '#2FC882').attr('stop-opacity', '0'));
  }

  return (
    <div>
      <svg width={width} height={height}>
        <g width={boundsWidth} height={boundsHeight} transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}>
          <path d={linePath} opacity={1} stroke="#2FC882" fill="none" strokeWidth={2} />
        </g>
        <g
          width={boundsWidth}
          height={boundsHeight}
          ref={axesRef}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
        />
      </svg>
    </div>
  );
};

export default Line;
