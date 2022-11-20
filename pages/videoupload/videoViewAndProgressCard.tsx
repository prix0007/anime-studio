import { BounceLoader } from "react-spinners";

export const phaseToBadge = (
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

export const calculateMessage = (
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

export const calculateLoading = (
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
export const formatPercentage = (percent: number) => {
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
          {(
            <button
              type="button"
              onClick={handleRemove}
              className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
            >
              Remove
            </button>
          )}
          <BounceLoader color="white" loading={progress?.isLoading || false} />
        </div>
      </div>
    </div>
  );
};

export default VideoViewAndProgressCard;
