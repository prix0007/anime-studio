// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./IAnimeSudioERC20.sol";

import "./AnimeStudioERC721.sol";

contract AnimeStudio {
    struct VideoDetails {
        address creator;
        string ipfsVideo;
        string ipfsVideoMetadata;
        uint256 price;
    }

    AnimeStudioERC721 animeStudioNFT;
    IAnimeStudioERC20 animeStudioToken;

    uint256 public conversionRatio;

    // Each Token Id maps to the access roles mapping
    // Accesses are : 0 -> No Access, 1 -> View Access, ...
    mapping(uint256 => mapping(address => uint8)) private _videoAccess;

    // Each tokenId is associated with a object which lists the video details
    mapping(uint256 => VideoDetails) private _videoDetails;

    uint256 public totalVideos;

    // Events
    event VideoAdded(address creator, uint256 price, uint256 tokenId);
    event VideoAccessBuy(address buyer, uint256 price);
    event VideoAccessGranted(address creator, address grantedAddress);
    event VideoAccessRevoked(address creator, address revokedAddress);

    constructor(address _animeStudioToken, uint256 _conversionRatio) {
        animeStudioNFT = new AnimeStudioERC721();
        animeStudioToken = IAnimeStudioERC20(_animeStudioToken);
        conversionRatio = _conversionRatio;
    }

    // Modifying Functions

    function addVideo(
        string memory _ipfsVideo,
        string memory _ipfsVideoMetadata,
        uint256 _price
    ) external returns (uint256 tokenId) {
        // Mint the NFT to the caller
        uint256 _tokenId = animeStudioNFT.safeMint(
            msg.sender,
            _ipfsVideoMetadata
        );

        VideoDetails memory details = VideoDetails(
            msg.sender,
            _ipfsVideo,
            _ipfsVideoMetadata,
            _price
        );

        _videoDetails[_tokenId] = details;
        totalVideos++;

        tokenId = _tokenId;

        emit VideoAdded(msg.sender, _price, _tokenId);
    }

    function _giveVideoAccess(uint256 _tokenId, address _receiverAddress)
        internal
        virtual
    {
        _videoAccess[_tokenId][_receiverAddress] = 1;

        emit VideoAccessGranted(msg.sender, _receiverAddress);
    }

    function _revokeVideoAccess(uint256 _tokenId, address _revokedAddress)
        internal
        virtual
    {
        _videoAccess[_tokenId][_revokedAddress] = 0;

        emit VideoAccessRevoked(msg.sender, _revokedAddress);
    }

    function grantVideoAccess(uint256 _tokenId, address _grantedAddress)
        external
    {
        // Check msg.sender is the owner of the _tokenId in animeStudioToken
        require(
            animeStudioNFT.ownerOf(_tokenId) == msg.sender,
            "Only token owner can grant access!!"
        );
        _giveVideoAccess(_tokenId, _grantedAddress);
    }

    function revokeVideoAccess(uint256 _tokenId, address _revokeAddress)
        external
    {
        // Check msg.sender is the owner of the _tokenId in animeStudioToken
        require(
            animeStudioNFT.ownerOf(_tokenId) == msg.sender,
            "Only token owner can revoke access!!"
        );
        _revokeVideoAccess(_tokenId, _revokeAddress);
    }

    function buyTokens() external payable {
        uint256 newTokens = msg.value * conversionRatio;
        animeStudioToken.mint(msg.sender, newTokens);
    }

    function buyVideoAccess(uint256 _tokenId) external {
        require(animeStudioNFT.exists(_tokenId), "Token doesn't exists!!");

        VideoDetails memory video = _videoDetails[_tokenId];

        require(
            animeStudioToken.balanceOf(msg.sender) >= video.price,
            "Must have atleast that much tokens!!"
        );

        require(
            animeStudioToken.allowance(msg.sender, address(this)) >=
                video.price,
            "Not enough allowance to buy video access."
        );

        animeStudioToken.transferFrom(msg.sender, address(this), video.price);

        _giveVideoAccess(_tokenId, msg.sender);

        emit VideoAccessBuy(msg.sender, video.price);
    }

    // View Functions
    function hasAccess(uint256 _tokenId, address _granteeAddress)
        public
        view
        returns (uint8)
    {
        require(animeStudioNFT.exists(_tokenId), "Token doesn't Exists!!");
        return _videoAccess[_tokenId][_granteeAddress];
    }

    function retrieveVideoDetails(uint256 _tokenId)
        public
        view
        returns (
            address creator,
            string memory videoIpfs,
            string memory metadataIpfs,
            uint256 price
        )
    {
        require(
            hasAccess(_tokenId, msg.sender) > 0 ||
                animeStudioNFT.ownerOf(_tokenId) == msg.sender,
            "Requester doesn't have access to video."
        );
        VideoDetails memory video = _videoDetails[_tokenId];
        videoIpfs = video.ipfsVideo;
        metadataIpfs = video.ipfsVideoMetadata;
        price = video.price;
        creator = video.creator;
    }

    function getVideosInRange(uint256 _fromTokenId, uint256 _toTokenId)
        public
        view
        returns (
            address[] memory,
            string[] memory,
            uint256[] memory
        )
    {
        require(
            _fromTokenId >= 0 &&
                _fromTokenId < totalVideos &&
                _toTokenId > 0 &&
                _toTokenId <= totalVideos &&
                _toTokenId > _fromTokenId,
            "Must be in range of total Video's Available"
        );

        uint256 _idxLength = _toTokenId - _fromTokenId;
        uint256[] memory prices = new uint256[](_idxLength);
        address[] memory creators = new address[](_idxLength);
        string[] memory ipfsNftMetadata = new string[](_idxLength);

        uint256 outputIdx = 0;
        for (uint256 idx = _fromTokenId; idx < _toTokenId; idx++) {
            VideoDetails memory video = _videoDetails[idx];

            prices[outputIdx] = video.price;
            creators[outputIdx] = video.creator;
            ipfsNftMetadata[outputIdx] = video.ipfsVideoMetadata;
            outputIdx++;
        }

        return (creators, ipfsNftMetadata, prices);
    }

    // NFT Address
    function nftAddress() public view returns (address) {
        return address(animeStudioNFT);
    }

    // Token Address
    function tokenAddress() public view returns (address) {
        return address(animeStudioToken);
    }
}
