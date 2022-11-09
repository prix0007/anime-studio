// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IAnimeStudioERC20 is IERC20 {
    function mint(address to, uint256 amount) external;
}