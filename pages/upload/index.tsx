import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as tusClient from "tus-js-client";
import { useDropzone } from "react-dropzone";

import { BarLoader, ClockLoader } from "react-spinners";
import { useWeb3React } from "@web3-react/core";
import Account from "../../components/Account";
import useEagerConnect from "../../hooks/useEagerConnect";
import { Player, useCreateAsset } from "@livepeer/react";
import Head from "next/head";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";
import Link from "next/link";
import useAnimeStudioContract from "../../hooks/useAnimeStudioContract";
import { ethers } from "ethers";

import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Contracts } from "../_app";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ANIME_STUDIO_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_ANIME_STUDIO_CONTRACT_ADDRESS;

const Upload = () => {
  const { pathname, push } = useRouter();

  const [file, setFile] = useState<any>("");

  // Account Connection Setup
  const { account, library, chainId } = useWeb3React();
  const triedToEagerConnect = useEagerConnect();
  const isConnected = typeof account === "string" && !!library;

  

  // Uploading Video Stuff
  const [isLoading, setLoading] = useState(false);
  const [isProcessing, setProcessing] = useState(false);
  const [isIPFSExporting, setIPFSExporting] = useState(false);
  const [progress, setProgress] = useState("0");

  const [price, setPrice] = useState("");
  const [tx, setTx] = useState(null);
  const [txLoading, setTxLoading] = useState(true);

  const contracts = useContext(Contracts);

  const [activeContracts, setActiveContracts] = useState<{
    main: string;
    token: string;
    nft: string;
  }>(null);

  // AnimeStudio Contract
  const animeContract = useAnimeStudioContract(activeContracts?.main);

  useEffect(() => {
    if (contracts[chainId]) {
      setActiveContracts({
        ...contracts[chainId],
      });
    }
  }, [contracts]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0 && acceptedFiles?.[0]) {
      setFile(acceptedFiles[0]);
    }
    console.log(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "video/*": ["*.mp4"],
    },
    maxFiles: 1,
    onDrop,
  });

  const [asset, setAsset] = useState<any>("");

  const fetchResourceById = async (assetId: string) => {
    try {
      const response = await fetch(
        `https://livepeer.studio/api/asset/${assetId}`,
        {
          method: "GET",
          headers: {
            method: "GET",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_LIVPEER_STUDIO_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      return result;
    } catch (e) {
      console.log(e);
      return asset;
    }
  };

  const updateStorageById = async (assetId: string) => {
    try {
      const response = await fetch(
        `https://livepeer.studio/api/asset/${assetId}`,
        {
          method: "PATCH",
          headers: {
            method: "PATCH",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_LIVPEER_STUDIO_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ storage: { ipfs: {} } }),
        }
      );

      const result = await response.json();
      console.log("IPFS Repsonse..");
      console.log(result);
      return result;
    } catch (e) {
      console.log(e);
      return asset;
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (asset && typeof asset === "object") {
        const response = await fetchResourceById(asset.id);
        if (response?.storage?.ipfs?.cid) {
          setIPFSExporting(false);
        }
        setAsset(response);
        checkStatus();
      } else {
        // Make sure to clear the interval in the else case, or
        // it will keep running (even though you don't see it)
        clearInterval(interval);
        return asset;
      }
    }, 5000);
    return () => clearInterval(interval);
  });

  const createNewResource = async () => {
    if (!file) {
      return;
    }

    console.log(file.name);
    const response = await fetch(
      "https://livepeer.studio/api/asset/request-upload",
      {
        method: "POST",
        headers: {
          method: "POST",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_LIVPEER_STUDIO_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: file.name,
        }),
      }
    );

    const result = await response.json();
    setAsset({ ...result.asset });
    return result;
  };

  const checkStatus = () => {
    if (asset) {
      console.log(asset?.status?.phase);
      if (
        asset?.status?.phase == "processing" ||
        asset?.status?.phase == "waiting"
      ) {
        setProcessing(true);
      }
      if (asset?.status?.phase == "ready") {
        setProcessing(false);
        setLoading(false);
        setIPFSExporting(true);
        updateStorageById(asset.id);
      }
    }
  };

  const handleUpload = async () => {
    setLoading(true);

    const { tusEndpoint, asset } = await createNewResource();
    console.log(asset);
    setAsset(asset);

    const upload = new tusClient.Upload(file, {
      endpoint: tusEndpoint, // URL from `tusEndpoint` field in the `/request-upload` response
      metadata: {
        filename: file.name,
        filetype: "video/mp4",
      },
      uploadSize: file.size,
      onError(err) {
        console.error("Error uploading file:", err);
      },
      onProgress(bytesUploaded, bytesTotal) {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        setProgress(percentage);
        console.log("Uploaded " + percentage + "%");
      },
      onSuccess() {
        console.log("Upload finished:", upload.url);
        console.log(upload);
      },
    });
    const previousUploads = await upload.findPreviousUploads();
    if (previousUploads.length > 0) {
      upload.resumeFromPreviousUpload(previousUploads[0]);
    }
    upload.start();
  };

  const handleMintNft = async () => {
    console.log(asset.storage.ipfs);

    if (asset.storage.ipfs) {
      const playbackId = asset.playbackId;
      const metaDataHash = asset.storage.ipfs.nftMetadata.cid;
      const finalPrice = ethers.utils.parseEther(price);

      setTxLoading(true);

      const tx = await animeContract.addVideo(
        playbackId,
        metaDataHash,
        finalPrice
      );
      const txReceipt = await tx.wait();
      console.log(txReceipt);
      setTx(txReceipt);
      setTxLoading(false);
    } else {
      console.error("IPFS Asset not found!!");
    }
  };

  return (
    <>
      <Head>
        <title>Mint a Video NFT</title>
      </Head>
      <header>
        <Navbar />
      </header>
      <section className="flex flex-col p-4">
        <h1 className="self-center text-4xl text-gray-900 my-3">
          Upload a video and Mint VideoNFT
        </h1>
        {!asset?.storage?.ipfs?.cid ? (
          <>
            {!file && (
              <div
                className="flex justify-center items-center w-full"
                {...getRootProps()}
              >
                <label className="flex flex-col justify-center items-center w-full h-64 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                  <div className="flex flex-col justify-center items-center pt-5 pb-6">
                    <svg
                      aria-hidden="true"
                      className="mb-3 w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      ></path>
                    </svg>
                    {isDragActive ? (
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or Drop the files here ...
                      </p>
                    ) : (
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or Drag &apos;n&apos; drop some files here, or click to
                        select files
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      MP4 (MAX. 1000mb)
                    </p>
                  </div>
                </label>
                <input {...getInputProps()} />
              </div>
            )}

            <div>
              {file && !isLoading && !isProcessing && (
                <div className="p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {file.name}
                  </h5>

                  <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    File Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <button
                    className="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                    onClick={() => {
                      setFile(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            {!isIPFSExporting ? (
              <>
                <Button
                  disabled={!file || isLoading || isProcessing}
                  onClick={handleUpload}
                  name={"Upload Video"}
                />
                {isLoading && <ClockLoader color="#000" />}
                {isProcessing && (
                  <p className="text-lg text-gray-900">
                    Processing !! <BarLoader color="#ABABAB" />{" "}
                    {(asset?.status?.progress * 100).toFixed(2)}%
                  </p>
                )}
                {isLoading && <p>Uploading : {progress}%</p>}
              </>
            ) : (
              <p className="self-center text-lg text-gray-900">
                <ClockLoader color="#000" />
                Storing Video in IPFS...
              </p>
            )}
          </>
        ) : (
          <>
            {asset?.playbackId && <Player playbackId={asset?.playbackId} />}
            <p className="text-lg text-gray-900 my-3">
              Stored Successfully to IPFS as:{" "}
              <Link href={asset?.storage?.ipfs?.nftMetadata?.gatewayUrl}>
                {asset?.storage?.ipfs?.nftMetadata?.cid}
              </Link>
            </p>
            {!txLoading ? (
              <>
                <p>Sending Transaction to the Blockchain...</p>
              </>
            ) : (
              <>
                <input
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                  }}
                  type="number"
                  className="block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Enter a price to set for the Video. 0.1, 0.2, ..."
                />
                <Button name="Mint Video NFT!" onClick={handleMintNft} />
              </>
            )}
            {tx && (
              <h3>
                Successfully send Tx with transaction ID:{" "}
                <a
                  href={`https://goerli.etherscan.io/tx/${tx.transactionHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {tx.transactionHash}
                </a>
              </h3>
            )}
          </>
        )}
      </section>
    </>
  );
};

export default Upload;
