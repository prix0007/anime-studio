import { Web3ReactProvider } from "@web3-react/core";
import type { AppProps } from "next/app";
import getLibrary from "../getLibrary";
import "../styles/globals.css";
import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from "@livepeer/react";

const client = createReactClient({
  provider: studioProvider({ apiKey: process.env.LIVPEER_STUDIO_API_KEY }),
});

function NextWeb3App({ Component, pageProps }: AppProps) {
  return (
    <LivepeerConfig client={client}>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Component {...pageProps} />
      </Web3ReactProvider>
    </LivepeerConfig>
  );
}

export default NextWeb3App;
