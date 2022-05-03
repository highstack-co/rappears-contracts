const { expectRevert, time } = require("@openzeppelin/test-helpers");
const { assertion } = require("@openzeppelin/test-helpers/src/expectRevert");
const { assert } = require("chai");
const ethUtil = require("ethereumjs-util");
const { revert } = require("./utils");
require("chai").use(require("chai-as-promised")).should();

contract("RewardPool", () => {
  let deployer, alice, bob, tom, rappearsNft, rewardPool;
  const provider = ethers.provider;

  beforeEach(async () => {
    const RappearsNFT = await ethers.getContractFactory("RappearsNFTs");
    const RewardPool = await ethers.getContractFactory("HighstackRewardPool");
    [deployer, alice, bob, tom] = await ethers.getSigners();
    rappearsNft = await upgrades.deployProxy(RappearsNFT, [
      "RappearsNFT",
      "RAPPEARS",
    ]);
    await rappearsNft.connect(deployer).setPause(false);
    rewardPool = await upgrades.deployProxy(RewardPool, [rappearsNft.address]);
  });

  it("Rejects adding balance if no stakers", async () => {
    await expect(
      deployer.sendTransaction({
        to: rewardPool.address,
        value: ethers.utils.parseEther("10"),
      }),
    ).to.eventually.rejectedWith(revert`No one to distribute rewards to :(`);
  });

  it("Adds balance works for single user", async () => {
    await rappearsNft
      .connect(alice)
      .mint(3, { value: ethers.utils.parseEther("0.18") });
    assert.equal(Number(await rappearsNft.balanceOf(alice.address)), 3);

    const aliceNftIds = await rappearsNft
      .tokensOfOwner(alice.address)
      .then((ids) => ids.map((id) => Number(id)));


    await expect(
      rewardPool.connect(alice).registerForRewards([...aliceNftIds, 5]),
    ).to.eventually.be.rejectedWith(Error);

    await rewardPool.connect(alice).registerForRewards(aliceNftIds.slice(0, 2));
    await deployer.sendTransaction({
      to: rewardPool.address,
      value: ethers.utils.parseEther("10"),
    });

    assert.equal(
      Number(await rewardPool.calcHarvestTotForUser(alice.address)),
      Number(ethers.utils.parseEther("10")),
    );

    const aliceOldBal = await provider.getBalance(alice.address);
    await rewardPool.connect(alice).harvestRewards();
    assert.approximately(
      Number(aliceOldBal) + Number(10e18),
      Number(await provider.getBalance(alice.address)),
      Number(1e16), // 0.0 precision
    );

    assert.equal(
      Number(await rewardPool.calcHarvestTotForUser(alice.address)),
      Number(0),
    );
  });
  it("Adds balance works for multiple users", async () => {
    await rappearsNft
      .connect(alice)
      .mint(4, { value: ethers.utils.parseEther("0.24") });
    assert.equal(Number(await rappearsNft.balanceOf(alice.address)), 4);

    await rappearsNft
      .connect(bob)
      .mint(2, { value: ethers.utils.parseEther("0.12") });
    assert.equal(Number(await rappearsNft.balanceOf(bob.address)), 2);

    const aliceNftIds = await rappearsNft
      .tokensOfOwner(alice.address)
      .then((ids) => ids.map((id) => Number(id)));

    const bobNftIds = await rappearsNft
      .tokensOfOwner(bob.address)
      .then((ids) => ids.map((id) => Number(id)));

    await rewardPool.connect(alice).registerForRewards(aliceNftIds);

    await deployer.sendTransaction({
      to: rewardPool.address,
      value: ethers.utils.parseEther("10"),
    });

    await rewardPool.connect(bob).registerForRewards(bobNftIds);

    assert.equal(
      Number(await rewardPool.calcHarvestTotForUser(alice.address)),
      Number(ethers.utils.parseEther("10")),
    );

    assert.equal(
      Number(await rewardPool.calcHarvestTotForUser(bob.address)),
      Number(ethers.utils.parseEther("0")),
    );

    await deployer.sendTransaction({
      to: rewardPool.address,
      value: ethers.utils.parseEther("6"),
    });

    assert.equal(
      Number(await rewardPool.calcHarvestTotForUser(alice.address)),
      Number(ethers.utils.parseEther("14")),
    );
    assert.equal(
      Number(await rewardPool.calcHarvestTotForUser(bob.address)),
      Number(ethers.utils.parseEther("2")),
    );

    // Test Alice Harvest
    const aliceOldBal = await provider.getBalance(alice.address);
    await rewardPool.connect(alice).harvestRewards();
    assert.approximately(
      Number(aliceOldBal) + Number(14e18),
      Number(await provider.getBalance(alice.address)),
      Number(1e16),
    );

    assert.equal(
      Number(await rewardPool.calcHarvestTotForUser(alice.address)),
      Number(0),
    );
    assert.equal(
      Number(await rewardPool.calcHarvestTotForUser(bob.address)),
      Number(2e18),
    );

    await deployer.sendTransaction({
      to: rewardPool.address,
      value: ethers.utils.parseEther("12"),
    });

    assert.equal(
      Number(await rewardPool.calcHarvestTotForUser(alice.address)),
      Number(8e18),
    );
    assert.equal(
      Number(await rewardPool.calcHarvestTotForUser(bob.address)),
      Number(6e18),
    );

    // Test Bob Harvest
    const bobOldBal = await provider.getBalance(bob.address);
    await rewardPool.connect(bob).harvestRewards();
    assert.approximately(
      Number(bobOldBal) + Number(6e18),
      Number(await provider.getBalance(bob.address)),
      Number(1e17),
    );

    assert.equal(
      Number(await rewardPool.calcHarvestTotForUser(alice.address)),
      Number(ethers.utils.parseEther("8")),
    );
    assert.equal(
      Number(await rewardPool.calcHarvestTotForUser(bob.address)),
      Number(ethers.utils.parseEther("0")),
    );

  });
});
