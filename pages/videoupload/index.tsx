import { useCreateAsset } from "@livepeer/react";
import Head from "next/head";
import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import Button from "../../components/Button";
import Navbar from "../../components/Navbar";

const Index = () => {
  const [video, setVideo] = useState<File | undefined>(undefined);
  const {
    mutate: createAsset,
    data: assets,
    status: assetStatus,
    progress,
    error,
  } = useCreateAsset(
    // we use a `const` assertion here to provide better Typescript types
    // for the returned data
    video
      ? {
          sources: [{ name: video.name, file: video }] as const,
        }
      : null
  );

  console.log({
    createAsset,
    assets,
    assetStatus,
    progress,
    error,
  });

  // React Dropzone Config
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0 && acceptedFiles?.[0]) {
      setVideo(acceptedFiles[0]);
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

  // const progressFormatted = useMemo(
  //   () =>
  //     progress[0]?.phase === "uploading"
  //       ? `Uploading: ${Math.round(progress[0]?.progress * 100)}%`
  //       : progress[0].phase === "processing"
  //       ? `Processing: ${Math.round(progress[0]?.progress * 100)}%`
  //       : null,
  //   [progress, assets]
  // );

  // const isLoading = useMemo(
  //   () =>
  //     progress[0]?.phase === "uploading" ||
  //     progress[0]?.phase === "processing" ||
  //     assetStatus === "loading",
  //   [progress, assetStatus]
  // );

  return (
    <div>
      <Head>
        <title>Anime Studio Saviour</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <Navbar />
      </header>

      <section className="container p-2">
        <h2>Upload your videos</h2>
        <div>
          {!video ? (
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
                      <span className="font-semibold">Click to upload</span> or
                      Drop the files here ...
                    </p>
                  ) : (
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or
                      Drag &apos;n&apos; drop some files here, or click to
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
          ) : (
            <div className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Noteworthy technology acquisitions 2021
              </h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                Here are the biggest enterprise technology acquisitions of 2021
                so far, in reverse chronological order.
              </p>
            </div>
          )}
          <Button
            name="Upload Video"
            onClick={() => {
              createAsset?.();
            }}
          ></Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
