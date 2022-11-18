import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { ClockLoader } from "react-spinners";
import { toast } from "react-toastify";
import useAnimeStudioContract from "../hooks/useAnimeStudioContract";
import useCurrentContracts from "../hooks/useCurrentContracts";
import Button from "./Button";

const BuyTokens = () => {
  const activeContracts = useCurrentContracts();
  const contract = useAnimeStudioContract(activeContracts.main);

  const [currentRatio, setCurrentRatio] = useState("");
  useEffect(() => {
    (async () => {
      if (contract) {
        const ratio = await contract.conversionRatio();
        setCurrentRatio(ratio?.toString() || "");
      }
    })();
  }, [contract]);

  const [amount, setAmount] = useState("");

  const [isLoading, setLoading] = useState(false);

  const handleBuyTokens = async () => {
    let amountEth;
    try {
      amountEth = ethers.utils.parseEther(amount);
      setLoading(true);
    } catch (e) {
      console.log(e.message);
      toast(e.message, { type: "error" });
      return;
    }

    try {
      const tx = await contract.buyTokens({ value: amountEth.toString() });
      await tx.wait();
    } catch (e) {
      toast(e.message, { type: "error" });
    }
    setLoading(false);
    setAmount("");
  };

  return (
    <>
      <div className="flex-col block p-6 rounded-lg shadow-lg bg-white max-w-sm">
        <div>
          <p className="text-gray-900 text-sm leading-tight font-medium mb-2">
            Current Conversion Ratio: 1ETH = {currentRatio} ANST
          </p>
          {amount && (
            <p className="text-gray-900 text-sm leading-tight font-medium mb-2">
              For {amount} of ETH you will get{" "}
              {parseFloat(currentRatio) * parseFloat(amount)} ANST Tokens
            </p>
          )}
        </div>
        {isLoading ? (
          <div className="flex align-middle items-center justify-center">
            <ClockLoader color="#000" />
          </div>
        ) : (
          <div className="flex flex-col">
            <input
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
              }}
              type="number"
              className="block p-4 mb-1 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="ETH you want to buy tokens for. 0.1 ETH, 0.2, ..."
            />
            <Button name="Buy ANST Tokens" onClick={handleBuyTokens} />
          </div>
        )}
      </div>
    </>
  );
};

export default BuyTokens;
