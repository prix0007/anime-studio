import { Address } from "@livepeer/react";
import { BigNumber } from "ethers";
import useSWR from "swr";
import type { AnimeStudio } from "../contracts/types";
import useAnimeStudioContract from "./useAnimeStudioContract";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";
import useTokenContract from "./useTokenContract";

export type VideoBC = {
  metadata: string;
  price: BigNumber;
  creator: Address;
};

function getTokenBalance(contract: AnimeStudio, from: number, to: number) {
  return async (_: string, from: number, to: number, address: string) => {
    const allVideosResponse = await contract.getVideosInRange(from, to);

    // Transform response from BC for easy consumption in the UI
    return allVideosResponse[1].map((_, index) => {
      return {
        metadata: allVideosResponse[1][index],
        price: allVideosResponse[2][index],
        creator: allVideosResponse[0][index] as Address,
      } as VideoBC;
    });
  };
}

export default function useAnimeStudioAllVideos(
  contractAddress: string,
  from: number,
  to: number,
  suspense = false
) {
  const contract = useAnimeStudioContract(contractAddress);

  const shouldFetch =
    typeof from === "number" &&
    typeof to === "number" &&
    typeof contractAddress === "string" &&
    !!contract;

  const result = useSWR(
    shouldFetch ? ["AllVideos", from, to, contractAddress] : null,
    getTokenBalance(contract, from, to),
    {
      suspense,
    }
  );

  useKeepSWRDataLiveAsBlocksArrive(result.mutate);

  return result;
}
