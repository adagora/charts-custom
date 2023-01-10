import data from '@pages/data/data';
import LineChartwithTooltip from './LineChartwithTooltip';

const predictionData = [
  {
    id: 1,
    x: 10,
    y: 0.5,
    target: 1,
    prediction: 0,
    diagnosisGroupId: 1,
    date: '2020-01-01',
  },
  {
    id: 2,
    x: 30,
    y: 0.52,
    target: 0,
    prediction: 0,
    diagnosisGroupId: 5,
    date: '2020-01-02',
  },
  {
    id: 3,
    x: 50,
    y: 0.53,
    target: 1,
    prediction: 0,
    diagnosisGroupId: 5,
    date: '2020-01-03',
  },
  {
    id: 4,
    x: 70,
    y: 0.6,
    target: 1,
    prediction: 0,
    diagnosisGroupId: 5,
    date: '2020-01-04',
  },
  {
    id: 5,
    x: 90,
    y: 0.7,
    target: 0,
    prediction: 0,
    diagnosisGroupId: 1,
    date: '2020-01-05',
  },
  {
    id: 6,
    x: 110,
    y: 0.65,
    target: 1,
    prediction: 0,
    diagnosisGroupId: 5,
    date: '2020-01-06',
  },
  {
    id: 7,
    x: 130,
    y: 0.75,
    target: 1,
    prediction: 0,
    diagnosisGroupId: 5,
    date: '2020-01-07',
  },
  {
    id: 8,
    x: 150,
    y: 1.2,
    target: 1,
    prediction: 0,
    diagnosisGroupId: 5,
    date: '2020-01-08',
  },
];

const LineChartwithTooltipBasic = ({ width = 700, height = 400 }) => (
  <LineChartwithTooltip data={predictionData} width={width} height={height} />
);

export default LineChartwithTooltipBasic;
