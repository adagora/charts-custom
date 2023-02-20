/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useEffect } from 'react';
import '@styles/globals.css';
import type { AppProps } from 'next/app';
import { DarkTheme, LightTheme } from '@theme/theme';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from '@components/Layout';
import Head from 'next/head';
import { AnimatePresence } from 'framer-motion';
import { ThemeContext } from '@lib/ThemeContext';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [theme, setTheme] = useState<any>(LightTheme);

  useEffect(() => {
    setTheme(localStorage.getItem('darkToggle') === 'dark' ? DarkTheme : LightTheme);
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, user-scalable=yes" />
      </Head>
      <ThemeProvider theme={theme}>
        <ThemeContext.Provider value={{ theme, setTheme }}>
          <CssBaseline enableColorScheme />
          <AnimatePresence exitBeforeEnter>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </AnimatePresence>
        </ThemeContext.Provider>
      </ThemeProvider>
    </>
  );
};

export default MyApp;
