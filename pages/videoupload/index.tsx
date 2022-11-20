import { useCreateAsset } from "@livepeer/react";
import { match } from "assert";
import Head from "next/head";
import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import ReactPlayer from "react-player/file";
import { BounceLoader } from "react-spinners";

import Button from "../../components/Button";
import Navbar from "../../components/Navbar";

const phaseToBadge = (
  phase: "uploading" | "waiting" | "processing" | "ready" | "failed"
) => {
  switch (phase) {
    case "uploading":
      return (
        <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
          Uploading
        </span>
      );
    case "waiting":
      return (
        <span className="bg-gray-100 text-gray-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
          Waiting
        </span>
      );
    case "failed":
      return (
        <span className="bg-red-100 text-red-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-red-200 dark:text-red-900">
          Failed
        </span>
      );
    case "ready":
      return (
        <span className="bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900">
          Ready
        </span>
      );
    case "processing":
      return (
        <span className="bg-yellow-100 text-yellow-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-200 dark:text-yellow-900">
          Processing
        </span>
      );
  }
};

const calculateMessage = (
  phase: "uploading" | "waiting" | "processing" | "ready" | "failed"
) => {
  switch (phase) {
    case "uploading":
      return "File is uploading currently.";
      break;
    case "processing":
      return "File is processing on server";
      break;
    case "ready":
      return "File is ready on server";
      break;
    case "failed":
      return "File has failed to upload or process";
      break;
    case "waiting":
      return "File is currently in waiting state";
      break;
    default:
      return phase;
  }
};

const calculateLoading = (
  phase: "uploading" | "waiting" | "processing" | "ready" | "failed"
) => {
  switch (phase) {
    case "uploading":
      return true;
      break;
    case "processing":
      return true;
      break;
    case "waiting":
      return true;
      break;
    default:
      return false;
  }
};
const formatPercentage = (percent: number) => {
  return `${percent * 100} %`;
};

type IVideoViewAndProgressCard = {
  video: File;
  handleRemove: () => any;
  progress: any;
};

const VideoViewAndProgressCard: React.FC<IVideoViewAndProgressCard> = ({
  video,
  handleRemove,
  progress,
}) => {
  console.log(progress);
  return (
    <div className="block ">
      <h5 className="my-2 ml-2 text-2xl font-bold tracking-tight break-words	 text-gray-900 dark:text-white">
        {video.name}
      </h5>
      <div className="flex justify-between items-start p-2">
        <div>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            {video.size} bytes
          </p>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            {video.type}
          </p>
          <br />
          {phaseToBadge(progress?.phase)}
          <p className="font-normal text-gray-700 dark:text-gray-400">
            {progress?.message}
          </p>
          {(progress?.phase === "uploading" ||
            progress?.phase === "processing") && (
            <p className="font-normal text-gray-700 dark:text-gray-400">
              {formatPercentage(progress?.progress)}
            </p>
          )}
        </div>
        <div className="flex flex-col basis-1 justify-center items-center">
          <button
            type="button"
            onClick={handleRemove}
            className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
          >
            Remove
          </button>
          <BounceLoader color="white" loading={progress?.isLoading || false} />
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const [videos, setVideo] = useState<File[]>([]);
  const {
    mutate: createAsset,
    data: assets,
    status: assetStatus,
    progress,
    error,
  } = useCreateAsset(
    // we use a `const` assertion here to provide better Typescript types
    // for the returned data
    videos.length > 0
      ? {
          sources: videos.map((video) => {
            return { name: video.name, file: video } as const;
          }),
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
    if (acceptedFiles && acceptedFiles.length > 0) {
      setVideo(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "video/*": ["*.mp4"],
    },
    maxFiles: 20,
    onDrop,
  });

  const progressFormattedForFiles = useMemo(() => {
    let mutateProgress = [];
    if (progress && progress.length > 0) {
      mutateProgress = progress.map((fileProgress) => {
        return {
          ...fileProgress,
          message: calculateMessage(fileProgress.phase),
          isLoading: calculateLoading(fileProgress.phase),
        };
      });
    }
    return mutateProgress;
  }, [progress]);

  console.log("Formatted Progress", progressFormattedForFiles);

  const handleRemove = (index) => {
    setVideo(videos.filter((_, idx) => idx !== index));
  };

  return (
    <div>
      <Head>
        <title>Anime Studio Saviour</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <Navbar />
      </header>

      <section className="p-2">
        <h2>Upload your videos</h2>
        <div className="w-full">
          {videos.length === 0 ? (
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
                    MP4 Only (max. 1000mb per video)
                  </p>
                </div>
              </label>
              <input {...getInputProps()} />
            </div>
          ) : (
            <div className="w-full flex justify-center items-center">
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                {videos.map((video, index) => {
                  return (
                    <div
                      key={index}
                      className="block p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-900"
                    >
                      <ReactPlayer
                        url={URL.createObjectURL(video)}
                        controls={!progressFormattedForFiles[index]?.isLoading}
                        style={{ maxWidth: "100%", maxHeight: "200px" }}
                      />
                      <VideoViewAndProgressCard
                        video={video}
                        handleRemove={() => handleRemove(index)}
                        progress={progressFormattedForFiles[index]}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {videos && (
            <Button
              name="Upload Video"
              onClick={() => {
                createAsset?.();
              }}
            ></Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
