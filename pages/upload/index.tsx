import React, { useCallback, useEffect, useMemo, useState } from "react";

import * as tusClient from "tus-js-client";
import { useDropzone } from "react-dropzone";

import { BarLoader, ClockLoader } from "react-spinners";
import { useWeb3React } from "@web3-react/core";
import Account from "../../components/Account";
import useEagerConnect from "../../hooks/useEagerConnect";
import { Player } from "@livepeer/react";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Upload = () => {
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

  const [asset, setAsset] = useState<any>("farse");

  // useEffect(() => {
  //   if (asset && asset?.status?.phase === "ready") {
  //     setIPFSExporting(true);
  //     updateAsset({
  //       assetId: asset?.id,
  //       storage: { ipfs: true },
  //     });
  //   }
  // }, [asset]);

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
      console.log(asset);
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

        setLoading(false);
      },
    });
    const previousUploads = await upload.findPreviousUploads();
    if (previousUploads.length > 0) {
      upload.resumeFromPreviousUpload(previousUploads[0]);
    }
    upload.start();
  };

  return (
    <>
      <h1>Upload a Video</h1>
      {isConnected ? (
        !asset?.storage?.ipfs?.cid ? (
          <>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <div>
                {isDragActive ? (
                  <p>Drop the files here ...</p>
                ) : (
                  <p>Drag 'n' drop some files here, or click to select files</p>
                )}
              </div>
            </div>
            <div>
              {file ? (
                <p>Name: {file.name}</p>
              ) : (
                <p>Select a video file to upload.</p>
              )}
            </div>
            <button
              disabled={!file || isLoading || isProcessing}
              onClick={handleUpload}
            >
              Upload Video
            </button>
            {isLoading && <ClockLoader color="#000" />}
            {isProcessing && (
              <p>
                Processing !! <BarLoader color="#ABABAB" />{" "}
                {(asset?.status?.progress * 100).toFixed(2)}%
              </p>
            )}
            {isLoading && <p>Uploading : {progress}%</p>}
          </>
        ) : (
          <>
          {asset?.playbackId && <Player playbackId={asset?.playbackId} />}
          <p>
            Stored Successfully to IPFS as:{" "}
            {JSON.stringify(asset?.storage?.ipfs)}
          </p>
          </>
        )
      ) : (
        <>
          <h3>Connect your wallet!!</h3>
          <Account triedToEagerConnect={triedToEagerConnect} />
          <p>{account}</p>
        </>
      )}
    </>
  );
};

export default Upload;
