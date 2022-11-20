import { Web3ReactProvider } from "@web3-react/core";
import type { AppProps } from "next/app";
import getLibrary from "../getLibrary";
import "../styles/globals.css";
import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from "@livepeer/react";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const client = createReactClient({
  provider: studioProvider({
    apiKey: process.env.NEXT_PUBLIC_LIVPEER_STUDIO_API_KEY,
  }),
});

function NextWeb3App({ Component, pageProps }: AppProps) {
  console.log(pageProps);
  return (
    <LivepeerConfig client={client}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Component {...pageProps} />
        <ToastContainer />
      </Web3ReactProvider>
    </LivepeerConfig>
  );
}

export default NextWeb3App;
