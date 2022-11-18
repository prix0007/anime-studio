import { useWeb3React } from "@web3-react/core";
import { useMemo } from "react";

export type ActiveContract = {
  main: string;
  token: string;
  nft: string;
};

export const contracts = {
  5: {
    main: "0x8FFc11998a9f121c0E7c744742Ed106BddbFfe01",
    token: "0xC53e500D109Eb0051e8CC3e55a6d935415f93F69",
    nft: "",
  },
  1402: {
    main: "0x547F2777219dC09F2eD8640ddf6104cA7fAF05F1",
    nft: "0x3562835A4606712b217630500735bC791Bd7477D",
    token: "0x579Fa7789B958a18a40f07855dE6c82e643f4F63",
  },
};

export default function useCurrentContracts(): ActiveContract | null {
  const { library, account, chainId } = useWeb3React();

  return useMemo(() => {
    if (!library || !chainId) {
      return null;
    }

    try {
      return contracts[chainId];
    } catch (error) {
      console.error("Failed To Get Contracts", error);

      return null;
    }
  }, [chainId, library, account]);
}
