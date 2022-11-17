import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import useTokenBalance from "../hooks/useTokenBalance";
import { parseBalance } from "../util";

type TokenBalanceProps = {
  tokenAddress: string;
  symbol: string;
};

const TokenBalance = ({ tokenAddress, symbol }: TokenBalanceProps) => {
  const { account } = useWeb3React<Web3Provider>();
  const { data } = useTokenBalance(account, tokenAddress);

  return (
    <p className="flex items-center py-2 pr-4 pl-3 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
      {`${symbol} Balance`}: {parseBalance(data ?? 0)}
    </p>
  );
};

export default TokenBalance;
