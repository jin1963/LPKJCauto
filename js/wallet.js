// js/wallet.js

import {
  contractAddress,
  lpTokenAddress,
  kjcAddress,
  contractABI,
  erc20ABI,
  BSC_CHAIN_ID
} from './config.js';

import { getTokenDecimals } from './utils.js';

let web3;
let account = null;
let stakingContract;
let lpToken;
let kjcToken;
let lpTokenDecimals;
let kjcTokenDecimals;

function getCurrentAccount() {
  return account;
}

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      account = accounts[0];

      const chainId = await web3.eth.getChainId();
      if (chainId !== parseInt(BSC_CHAIN_ID, 16)) {
        alert("กรุณาเชื่อม BNB Chain ก่อน (Chain ID: 56)");
        return false;
      }

      stakingContract = new web3.eth.Contract(contractABI, contractAddress);
      lpToken = new web3.eth.Contract(erc20ABI, lpTokenAddress);
      kjcToken = new web3.eth.Contract(erc20ABI, kjcAddress);

      // ดึงทศนิยม
      lpTokenDecimals = await getTokenDecimals(lpToken);
      kjcTokenDecimals = await getTokenDecimals(kjcToken);

      // แสดงผลในหน้า
      document.getElementById("walletAddress").innerText =
        `🟢 เชื่อมแล้ว: ${account.substring(0, 6)}...${account.slice(-4)}`;

      return true;
    } catch (err) {
      alert("❌ การเชื่อมต่อกระเป๋าล้มเหลว");
      console.error(err);
      return false;
    }
  } else {
    alert("กรุณาติดตั้ง MetaMask หรือ Bitget Wallet");
    return false;
  }
}

// ✅ Export ตัวแปรให้ module ใช้ได้
export {
  connectWallet,
  getCurrentAccount,
  stakingContract,
  lpToken,
  kjcToken,
  web3,
  lpTokenDecimals,
  kjcTokenDecimals
};

// ✅ ผูกกับ window เพื่อให้เรียกจาก HTML ปกติได้
window.connectWallet = connectWallet;
