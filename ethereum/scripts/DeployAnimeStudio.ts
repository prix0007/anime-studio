import { ethers } from "hardhat";
import {
  AnimeStudio__factory,
  AnimeStudioFT__factory,
  AnimeStudioERC721__factory,
} from "../typechain-types";

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

  const walletBalance = await signer.getBalance();

  console.log({ walletBalance });
  if (walletBalance.lt(100)) {
    console.log("Not enough balance  current Balance: ", walletBalance);
    return;
  }

  const ERC20TokenFactory = new AnimeStudioFT__factory(signer);
  const ERC20AnimeVideoToken = await ERC20TokenFactory.attach(
    "0x579Fa7789B958a18a40f07855dE6c82e643f4F63"
  );

  await ERC20AnimeVideoToken.deployed();

  const ERC721VideoFactory = new AnimeStudioERC721__factory(signer);
  const ERC721AnimeVideoNFT = await ERC721VideoFactory.deploy();

  await ERC721AnimeVideoNFT.deployed();

  const MINTER_ROLE = await ERC20AnimeVideoToken.MINTER_ROLE();

  const ADMIN_ROLE = await ERC721AnimeVideoNFT.ADMIN_ROLE();
  console.log({ MINTER_ROLE, ADMIN_ROLE });

  const AnimeVideoFactory = new AnimeStudio__factory(signer);
  const AnimeVideoContract = await AnimeVideoFactory.deploy(
    ERC20AnimeVideoToken.address,
    ERC721AnimeVideoNFT.address,
    CONVERSION_RATIO
  );

  await AnimeVideoContract.deployed();

  const accessTx1 = await ERC20AnimeVideoToken.grantRole(
    MINTER_ROLE,
    AnimeVideoContract.address
  );
  await accessTx1.wait();

  const accessTx2 = await ERC721AnimeVideoNFT.grantRole(
    ADMIN_ROLE,
    AnimeVideoContract.address
  );
  await accessTx2.wait();

  console.log("Anime Video Contract address:", AnimeVideoContract.address);
  console.log("Anime Video NFT address:", ERC721AnimeVideoNFT.address);
  console.log("Anime Video Token address:", ERC20AnimeVideoToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
