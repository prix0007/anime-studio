import { BigNumber } from "ethers";
import useSWR from "swr";
import type { AnimeStudio } from "../contracts/types";
import useAnimeStudioContract from "./useAnimeStudioContract";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";

function getVideo(contract: AnimeStudio, tokenId: number) {
  return async (_: string, address: string, tokenId: number) => {
    try {
      const totalVideos = await contract.retrieveVideoDetails(tokenId);
      return totalVideos;
    } catch (e) {
      return false;
    }
  };
}

export default function useAnimeStudioGetVideoDetails(
  contractAddress: string,
  tokenId: number,
  suspense = false
) {
  const contract = useAnimeStudioContract(contractAddress);

  const shouldFetch = typeof contractAddress === "string" && !!contract;

  const result = useSWR(
    shouldFetch ? ["Video Detail", contractAddress, tokenId] : null,
    getVideo(contract, tokenId),
    {
      suspense,
    }
  );

  useKeepSWRDataLiveAsBlocksArrive(result.mutate);

  return result;
}
