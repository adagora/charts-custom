import { useMemo, useRef } from 'react';
import * as d3 from 'd3';

const MARGIN = { top: 30, right: 30, bottom: 50, left: 50 };

const size = {
  width: 640,
  height: 350,
};

const color = {
  background: '#1e2730',
  axis: '#4a667a',
};

type DataPoint = {
  id: number;
  x: number;
  y: number;
  target: number;
  prediction: number;
  diagnosisGroupId: number;
  date: string;
};
type LineChartProps = {
  width: number;
  height: number;
  data: DataPoint[];
};

const LineChart = ({ width, height, data }: LineChartProps) => {
  // bounds = area inside the graph axis = calculated by substracting the margins
  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Y axis
  const [min, max] = d3.extent(data, d => d.y);
  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, max || 0])
      .range([boundsHeight, 0]);
  }, [data, height]);

  // X axis
  const [xMin, xMax] = d3.extent(data, d => d.x);
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, xMax || 0])
      .range([0, boundsWidth]);
  }, [data, width]);

  const X = d3.map(data, x => x.x);
  const Y = d3.map(data, y => y.y);
  const O = d3.map(data, d => d);
  const I = d3.map(data, (_, i) => i);

  const svgElement = d3.select(axesRef.current);
  svgElement.selectAll('*').remove();

  const xAxisGenerator = d3
    .axisBottom(xScale)
    .ticks(size.width / 80)
    .tickSizeOuter(0);
  svgElement.append('g').attr('transform', `translate(0,${boundsHeight})`).call(xAxisGenerator);

  const yAxisGenerator = d3.axisLeft(yScale).ticks(size.height / 50);
  svgElement
    .append('g')
    .attr('transform', `translate(${MARGIN.left},0)`)
    .call(yAxisGenerator)
    .attr('color', color.axis)

    .call(g =>
      g
        .selectAll('.tick line')
        .clone()
        .attr('x2', size.width - MARGIN.left - MARGIN.right)
        .attr('stroke', color.axis)
        .attr('stroke-opacity', 0.1),
    )
    .call(g =>
      g
        .append('text')
        .attr('x', -MARGIN.left)
        .attr('y', 10)
        .attr('fill', color.axis)
        .attr('text-anchor', 'start')
        .attr('font-size', '22px')
        .attr('font-weight', '700')
        .attr('transform', `translate(${MARGIN.left},0)`)
        .text('Price ($)'),
    );

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

  // Build the line
  const lineBuilder = d3
    .line<DataPoint>()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y));
  const linePath = lineBuilder(data);
  if (!linePath) {
    return null;
  }

  function constructGradients(svg: d3.Selection<null, unknown, null, undefined>) {
    const defs = svg.append('defs');

    defs
      .append('linearGradient')
      .attr('id', 'lineGradient')
      .call(el => el.append('stop').attr('offset', '0').attr('stop-color', '#8EE8AA'))
      .call(el => el.append('stop').attr('offset', '100').attr('stop-color', '#24c1ed'));

    defs
      .append('linearGradient')
      .attr('id', 'shadowGradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%')
      .call(el => el.append('stop').attr('offset', '0').attr('stop-color', '#8EE8AA').attr('stop-opacity', '0.07'))
      .call(el => el.append('stop').attr('offset', '0.2').attr('stop-color', '#8EE8AA').attr('stop-opacity', '0.13'))
      .call(el => el.append('stop').attr('offset', '1').attr('stop-color', '#8EE8AA').attr('stop-opacity', '0'));
  }

  function constructTooltip(svg: d3.Selection<null, unknown, null, undefined>) {
    const tooltip = svgElement.append('g').style('pointer-events', 'auto');

    // tooltip
    //   .append('circle')
    //   .attr('r', 4)
    //   .attr('stroke', 'url(#lineGradient)')
    //   .attr('stroke-width', 2)
    //   .attr('fill', '#1e2730')
    //   .attr('cx', 0)
    //   .attr('cy', '-5')
    //   .style('display', 'none');

    // tooltip
    //   .append('line')
    //   .attr('y', 3)
    //   .attr('stroke', '#4a667a')
    //   .attr('stroke-opacity', 0.5)
    //   .attr('stroke-width', 1)
    //   .attr('stroke-dasharray', '5,3')
    //   .attr('x1', 0)
    //   .attr('y1', 0)
    //   .attr('x2', 0)
    //   .style('display', 'none');

    return tooltip;
  }

  // Construct tooltip
  const tooltip = constructTooltip(svgElement);

  // Construct gradients used by chart line and chart area
  constructGradients(svgElement);

  const points = data.map(d => [xScale(d.x), yScale(d.y)]);

  // add tooltip to svg base on tooltipRef
  const tooltipRef = useRef<any>(null);
  useMemo(() => {
    d3.select(tooltipRef.current)
      .selectAll('circle')
      .data(points)
      .enter()
      .append('circle')

      .attr('r', 4)
      .attr('stroke', 'url(#lineGradient)')
      .attr('stroke-width', 2)
      .attr('fill', '#1e2730')
      .attr('cx', 0)
      .attr('cy', '-5')

      .attr('cx', d => d[0])
      .attr('cy', d => d[1])
      .attr('r', 3)
      // .attr('fill', '#2FC882')
      //
      .append('line')
      .attr('y', 3)
      .attr('stroke', '#4a667a')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5,3')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0);

    d3.select(tooltipRef.current)
      .on('mouseover', (d, i, n) => {
        tooltip.style('display', null);
        tooltip.select('circle').style('display', null);
        tooltip.select('line').style('display', 'none');
        tooltip.attr('transform', `translate(${xScale(X[i])}, ${yScale(Y[i]) + 5})`);

        const path = tooltip.selectAll('path').data(data).join('path').attr('fill', 'white').attr('opacity', '0.8');

        const text = tooltip
          .selectAll('text')
          .data(data)
          .join('text')
          .attr('x', 0)
          .attr('y', 0)
          .attr('text-anchor', 'middle')

          .call(text =>
            text
              .selectAll('tspan')
              .data(
                `x: ${d.x} y: ${d.y} prediction: ${d.prediction} target: ${d.target} diagnosisGroupId: ${d.diagnosisGroupId} date: ${d.date}`,
              )
              .join('tspan')
              .attr('x', 0)
              .attr('y', (_, i) => `${i * 1.1}em`)
              .attr('font-weight', (_, i) => (i ? null : 'bold'))
              .text(d => d),
          );

        const { y, width: w, height: h } = (text.node() as SVGGraphicsElement).getBBox();
        text.attr('transform', `translate(${-w / 2}, ${20 - y})`);
        path
          .attr('d', `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 80}z`)
          .attr('transform', `translate(0, 5)`);
        svgElement.property('value', O[i]).dispatch('input', { bubbles: true } as d3.CustomEventParameters);
      })
      .on('mouseout', (d, i, n) => {
        tooltip.style('display', 'none');
        svgElement.dispatch('input', { bubbles: true } as d3.CustomEventParameters);
      });
  }, [tooltipRef, data, points]);

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

        <g
          width={boundsWidth}
          height={boundsHeight}
          ref={tooltipRef}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(',')})`}
        />
      </svg>
    </div>
  );
};

export default LineChart;
