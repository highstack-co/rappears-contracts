//// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "ds-test/test.sol";
import "../NFTVault.sol";
import "./weth.sol";
import "./utils/cheats.sol";
import "./utils/console.sol";

contract ContractTest is DSTest {

    RapPearsNft nft;
    WETH9 weth;
    CheatCodes cheats = CheatCodes(HEVM_ADDRESS);

    function setUp() public {
        weth = new WETH9();
        nft = new RapPearsNft(
            address(weth),
            1000, //dev fee
            30 days, //lockup period
            "test",
            "test"
        );
    }

    function purchase() public {
        cheats.deal(address(this), 100 ether);

        nft.setPublicMint(true);

        nft.setSupplyCap(100);
    }

    function testYield() public {

        purchase();

        nft.mintNewNft{value: 1e17}(1);

        nft.mintNewNft{value: 1e17}(1);

       assertEq( 9e16, nft.withdrawableById(1));
    }

    function testLockUpAndWithdrawl() public {
        purchase();

        cheats.warp(1); // set to 1 to avoid 0 errors, in practive will always be greater than T = 0

        nft.mintNewNft{value: 1e17}(1);

        nft.mintNewNft{value: 1e17}(1);

        // should fail before we lock up
        cheats.expectRevert(bytes(""));

        nft.withdrawFromId(1, 8e16);

        nft.lockUp(1);
        
        //should fail if not enough time has elapsed
        cheats.expectRevert(bytes(""));

        nft.withdrawFromId(1, 8e16);

        cheats.warp(40 days);

        nft.withdrawFromId(1, 8e16);

        assertEq(weth.balanceOf(address(this)), 8e16);

    }

    function testBundleWithdrawlAndList() public {
        purchase();

        cheats.warp(1); // set to 1 to avoid 0 errors, in practive will always be greater than T = 0

        nft.mintNewNft{value: 1e17}(1);

        nft.mintNewNft{value: 1e17}(1);

        nft.mintNewNft{value: 1e17}(1);

        assertEq(
            nft.tokensByAddress(address(this), 2),
            3
        );

        nft.lockUp(1);

        nft.lockUp(2);

        nft.lockUp(3);

        cheats.warp(40 days);

        nft.bundleWithdraw(); // will fail if reverts

        assertEq(weth.balanceOf(address(this)), 180000000000000000);

    }
    
    function testDevFees() public {
        purchase();

        nft.mintNewNft{value: 1e17}(1);

        nft.mintNewNft{value: 1e17}(1);

        nft.mintNewNft{value: 1e17}(1);

        assertEq(nft.devBalance(), ((1e17 * 3) * 1000) / 10000);
    }
}
