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

import { createContext } from "react";

const contractObj = {
  5: {
    main: "0x8FFc11998a9f121c0E7c744742Ed106BddbFfe01",
    token: "0xC53e500D109Eb0051e8CC3e55a6d935415f93F69",
    nft: "",
  },
  1402: {
    main: "0x547F2777219dC09F2eD8640ddf6104cA7fAF05F1",
    nft: "0x3562835A4606712b217630500735bC791Bd7477D",
    token: "0x579Fa7789B958a18a40f07855dE6c82e643f4F63",
  },
};

export const Contracts = createContext(contractObj);

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
        <Contracts.Provider value={contractObj}>
          <Component {...pageProps} />
        </Contracts.Provider>
        <ToastContainer />
      </Web3ReactProvider>
    </LivepeerConfig>
  );
}

export default NextWeb3App;
