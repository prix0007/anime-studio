import ANIMESTUDIO_ABI from "../contracts/AnimeStudio.json";
import type { AnimeStudio } from "../contracts/types";
import useContract from "./useContract";

export default function useAnimeStudioContract(contractAddress?: string) {
  return useContract<AnimeStudio>(contractAddress, ANIMESTUDIO_ABI.abi);
}
