import { BSC_CHAIN_ID } from './config.js';

let web3;
let account;
let stakingContract;

export async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

      // 🔁 ถ้าไม่ใช่ BSC (Chain ID 56) ให้สลับอัตโนมัติ
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

      // โหลด contract หลัก
      const { contractABI, contractAddress } = await import('./config.js');
      stakingContract = new web3.eth.Contract(contractABI, contractAddress);

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

async function switchToBSC() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x38' }] // 0x38 = 56 decimal
    });
    return true;
  } catch (switchError) {
    // ถ้ายังไม่เคยเพิ่ม BSC เข้า wallet
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

export function getCurrentAccount() {
  return account;
}

export function getStakingContract() {
  return stakingContract;
}
