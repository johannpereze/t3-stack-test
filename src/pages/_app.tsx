import { ChakraProvider } from "@chakra-ui/react";
import { ClerkProvider } from "@clerk/nextjs";
import { type AppType } from "next/app";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import "~/styles/globals.css";
import { api } from "~/utils/api";
import theme from "~/utils/theme";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <ChakraProvider resetCSS theme={theme}>
        <Head>
          <title>Trinomoji</title>
          <meta name="description" content="Created by johannpereze" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Toaster position="bottom-center" />
        <Component {...pageProps} />
      </ChakraProvider>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
