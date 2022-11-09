import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { connect } from "http2";

function getRandomArbitrary(min: number, max: number) {
  const random = Math.floor(Math.random() * (max - min) + min);
  return random;
}

import {
  AnimeStudio,
  AnimeStudioERC721,
  AnimeStudioFT,
} from "../typechain-types";

describe("DripERC721 Contract", () => {
  let accounts: SignerWithAddress[];
  let animeStudioContract: AnimeStudio;
  let animeStudioToken: AnimeStudioFT;
  let animeStudioNft: AnimeStudioERC721;

  beforeEach(async () => {
    accounts = await ethers.getSigners();

    const token = await ethers.getContractFactory("AnimeStudioFT");
    animeStudioToken = (await token.deploy()) as AnimeStudioFT;
    await animeStudioToken.deployed();

    const c = await ethers.getContractFactory("AnimeStudio");
    animeStudioContract = (await c.deploy(
      animeStudioToken.address,
      5
    )) as AnimeStudio;
    await animeStudioContract.deployed();

    const MINTER_ROLE = await animeStudioToken.MINTER_ROLE();
    const accessTx1 = await animeStudioToken.grantRole(
      MINTER_ROLE,
      animeStudioContract.address
    );
    await accessTx1.wait();

    const nftAddress = await animeStudioContract.nftAddress();
    const nftFactory = await ethers.getContractFactory("AnimeStudioERC721");
    animeStudioNft = nftFactory.attach(nftAddress) as AnimeStudioERC721;
  });

  describe("Anime Studio", async () => {
    it("should deploy internal NFT contract", async () => {
      const address = await animeStudioContract.nftAddress();
      const tokenAddress = await animeStudioContract.tokenAddress();
      console.log(address);
      console.log(tokenAddress);
      expect(tokenAddress).to.be.eq(animeStudioToken.address);
    });

    it("should mint a video token", async () => {
      const ipfsVid = "ipfsVid";
      const ipfsNftMetadata = "ipfsNftMetadata";
      const price = 1000;

      const tx = await animeStudioContract.addVideo(
        ipfsVid,
        ipfsNftMetadata,
        price
      );
      await tx.wait();

      const ownerOfToken1 = await animeStudioNft.ownerOf(0);
      expect(ownerOfToken1).to.be.eq(accounts[0].address);

      const videoDetails = await animeStudioContract.retrieveVideoDetails(0);
      expect(videoDetails[0]).to.be.eq(accounts[0].address);
      expect(videoDetails[1]).to.be.eq(ipfsVid);
      expect(videoDetails[2]).to.be.eq(ipfsNftMetadata);
      expect(videoDetails[3]).to.be.eq(price);

      const tx1 = await animeStudioContract.grantVideoAccess(
        0,
        accounts[1].address
      );
      await tx1.wait();

      const videoDetails2 = await animeStudioContract
        .connect(accounts[1])
        .retrieveVideoDetails(0);
      expect(videoDetails2[0]).to.be.eq(accounts[0].address);
      expect(videoDetails2[1]).to.be.eq(ipfsVid);
      expect(videoDetails2[2]).to.be.eq(ipfsNftMetadata);
      expect(videoDetails2[3]).to.be.eq(price);
    });

    it("should not be able to mint", async () => {
      expect(
        animeStudioNft.safeMint(accounts[1].address, "Blah")
      ).to.be.revertedWith("AccessControl: account");
    });

    it("should be able to buy token and video access", async () => {
      const decimals = await animeStudioToken.decimals();
      const buyTokensTx = await animeStudioContract.buyTokens({
        value: ethers.utils.parseEther("1"),
      });
      await buyTokensTx.wait();

      const newBalance = await animeStudioToken.balanceOf(accounts[0].address);
      expect(parseInt(ethers.utils.formatUnits(newBalance, decimals))).to.be.eq(
        5
      );

      const etherBalanceContract = await ethers.provider.getBalance(
        animeStudioContract.address
      );
      expect(etherBalanceContract).to.be.eq(ethers.utils.parseEther("1"));

      const ipfsVid = "ipfsVid";
      const ipfsNftMetadata = "ipfsNftMetadata";
      const price = 5000000;

      const tx = await animeStudioContract
        .connect(accounts[1])
        .addVideo(ipfsVid, ipfsNftMetadata, price);
      await tx.wait();

      // expect(
      //   animeStudioContract.connect(accounts[0]).buyVideoAccess(0)
      // ).to.be.revertedWith("Not enough allowance to buy video access.");

      const allowanceTx = await animeStudioToken
        .connect(accounts[0])
        .approve(animeStudioContract.address, price);
      await allowanceTx.wait();

      const allowance = await animeStudioToken.allowance(
        accounts[0].address,
        animeStudioContract.address
      );
      expect(allowance).to.be.eq(price);

      const buyVideoAccessTx = await animeStudioContract
        .connect(accounts[0])
        .buyVideoAccess(0);
      await buyVideoAccessTx.wait();

      const videoDetails = await animeStudioContract
        .connect(accounts[0])
        .retrieveVideoDetails(0);
      expect(videoDetails[0]).to.be.eq(accounts[1].address);
      expect(videoDetails[1]).to.be.eq(ipfsVid);
      expect(videoDetails[2]).to.be.eq(ipfsNftMetadata);
      expect(videoDetails[3]).to.be.eq(price);
    });

    it("should be able to fetch multiple NFT objects.", async () => {
      for (let i = 0; i < 100; ++i) {
        const ipfsHash = (Math.random() + 1).toString(36).substring(2);
        const ipfsNFTMeta = (Math.random() + 1).toString(36).substring(2);
        const price = parseInt(getRandomArbitrary(100, 5000).toString());
        const tx2 = await animeStudioContract.addVideo(
          ipfsHash,
          ipfsNFTMeta,
          price
        );
        await tx2.wait();
      }

      const totalVideos = await animeStudioContract.totalVideos();

      expect(totalVideos).to.be.eq(100);

      const response = await animeStudioContract.getVideosInRange(0, 100);
      expect(response[0].length).to.be.eq(100);


    });
  });
});
