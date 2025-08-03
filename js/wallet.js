// js/wallet.js

import { 
  BSC_CHAIN_ID, 
  contractABI, 
  contractAddress, 
  lpTokenAddress, 
  kjcAddress, 
  erc20ABI 
} from './config.js';

let web3;
let account;
let stakingContract;
let lpToken;
let kjcToken;

// ✅ เชื่อมต่อ Wallet และสลับ Chain อัตโนมัติ
export async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);

    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

      if (parseInt(currentChainId, 16) !== BSC_CHAIN_ID) {
        const switched = await switchToBSC();
        if (!switched) {
          alert("❌ กรุณาเชื่อมต่อ BNB Chain (Chain ID: 56) ด้วยตนเอง");
          return false;
        }
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      account = accounts[0];
      window.web3 = web3;

      // ✅ โหลด Smart Contract
      stakingContract = new web3.eth.Contract(contractABI, contractAddress);

      // ✅ โหลด Token Contracts
      lpToken = new web3.eth.Contract(erc20ABI, lpTokenAddress);
      kjcToken = new web3.eth.Contract(erc20ABI, kjcAddress);

      return true;
    } catch (error) {
      console.error("❌ ไม่สามารถเชื่อมต่อกระเป๋า:", error);
      alert("❌ ไม่สามารถเชื่อมต่อกระเป๋า: " + error.message);
      return false;
    }
  } else {
    alert("⚠️ กรุณาติดตั้ง MetaMask หรือ Bitget Wallet ก่อนใช้งาน");
    return false;
  }
}

// 🔁 สลับ Chain ไปยัง BSC
async function switchToBSC() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x38' }]
    });
    return true;
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x38',
            chainName: 'BNB Smart Chain',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'BNB',
              decimals: 18
            },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com']
          }]
        });
        return true;
      } catch (addError) {
        console.error("❌ ไม่สามารถเพิ่ม BNB Chain:", addError);
        return false;
      }
    } else {
      console.error("❌ ไม่สามารถสลับเครือข่าย:", switchError);
      return false;
    }
  }
}

// 🔍 คืนค่า Account และ Contract ให้ใช้ภายนอก
export function getCurrentAccount() {
  return account;
}
