import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import Account from "../components/Account";
import ETHBalance from "../components/ETHBalance";
import TokenBalance from "../components/TokenBalance";
import useEagerConnect from "../hooks/useEagerConnect";
import { useLivepeerProvider } from "@livepeer/react";
import Button from "../components/Button";
import Navbar from "../components/Navbar";
import BuyTokens from "../components/BuyToken";
import VideoGallery from "../components/VideoGallery";

const ANIME_STUDIO_ERC20_TOKEN =
  process.env.NEXT_PUBLIC_ANIME_STUDIO_ERC20_TOKEN_ADDRESS;

function Home() {
  const { account, library } = useWeb3React();

  const triedToEagerConnect = useEagerConnect();

  const isConnected = typeof account === "string" && !!library;

  const ANIME_STUDIO_CONTRACT_ADDRESS =
    process.env.NEXT_PUBLIC_ANIME_STUDIO_CONTRACT_ADDRESS;

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
        <h1 className="self-center text-6xl text-gray-900">
          Welcome to Anime Studio Saviour
        </h1>
        <h3 className="self-center text-base text-gray-900">
          Here you can mint video NFTs, buy video access and then watch your
          videos
        </h3>
        {isConnected && (
          <section className="flex flex-col align-middle justify-center items-center">
            <TokenBalance
              tokenAddress={ANIME_STUDIO_ERC20_TOKEN}
              symbol="ANST"
            />
            <BuyTokens contractAddress={ANIME_STUDIO_CONTRACT_ADDRESS} />
          </section>
        )}
      </main>
      <section className="flex flex-col align-middle justify-center items-center">
        {isConnected ? (
          <Button name={"Mint a Video NFT"} link={"/upload"} />
        ) : (
          <>
            <Account triedToEagerConnect={triedToEagerConnect} />
            <p className="self-center text-2xl my-3 text-gray-900">
              Connect your wallet and mint a Video NFT.
            </p>
          </>
        )}
      </section>
    </div>
  );
}

export default Home;
