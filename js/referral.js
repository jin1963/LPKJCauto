// js/referral.js

import { stakingContract, getCurrentAccount } from './wallet.js';
import { getFriendlyErrorMessage } from './utils.js';

export async function registerReferrer() {
  const refInput = document.getElementById("refAddress").value.trim();
  const account = getCurrentAccount();
  if (!refInput || !web3.utils.isAddress(refInput)) {
    alert("❌ กรุณาใส่ Address ผู้นำแนะนำให้ถูกต้อง");
    return;
  }
  if (refInput.toLowerCase() === account.toLowerCase()) {
    alert("❌ คุณไม่สามารถแนะนำตัวเองได้");
    return;
  }
  try {
    await stakingContract.methods.setReferrer(refInput).send({ from: account });
    alert("✅ สมัครผู้นำแนะนำสำเร็จ");
  } catch (err) {
    alert(getFriendlyErrorMessage(err));
  }
}

export async function claimReferralReward() {
  const account = getCurrentAccount();
  try {
    await stakingContract.methods.claimReferralReward().send({ from: account });
    alert("✅ เคลมรางวัล Referral สำเร็จแล้ว");
  } catch (err) {
    alert(getFriendlyErrorMessage(err));
  }
}

export async function showReferralLink() {
  const account = getCurrentAccount();
  const baseUrl = window.location.origin + window.location.pathname;
  const refLink = `${baseUrl}?ref=${account}`;
  document.getElementById("refLink").href = refLink;
  document.getElementById("refLink").innerText = refLink;
}
