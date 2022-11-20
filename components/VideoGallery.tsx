import { useWeb3React } from "@web3-react/core";
import React, { useContext, useEffect, useState } from "react";
import { ClockLoader } from "react-spinners";
import { toast } from "react-toastify";
import useAnimeStudioContract from "../hooks/useAnimeStudioContract";
import useAnimeStudioAllVideos from "../hooks/useAnimeStudioContractAllVideos";
import useAnimeStudioAllVideosCount from "../hooks/useAnimeStudioContractAllVideosCount";
import useCurrentContracts from "../hooks/useCurrentContracts";

import Video from "./Video";

const VideoGallery = () => {
  const activeContracts = useCurrentContracts();

  const { data: totalVideos, error: totalError } = useAnimeStudioAllVideosCount(
    activeContracts?.main
  );

  const {
    data: videos,
    error: videoErrors,
    isValidating,
  } = useAnimeStudioAllVideos(
    activeContracts?.main,
    0,
    totalVideos && totalVideos.toNumber()
  );

  // useEffect(() => {
  //   console.log(videos);
  //   console.log(totalVideos);
  // }, [videos, totalVideos]);

  return (
    <section className="overflow-hidden text-gray-700 ">
      <div className="container px-5 py-2 mx-auto lg:pt-12 lg:px-32">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {totalVideos?.toNumber() == 0 && <p>No Video Exists Yet!!</p>}
          {videos
            ? videos.map((video, _idx) => {
                return (
                  <div className="flex flex-wrap" key={_idx}>
                    <div className="w-full p-1 md:p-2">
                      <Video
                        tokenId={_idx}
                        activeContracts={activeContracts}
                        {...video}
                      />
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
