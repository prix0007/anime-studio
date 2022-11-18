import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import Account from "../components/Account";
import ETHBalance from "../components/ETHBalance";
import TokenBalance from "../components/TokenBalance";
import useEagerConnect from "../hooks/useEagerConnect";
import { useLivepeerProvider } from "@livepeer/react";
import Button from "../components/Button";
import Navbar from "../components/Navbar";
import BuyTokens from "../components/BuyToken";
import VideoGallery from "../components/VideoGallery";

import { Contracts } from "../pages/_app";
import { toast } from "react-toastify";
import useCurrentContracts from "../hooks/useCurrentContracts";

function Home() {
  const { account, library, chainId } = useWeb3React();

  const triedToEagerConnect = useEagerConnect();

  const isConnected = typeof account === "string" && !!library;

  const activeContracts = useCurrentContracts();

  return (
    <div>
      <Head>
        <title>Anime Studio Saviour</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <Navbar />
      </header>

      <main className="flex flex-col">
        <h3 className="self-center text-base text-gray-900 mt-5">
          Here you can mint video NFTs, buy video access and then watch your
          videos
        </h3>
        <p className=" self-center text-sm text-red-500">
          We are currently only on Goerli Test Network.
        </p>
        {isConnected && (
          <section className="flex flex-col align-middle justify-center items-center">
            <BuyTokens />
          </section>
        )}
      </main>
      <section>
        <VideoGallery />
      </section>
    </div>
  );
}

export default Home;
