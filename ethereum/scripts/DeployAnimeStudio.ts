import { ethers } from "hardhat";
import { AnimeStudio__factory, AnimeStudioFT__factory } from "../typechain-types";

const CONVERSION_RATIO = 50;


async function main() {
  const key = process.env.PRIVATE_KEY;
  console.log({ key: `0x${key}` });
  if (!key) {
    console.log("NO PRIVATE KEY FOUND!!");
    return;
  }

  const wallet = new ethers.Wallet(ethers.utils.hexlify(`0x${key}`));
  const signer = wallet.connect(ethers.provider);
  
  const ERC20TokenFactory = new AnimeStudioFT__factory(signer);
  const ERC20AnimeVideoToken = await ERC20TokenFactory.deploy();

  await ERC20AnimeVideoToken.deployed();

  const MINTER_ROLE = await ERC20AnimeVideoToken.MINTER_ROLE();
  
  const AnimeVideoFactory = new AnimeStudio__factory(signer);
  const AnimeVideoContract = await AnimeVideoFactory.deploy(ERC20AnimeVideoToken.address, CONVERSION_RATIO);
  await AnimeVideoContract.deployed();

  const accessTx1 = await ERC20AnimeVideoToken.grantRole(
    MINTER_ROLE,
    AnimeVideoContract.address
  );
  await accessTx1.wait();

  console.log("Anime Video Contract address:", AnimeVideoContract.address);
  console.log("Anime Video Token address:", ERC20AnimeVideoToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
