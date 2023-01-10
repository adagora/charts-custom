import type { NextPage } from 'next';
import { Button, Container, Typography, Box, CircularProgress, Divider } from '@mui/material';
import ButtonLink from '@components/ButtonLink';
import { useEffect, useState } from 'react';
import LineChartwithTooltipBasic from '@components/LineChartBasicDemo';
import Line from '@components/Line';
import data from './data/data';

const Home: NextPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timer);
    };
  });

  // simulate loading for 2 seconds
  const [pending, setPending] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setPending(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Container>
      <Box display="flex" justifyContent="center" alignItems="center">
        {pending ? <CircularProgress color="secondary" /> : <LineChartwithTooltipBasic />}
      </Box>
      <Box pt={1} pb={2} display="flex" justifyContent="center" alignItems="center">
        <Button
          variant="contained"
          size="small"
          sx={{
            mt: '55px',
          }}
        >
          Test Button Link
        </Button>
      </Box>
      <Divider sx={{ backgroundColor: '9FD2DB' }} />
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" pt={2}>
        <Typography variant="h1" component="h1" gutterBottom>
          24h volume
        </Typography>
        <Line width={700} height={400} data={data} />
      </Box>
    </Container>
  );
};

export default Home;
