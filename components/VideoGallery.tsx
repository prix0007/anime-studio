import React, { useContext, useEffect } from "react";
import { ClockLoader } from "react-spinners";
import useAnimeStudioContract from "../hooks/useAnimeStudioContract";
import useAnimeStudioAllVideos from "../hooks/useAnimeStudioContractAllVideos";
import useAnimeStudioAllVideosCount from "../hooks/useAnimeStudioContractAllVideosCount";

import Video from "./Video";

const VideoGallery = ({ contractAddress }) => {
  const { data: totalVideos, error: totalError } =
    useAnimeStudioAllVideosCount(contractAddress);

  const {
    data: videos,
    error: videoErrors,
    isValidating,
  } = useAnimeStudioAllVideos(
    contractAddress,
    0,
    totalVideos && totalVideos.toNumber()
  );

  useEffect(() => {
    console.log(videos);
    console.log(totalVideos);
  }, [videos]);

  return (
    <section className="overflow-hidden text-gray-700 ">
      <div className="container px-5 py-2 mx-auto lg:pt-12 lg:px-32">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {totalVideos?.toNumber() == 0 && <p>No Video Exists Yet!!</p>}
          {videos
            ? videos.map((video, _idx) => {
                // Dump code
                if (_idx == 3) {
                  return;
                }
                return (
                  <div className="flex flex-wrap" key={_idx}>
                    <div className="w-full p-1 md:p-2">
                      <Video tokenId={_idx} {...video} />
                    </div>
                  </div>
                );
              })
            : totalVideos?.toNumber() > 0 && <ClockLoader color="#000" />}
        </div>
      </div>
    </section>
  );
};

export default VideoGallery;
