import { useWeb3React } from "@web3-react/core";
import Head from "next/head";
import useEagerConnect from "../hooks/useEagerConnect";
import Navbar from "../components/Navbar";
import BuyTokens from "../components/BuyToken";
import VideoGallery from "../components/VideoGallery";

import useCurrentContracts from "../hooks/useCurrentContracts";

function Home() {
  const { account, library } = useWeb3React();
  const isConnected = typeof account === "string" && !!library;

  return (
    <div>
      <Head>
        <title>Anime Studio Saviour</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <Navbar />
      </header>

      <main className="container px-5 py-2 mx-auto lg:pt-12 lg:px-32">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col">
            <h3 className="self-center text-base text-gray-900 mt-5">
              Here you can mint video NFTs, buy video access and then watch your
              videos
            </h3>
            <p className=" self-center text-sm text-red-500">
              We are currently only on Goerli and zkEVM 2.0 Test Network.
            </p>
          </div>
          {isConnected && (
            <div className="flex flex-col align-middle justify-center items-center">
              <BuyTokens />
            </div>
          )}
        </div>
      </main>
      <section>
        <VideoGallery />
      </section>
    </div>
  );
}

export default Home;
