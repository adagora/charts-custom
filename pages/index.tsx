import type { NextPage } from 'next';
import { Button, Container, Typography, Box, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import LineChartVolume from '@components/LineChartVolume';
import LineChartwithTooltipOnClick from '@components/LineChartwithTooltipOnClick';
import * as d3 from 'd3';
import LineChartwithInterval from '@components/LineChartwithInterval';
import data, { data2 } from './data/data';
import { predictionData } from './data/api.model';

const Home: NextPage = () => {
  const arrayResponse: any = [];
  let average: any = 0;
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
          item={data2}
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
          item={data2}
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
