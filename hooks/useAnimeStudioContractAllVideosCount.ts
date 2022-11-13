import { BigNumber } from "ethers";
import useSWR from "swr";
import type { AnimeStudio } from "../contracts/types";
import useAnimeStudioContract from "./useAnimeStudioContract";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";

function getTokenBalance(contract: AnimeStudio) {
  return async (_: string, address: string) => {
    const totalVideos = await contract.totalVideos();
    return totalVideos;
  };
}

export default function useAnimeStudioAllVideosCount(
  contractAddress: string,
  suspense = false
) {
  const contract = useAnimeStudioContract(contractAddress);

  const shouldFetch = typeof contractAddress === "string" && !!contract;

  const result = useSWR(
    shouldFetch ? ["Total Videos", contractAddress] : null,
    getTokenBalance(contract),
    {
      suspense,
    }
  );

  useKeepSWRDataLiveAsBlocksArrive(result.mutate);

  return result;
}
