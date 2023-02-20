import type { NextPage } from 'next';
import { Container, Typography, Box, Divider } from '@mui/material';
import LineChartVolume from '@components/LineChartVolume';
import LineChartwithTooltipOnClick from '@components/LineChartwithTooltipOnClick';
import * as d3 from 'd3';
import LineChartwithInterval from '@components/LineChartwithInterval';

const data = [
  {
    date: new Date('2022-10-01T00:00:00.000Z'),
    open: 100.0,
    high: 105.0,
    low: 99.5,
    close: 104.0,
    volume: 50000,
    adjclose: 104.0,
  },
  {
    date: new Date('2022-10-01T01:00:00.000Z'),
    open: 104.5,
    high: 110.0,
    low: 104.0,
    close: 109.5,
    volume: 60000,
    adjclose: 109.5,
  },
  {
    date: new Date('2022-10-01T02:00:00.000Z'),
    open: 109.0,
    high: 112.0,
    low: 108.5,
    close: 111.0,
    volume: 55000,
    adjclose: 111.0,
  },
  {
    date: new Date('2022-10-01T03:00:00.000Z'),
    open: 111.5,
    high: 113.0,
    low: 110.5,
    close: 112.0,
    volume: 42000,
    adjclose: 112.0,
  },
  {
    date: new Date('2022-10-01T04:00:00.000Z'),
    open: 112.5,
    high: 115.0,
    low: 112.0,
    close: 114.5,
    volume: 48000,
    adjclose: 114.5,
  },
  {
    date: new Date('2022-10-01T05:00:00.000Z'),
    open: 114.0,
    high: 116.5,
    low: 113.5,
    close: 115.5,
    volume: 53000,
    adjclose: 115.5,
  },
  {
    date: new Date('2022-10-01T06:00:00.000Z'),
    open: 115.0,
    high: 116.5,
    low: 114.5,
    close: 116.0,
    volume: 45000,
    adjclose: 116.0,
  },
  {
    date: new Date('2022-10-01T07:00:00.000Z'),
    open: 116.5,
    high: 117.0,
    low: 115.5,
    close: 116.0,
    volume: 40000,
    adjclose: 116.8,
  },
  {
    date: new Date('2022-10-01T08:00:00.000Z'),
    open: 116.5,
    high: 117.0,
    low: 115.5,
    close: 116.0,
    volume: 40000,
    adjclose: 116.8,
  },
];

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
    prediction: 3,
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

const Home: NextPage = () => {
  const arrayResponse: any = [];

  d3.csv('http://localhost:3000/blockchain_sample_data.csv').then((response: any) => {
    response.forEach((item: any) => {
      arrayResponse.push({
        date: new Date(item.date),
        avg_transfer_value: item.avg_transfer_value,
        transfers_count: item.transfers_count,
      });
    });
  });

  return (
    <Container>
      <Box padding={10} width="100%" display="flex" justifyContent="center" alignItems="center">
        <LineChartwithInterval
          width={800}
          height={280}
          data={arrayResponse}
          gradientColor="#2FC882"
          gradientColorMix="#2FC882"
          background="transparent"
          top={20}
          right={50}
          bottom={20}
          left={40}
          // disableAxis
          defaultValue={0.0}
        />
      </Box>

      <Box display="flex" justifyContent="flex-start" alignItems="center" height={300} width={1000}>
        <Box display="flex" flexDirection="row" justifyContent="flex-end" alignItems="center">
          <LineChartwithTooltipOnClick
            width={700}
            height={400}
            item={predictionData}
            gradientColor="#fff"
            gradientColorMix="#2FC882"
            background="transparent"
          />
        </Box>
      </Box>

      <Box padding={5} />
      <Divider sx={{ backgroundColor: '9FD2DB' }} />
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" pt={2}>
        <Typography variant="h1" component="h1" gutterBottom>
          24h volume
        </Typography>
        <LineChartVolume
          width={700}
          height={400}
          item={data}
          label="volume/utc"
          gradientColor="#880808"
          gradientColorMix="#880808"
          background="transparent"
        />
        <LineChartVolume
          width={700}
          height={400}
          item={data}
          gradientColor="#3525c4"
          gradientColorMix="#c4aa25"
          background="transparent"
          label="volume/utc"
          axis="#3525c4"
          top={50}
          right={100}
          bottom={50}
          left={50}
        />

        <LineChartVolume
          width={700}
          height={400}
          item={data}
          gradientColor="#9F2B68"
          gradientColorMix="#800020"
          label="without axis"
          top={50}
          right={100}
          bottom={30}
          left={50}
          disableAxis
        />
      </Box>
    </Container>
  );
};

export default Home;
