const { ethers } = require("hardhat");
const fs = require("fs-extra");
const ethUtil = require("ethereumjs-util");
const web3 = require("web3");

const SUPPLY_WHITELIST_NONCE = 1;
const SUPPLY_UNSIGNED_JSON = "/signed_whitelists/supply_private_unsigned.json";
const SUPPLY_SIGNED_JSON = "/signed_whitelists/supply_private_signed.json";

const GENESIS_UNSIGNED_JSON = "/signed_whitelists/private_unsigned.json";
const GENESIS_SIGNED_JSON = "/signed_whitelists/private_signed.json";

const MAIN_PRIVATE_UNSIGNED_JSON =
  "/signed_whitelists/main_private_unsigned.json";
const MAIN_PRIVATE_SIGNED_JSON = "/signed_whitelists/main_private_signed.json";

const MAIN_PUBLIC_UNSIGNED_JSON =
  "/signed_whitelists/main_public_unsigned.json";
const MAIN_PUBLIC_SIGNED_JSON = "/signed_whitelists/main_public_signed.json";

const RESERVE_UNSIGNED_JSON = "/signed_whitelists/reserve_unsigned.json";
const RESERVE_SIGNED_JSON = "/signed_whitelists/reserve_signed.json";

const AIRDROP_LIST = "/snapshotJson/snapshotOrder.json";
const AIRDROP_LIST_FORMATTED = "/snapshotJson/snapshotOrderFormatted.json";


// SIGN Main Mints
// run this with npm run sign-private-list
// async function mainSignMainMintLists() {
//   const args = require("minimist")(process.argv.slice(2));
//   await require("dotenv");
//   const provider = new ethers.providers.JsonRpcProvider(
//     process.env.RPC_ENDPOINT,
//   );
//   const wallet = new ethers.Wallet(`${process.env.PRIVATE_KEY}`, provider);

//   // Private list signing
//   const privateUnsigned = JSON.parse(
//     await fs.readFileSync(
//       `${process.cwd()}${MAIN_PRIVATE_UNSIGNED_JSON}`,
//     ),
//   );
//   const privateSignedPath = `${process.cwd()}${MAIN_PRIVATE_SIGNED_JSON}`;
//   let signedPrivateJson = {};
//   for (let address of privateUnsigned) {
//     let lowerCaseAddr = address.toLowerCase();
//     console.log("error", lowerCaseAddr);
//     const message = web3.utils.soliditySha3(lowerCaseAddr, 1);
//     const signature = await wallet.signMessage(ethers.utils.arrayify(message));
//     const { v, r, s } = ethUtil.fromRpcSig(signature);
//     signedPrivateJson[lowerCaseAddr] = {
//       whitelistNonce: 1,
//       messageHash: message,
//       v,
//       r,
//       s,
//     };
//   }
//   await fs.writeFile(privateSignedPath, JSON.stringify(signedPrivateJson, null, 2));
//   console.log("Signed Private lists. 📿");

//   const publicUnsigned = JSON.parse(
//     await fs.readFileSync(
//       `${process.cwd()}${MAIN_PUBLIC_UNSIGNED_JSON}`,
//     ),
//   );
//   const publicSignedPath = `${process.cwd()}${MAIN_PUBLIC_SIGNED_JSON}`;
//   let signedPublicJson = {};
//   for (let address of publicUnsigned) {
//     let lowerCaseAddr = address.toLowerCase();
//     const message = web3.utils.soliditySha3(lowerCaseAddr, 2);
//     const signature = await wallet.signMessage(ethers.utils.arrayify(message));
//     const { v, r, s } = ethUtil.fromRpcSig(signature);
//     signedPublicJson[lowerCaseAddr] = {
//       whitelistNonce: 2,
//       messageHash: message,
//       v,
//       r,
//       s,
//     };
//   }
//   await fs.writeFile(publicSignedPath, JSON.stringify(signedPublicJson, null, 2));
//   console.log("Signed Public lists. 📿");
// }



async function generateAirdropList() {
  const args = require("minimist")(process.argv.slice(2));
  await require("dotenv");
  // Private list signing
  const snapshotList = JSON.parse(
    await fs.readFileSync(
      `${process.cwd()}${AIRDROP_LIST}`,
    ),
  );
  const addressses = [];
  const quantity = [];
  for (let address of snapshotList) {
    if (!addressses.length) {
      addressses.push(address);
      quantity.push(1);
    }
    else {
      let lastAddress = addressses[addressses.length - 1];
      if (address === lastAddress) {
        let lastQty = quantity[addressses.length - 1];
        lastQty += 1;
        quantity[addressses.length - 1] = lastQty;
      } else {
        addressses.push(address);
        quantity.push(1);
      }
    }
  }
  const formattedAirdropJson  = {
    addressses,
    quantity
  }

  const airdropFormattedPath = `${process.cwd()}${AIRDROP_LIST_FORMATTED}`;
  await fs.writeFile(airdropFormattedPath, JSON.stringify(formattedAirdropJson, null, 2));
  console.log("Signed all lists. 📿");
}


generateAirdropList()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
