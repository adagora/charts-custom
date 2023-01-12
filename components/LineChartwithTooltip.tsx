import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  id: number;
  x: number;
  y: number;
  target: number;
  prediction: number;
  diagnosisGroupId: number;
  date: string;
}
interface LineChartProps {
  width?: number;
  height?: number;
  item: DataPoint[];
  label?: string;
  gradientColor: string;
  gradientColorMix: string;
  background?: string;
  axis?: string;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  disableAxis?: boolean;
}

const LineChartwithTooltip = ({
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
}: LineChartProps) => {
  const [dataChart, setDataChart] = useState<DataPoint[]>([]);
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

  function lineChart(data: DataPoint[], title: string) {
    const X = d3.map(data, x => x.x);
    const Y = d3.map(data, y => y.y);
    const O = d3.map(data, d => d);
    const I = d3.map(data, (_, i) => i);

    // Compute default domains.
    const xDomain = d3.extent(X);
    const maxY = d3.max(Y) as number;

    const yDomain = ['0', !!maxY && maxY > 400 ? maxY.toString() : maxY + 0.1];

    // Construct scales and axes.
    const xScale = d3.scaleLinear(xDomain as Iterable<d3.NumberValue>, [left, width - right]);
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

    svg
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', `url(#lineGradient-${uid})`)
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

    svg
      .append('path')
      .attr('fill', `url(#${`shadowGradient-${uid}`})`)
      .attr('d', area(I));

    const points = data.map(d => [xScale(d.x), yScale(d.y)]);

    function constructTooltip(
      svg: d3.Selection<SVGSVGElement, undefined, null, undefined>,
    ): d3.Selection<SVGGElement, undefined, null, undefined> {
      const tooltip = svg.append('g');

      tooltip
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

      return tooltip;
    }

    // Construct tooltip
    const tooltip = constructTooltip(svg);
    const tooltipLabel = constructTooltipLabel(xScale, yScale, X, Y);

    // Add actions to chart
    svg
      .on('mouseover', (d, i, n) => {
        console.log('mouseover', d, i, n);
        tooltip.style('display', null);
        tooltip.select('circle').style('display', null);
        tooltip.select('line').style('display', 'none');
        // tooltip.attr('transform', `translate(${xScale(X[i])}, ${yScale(Y[i]) + 5})`);

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
        svg.property('value', O[i]).dispatch('input', { bubbles: true } as d3.CustomEventParameters);
      })
      .on('mouseout', (d, i, n) => {
        tooltip.style('display', 'none');
        svg.dispatch('input', { bubbles: true } as d3.CustomEventParameters);
      });

    return svg.node() as Node;
  }

  function constructTooltipLabel(
    xScale: d3.ScaleTime<number, number, never>,
    yScale: d3.ScaleLinear<number, number, never>,
    X: any[],
    Y: number[],
  ) {
    const formatDate = xScale.tickFormat(100);
    const formatValue = yScale.tickFormat(100);

    return (i: number, _number?: number, _data?: any[]) => `${formatDate(X[i])}\n${formatValue(Y[i])}`;
  }

  return <div ref={containerRef} />;
};

export default LineChartwithTooltip;