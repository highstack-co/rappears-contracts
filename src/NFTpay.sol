// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./NFTVault.sol";
import "./utils/owner.sol";

contract NFTPay is Owner {

    RapPearsNft nft;

    constructor(address _nft) {
        nft = RapPearsNft(_nft);
    }

    function payForNft(uint256 amount) public payable {
        
        nft.mintNewNft{value: msg.value}(amount);

    }

    function transferOut(address who, uint256 id) public onlyOwner {
        nft.transferFrom(address(this), who, id);
    }
}