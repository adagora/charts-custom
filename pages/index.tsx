import type { NextPage } from 'next';
import { Button, Container, Typography, Box, CircularProgress, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import LineChartwithTooltip from '@components/LineChartwithTooltip';
import LineChartVolume from '@components/LineChartVolume';
import LineChartVolumeTooltip from '@components/LineChartVolumeTooltip';
import data, { data2 } from './data/data';
import { predictionData } from './data/api.model';

const Home: NextPage = () => {
  const [pointData, setPointData] = useState<{ x: number | Date | null; y: number | null }>();
  const [pending, setPending] = useState(true);
  let color1;
  let color2;
  let color3;
  // render 3 random colors
  const randomColor = () => {
    color1 = Math.floor(Math.random() * 16777215).toString(16);
    color2 = Math.floor(Math.random() * 16777215).toString(16);
    color3 = Math.floor(Math.random() * 16777215).toString(16);
    return { color1, color2, color3 };
  };

  // simulate loading for 2 seconds
  useEffect(() => {
    randomColor();
    const timer = setTimeout(() => {
      setPending(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [pending]);

  return (
    <Container>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button type="submit" variant="contained" size="small" onClick={() => setPending(true)}>
          Random color
        </Button>
      </Box>
      <Box display="flex" justifyContent="flex-start" alignItems="center" height={300} width={1000}>
        {pending ? (
          <CircularProgress />
        ) : (
          <LineChartwithTooltip
            width={700}
            height={400}
            item={predictionData}
            gradientColor={randomColor().color1}
            gradientColorMix={randomColor().color2}
            background={randomColor().color3}
          />
        )}
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

        <LineChartVolumeTooltip
          width={700}
          height={400}
          item={data2}
          gradientColor="#27d827"
          gradientColorMix="#27d827"
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
