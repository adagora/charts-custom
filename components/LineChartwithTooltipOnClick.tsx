/* eslint-disable @typescript-eslint/no-use-before-define */
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/system';

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

const LineChartwithTooltipOnClick = ({
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
  const [pointDescription, setPointDescription] = useState<DataPoint[]>([]);

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

    const POINTS = data.map(d => [xScale(d.x), yScale(d.y), { ...d }]);
    const tooltip = constructTooltip(svg);
    function pointermoved(event: any) {
      const i = d3.bisectCenter(X as any, xScale.invert(d3.pointer(event)[0]));
      tooltip.style('display', null);
      (svg as any).property('value', O[i]).dispatch('input', { bubbles: true });
    }

    function pointerleft() {
      tooltip.style('display', 'none');
      tooltip.style('display', 'none');
      (svg.node() as any).value = null;
      svg.dispatch('input', { bubbles: true } as d3.CustomEventParameters);
    }

    function constructTooltip(
      svgItem: d3.Selection<SVGSVGElement, undefined, null, undefined>,
    ): d3.Selection<SVGGElement, undefined, null, undefined> {
      const Tooltip = svg.append('g').style('pointer-events', 'none');

      svgItem
        .selectAll('circle')
        .data(POINTS)
        .enter()
        .append('circle')
        .on('pointerenter pointermove', pointermoved)
        .on('pointerleave', pointerleft)
        .on('touchstart', event => event.preventDefault())
        .on('click', event => {
          setPointDescription((prevState: any) => {
            // eslint-disable-next-line no-underscore-dangle
            const pointClick = event.target.__data__;
            // if prevstate is the same drop it from array
            if (prevState.includes(pointClick[2])) {
              return prevState.filter((i: any) => i !== pointClick[2]);
            }

            // drop from array 2 first items and return 3rd
            const pointClickDescription = pointClick[2];

            return prevState.concat(pointClickDescription);
          });
        })

        .attr('r', 4)
        .attr('stroke', 'url(#lineGradient)')
        .attr('cursor', 'pointer')
        .attr('stroke-width', 2)
        .attr('fill', '#1e2730')
        .attr('cx', 0)
        .attr('cy', '-5')
        .attr('cx', d => d[0] as any)
        .attr('cy', d => d[1] as any)
        .attr('r', 3)

        .append('line')
        .attr('y', 3)
        .attr('stroke', '#4a667a')
        .attr('stroke-opacity', 0.5)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,3')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0);

      return Tooltip;
    }

    return svg.node() as Node;
  }

  return (
    <>
      <div ref={containerRef} />

      {/* Side container with information about points */}
      <Box display="flex" flexDirection="column" justifyContent="space-around" alignItems="flex-end">
        {pointDescription &&
          pointDescription.length > 0 &&
          pointDescription.map(p => (
            <Box padding={2} fontWeight={500} borderRadius={2} bgcolor="rgba(52, 49, 58, 0.6)" key={p.id} pb={2}>
              <div>X: {p.x}</div>
              <div>Y: {p.y}</div>
              <div>Target: {p.target}</div>
              <div>Prediction: {p.prediction}</div>
              <div> DiagnosisGroupId: {p.diagnosisGroupId}</div>
              <button
                type="button"
                onClick={() => {
                  const items = pointDescription.filter(i => i.id !== p.id);
                  setPointDescription(items);
                }}
              >
                Close
              </button>
            </Box>
          ))}
      </Box>
    </>
  );
};

export default LineChartwithTooltipOnClick;
