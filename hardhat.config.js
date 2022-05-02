require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-truffle5");
require('@openzeppelin/hardhat-upgrades');

// const { ethers, upgrades } = require("hardhat");

require("dotenv").config();
const fs = require("fs-extra");
const mnemonic_test = require("./secrets.json").mnemonic_test;
const infura_ropsten_url = require("./secrets.json").infura_ropsten_url;
const infura_rinkeby_url = require("./secrets.json").infura_rinkeby_url;
const bsc_testnet_url = require("./secrets.json").bsc_testnet_url;
const bsc_url = require("./secrets.json").bsc_url;
const ethscan_api_key = require("./secrets.json").ethscan_api_key;
const bscscan_api_key = require("./secrets.json").bscscan_api_key;
const infura_eth_main_url = require("./secrets.json").infura_eth_main_url;

const privatekey = process.env.PRIVATE_KEY;
const mnemonic = process.env.MNEMONIC;

// Deploy NFT Contract...
// yarn deploy-genesis-nft-eth-main OR
// npx hardhat deploy-nft --network ethMain
task("deploy-nft", "Deploy NFT").setAction(async (args, hre) => {

  const [deployer] = await ethers.getSigners();
  console.log("Account: " + deployer.address);

  // Deploy...
  const RappearsNFTs = await ethers.getContractFactory("RappearsNFTs");
  console.log("Deploying NFTs...");
  const rappearsNfts = await upgrades.deployProxy(RappearsNFTs, [
    "RappearsNFTs",
    "RAPPEARS",
  ]);
  console.log("just deployed...", rappearsNfts)

  await rappearsNfts
    .setMintPrice(`${6e16}`);

  // Set URLs
  await rappearsNfts
    .connect(deployer)
    .setBaseURI(
      "ipfs://QmWYt6XezHy7PBwCYEHpWZYfSemjGwWMpHSxRmXVfSFEvQ/",
      0,
      5000,
    );

  // Print extra info...
  console.log(
    `To verify: npx hardhat verify ${rappearsNfts.address} --network {network}`,
  );
});

module.exports = {
  mocha: {
    timeout: 60000,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.2",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: "0.8.4",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: "0.6.6",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: "0.5.16",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
      {
        version: "0.5.0",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    ],
  },

  etherscan: {
    apiKey: ethscan_api_key,
    // apiKey: bscscan_api_key,
  },

  networks: {
    bscTestnet: {
      url: bsc_testnet_url,
      chainId: 97,
      gasPrice: 20000000000,
      gas: 2100000,
      accounts: { mnemonic: mnemonic_test },
    },
    bsc: {
      url: bsc_url,
      chainId: 56,
      gasPrice: 20000000000,
      gas: 2100000,
      accounts: [`${privatekey}`],
    },
    ropsten: {
      url: infura_ropsten_url,
      chainId: 3,
      gasPrice: 20000000000,
      gas: 2100000,
      accounts: { mnemonic: `${mnemonic}` },
    },
    rinkeby: {
      url: infura_rinkeby_url,
      chainId: 4,
      gasPrice: 10e9,
      gas: 2100000,
      accounts: { mnemonic: `${mnemonic}` },
    },
    // BEFORE USING THIS, CHECK GAS PRICES
    ethMain: {
      url: infura_eth_main_url,
      chainId: 1,
      gasPrice: 42e9,
      gas: 2100000,
      accounts: [`${privatekey}`],
    },
  },
};

// HELPERS

// Prints a label and an address...
const _printAddress = (label, address) => {
  console.log(label.padEnd(35), address);
};
