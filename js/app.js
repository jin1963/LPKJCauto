// js/app.js
import { connectWallet, getCurrentAccount } from './wallet.js';
import { loadStakeData, stakeLP, claimStakingReward, withdrawLP } from './staking.js';
import { registerReferrer, showReferralLink, claimReferralReward } from './referral.js';

async function initStakingInfo() {
  await loadStakeData();
  await showReferralLink();
}

window.connectWallet = async () => {
  const connected = await connectWallet();
  if (connected) {
    const addr = await getCurrentAccount();
    document.getElementById("walletAddress").innerText = `✅ ${addr.substring(0, 6)}...${addr.slice(-4)}`;
    await initStakingInfo();
  }
};

window.stakeLP = async () => {
  await stakeLP();
  await initStakingInfo();
};

window.claimStakingReward = async () => {
  await claimStakingReward();
  await initStakingInfo();
};

window.claimReferralReward = async () => {
  await claimReferralReward();
  await initStakingInfo();
};

window.withdrawLP = async () => {
  await withdrawLP();
  await initStakingInfo();
};

window.registerReferrer = async () => {
  await registerReferrer();
  await initStakingInfo();
};

window.copyRefLink = async () => {
  const link = document.getElementById("refLink").href;
  await navigator.clipboard.writeText(link);
  alert("📋 คัดลอกลิงก์เรียบร้อยแล้ว!");
};
