import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { ClockLoader } from "react-spinners";
import useAnimeStudioContract from "../hooks/useAnimeStudioContract";
import { parseBalance } from "../util";
import Button from "./Button";

type TokenBalanceProps = {
  contractAddress: string;
};

const BuyTokens = ({ contractAddress }: TokenBalanceProps) => {
  const { account } = useWeb3React<Web3Provider>();
  const contract = useAnimeStudioContract(contractAddress);

  const [currentRatio, setCurrentRatio] = useState("");
  useEffect(() => {
    (async () => {
      const ratio = await contract.conversionRatio();
      setCurrentRatio(ratio.toString());
    })();
  }, [contract]);

  const [amount, setAmount] = useState("");

  const [isLoading, setLoading] = useState(false);

  const handleBuyTokens = async () => {
    const amountEth = ethers.utils.parseEther(amount);
    console.log(amountEth.toString());
    setLoading(true);

    const tx = await contract.buyTokens({value: amountEth.toString()});
    await tx.wait();

    setLoading(false);
  };

  return (
    <>
      <div className="flex-col">
        <p>Current Conversion Ratio: 1ETH = {currentRatio} ANST</p>
        {isLoading ? (
          <>
            <ClockLoader color="#000" />
          </>
        ) : (
          <div className="flex">
            <input
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
              }}
              type="number"
              className="block p-4 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter a amount of ETH you want to buy tokens for. 0.1 ETH, 0.2, ..."
            />
            <Button name="Buy Tokens" onClick={handleBuyTokens} />
          </div>
        )}
      </div>
    </>
  );
};

export default BuyTokens;
