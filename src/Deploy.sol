// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./NFTVault.sol";

contract Deploy {
    constructor() {
                                            // weth, fee, lockup time
        RapPearsNft nft = new RapPearsNft(0xc778417E063141139Fce010982780140Aa0cD5Ab, 1000, 30 days, "name", "symbol"); // for ropsten

        nft.transferOwnership(0xb75A08E82A1Bf0FccEb89bbdAf9AAE00BE8CA29a);
    }

}
