import React, { FC, useEffect, useState } from "react";

import { Player } from "@livepeer/react";
import Image from "next/image";

import loadingVideo from "../public/loading_video.jpg";
import { BigNumber, ethers } from "ethers";
import { shortenHex } from "../util";
import Jdenticon from "react-jdenticon";
import useSWR from "swr";
import useAnimeStudioGetVideoDetails from "../hooks/useAnimeStudioContractGetVideo";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import useAnimeStudioContract from "../hooks/useAnimeStudioContract";
import useTokenContract from "../hooks/useTokenContract";
import Button from "./Button";

const PosterImage = () => {
  return (
    <img
      src={
        "https://static.vecteezy.com/system/resources/previews/003/685/273/large_2x/loading-neon-signs-style-text-free-vector.jpg"
      }
    />
  );
};

type VideoProps = {
  price: BigNumber;
  creator: string;
  metadata: string;
  tokenId: number;
};

const ANIME_STUDIO_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_ANIME_STUDIO_CONTRACT_ADDRESS;

const ANIME_STUDIO_TOKEN_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_ANIME_STUDIO_ERC20_TOKEN_ADDRESS;

const Video: FC<VideoProps> = ({ metadata, price, creator, tokenId }) => {
  const { account } = useWeb3React();

  const contract = useAnimeStudioContract(ANIME_STUDIO_CONTRACT_ADDRESS);
  const tokenContract = useTokenContract(ANIME_STUDIO_TOKEN_CONTRACT_ADDRESS);

  const [isAllowanceButton, setAllowanceButton] = useState(false);

  const { data, error } = useSWR(metadata, async (key) => {
    const res = await fetch(`https://ipfs.livepeer.studio/ipfs/${key}`);
    return await res.json();
  });

  const { data: videoDetails, error: videoError } =
    useAnimeStudioGetVideoDetails(ANIME_STUDIO_CONTRACT_ADDRESS, tokenId);

  useEffect(() => {
    // console.log(videoDetails);
  }, [videoDetails]);

  const buyVideo = async () => {
    if (!account) {
      toast("Connect to your wallet first!!!");
    }

    const allowance = await tokenContract.allowance(
      account,
      ANIME_STUDIO_CONTRACT_ADDRESS
    );
    console.log(allowance)
    if (allowance.lt(price)) {
      toast("Please allow anime studio contract to spend your ANST Token!!!");
      setAllowanceButton(true);
      return;
    }

    setAllowanceButton(false);

    const tx = await contract.buyVideoAccess(tokenId);
    await tx.wait();

    toast("Transaction Sent Successfully. You will get access soon!!");
  };

  const setAllowance = async () => {
    toast("wait for tx to go through!!");
    const tx = await tokenContract.approve(
      ANIME_STUDIO_CONTRACT_ADDRESS,
      price
    );
    tx.wait();
    toast("approved successfulluy");
  };

  return (
    <div className="flex justify-center">
      <div className="rounded-lg shadow-lg bg-white max-w-sm">
        <Player
          title={data?.name}
          playbackId={data?.animation_url}
          loop={false}
          autoPlay={false}
          showTitle={false}
          poster={<PosterImage />}
        />
        <div className="p-6">
          <div className="flex items-center">
            <Jdenticon size={50} value={creator} />
            <h5 className="text-gray-900 text-xl font-medium mb-2">
              {`${shortenHex(creator, 8)}`}
            </h5>
          </div>

          <p className="text-gray-700 text-base mb-4">
            Price: {ethers.utils.formatUnits(price, 18)} ANST Tokens
          </p>
          {isAllowanceButton && (
            <Button onClick={setAllowance} name={"Give Allowance"} />
          )}
          {videoDetails ? (
            <>
              <p>You have access to this video</p>
              <a>Playback Id: {videoDetails.videoIpfs.slice(0, 20)}</a>
            </>
          ) : (
            <button
              type="button"
              onClick={buyVideo}
              className=" inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
            >
              Buy this Video
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Video;
