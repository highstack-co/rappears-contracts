// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./NFTVault.sol";

contract NFTPay {

    RapPearsNft nft;

    constructor(address _nft) {
        nft = RapPearsNft(_nft);
    }

    function payForNft(address who, uint256 amount) public payable {
        
        uint256[] memory ret = nft.mintNewNft{value: msg.value}(amount);
        uint256 length = ret.length;

        for (uint256 i; i < length;) {
            nft.transferFrom(address(this), who, ret[i]);
            unchecked { ++i; }
        }

    }
}