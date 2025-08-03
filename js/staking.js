// js/staking.js
import { web3, lpToken, kjcToken, getCurrentAccount, getStakingContract } from './wallet.js';

export async function loadStakeData() {
  const contract = getStakingContract();
  const user = await getCurrentAccount(); // ✅ ต้อง await

  const staked = await contract.methods.stakedAmount(user).call();
  const reward = await contract.methods.claimableReward(user).call();
  const referrer = await contract.methods.referrerOf(user).call();
  const refReward = await contract.methods.referralReward(user).call();

  document.getElementById("stakedLP").innerText = `🪙 LP ที่คุณ Stake: ${web3.utils.fromWei(staked)}`;
  document.getElementById("claimableReward").innerText = `💎 รางวัลที่เคลมได้: ${web3.utils.fromWei(reward)} KJC`;
  document.getElementById("referrerInfo").innerText = `👤 ผู้นำแนะนำของคุณ: ${referrer}`;
  document.getElementById("refReward").innerText = `💰 รางวัล Referral: ${web3.utils.fromWei(refReward)} KJC`;
}

export async function stakeLP() {
  const contract = getStakingContract();
  const user = await getCurrentAccount(); // ✅ ต้อง await
  const amount = document.getElementById("lpAmount").value;

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    alert("❌ กรุณากรอกจำนวน LP ที่ถูกต้อง");
    return;
  }

  const weiAmount = web3.utils.toWei(amount, 'ether');

  try {
    // ✅ 1. Approve
    await lpToken.methods.approve(contract.options.address, weiAmount).send({ from: user });

    // ✅ 2. Stake
    await contract.methods.stakeLP(weiAmount).send({ from: user });

    alert("✅ Stake LP สำเร็จ");
  } catch (err) {
    console.error("❌ Stake ล้มเหลว:", err);
    alert("❌ ไม่สามารถ Stake LP ได้: " + err.message);
  }
}

export async function claimStakingReward() {
  const contract = getStakingContract();
  const user = await getCurrentAccount(); // ✅ ต้อง await
  try {
    await contract.methods.claimStakingReward().send({ from: user });
    alert("🎉 เคลมรางวัลสำเร็จ");
  } catch (err) {
    alert("❌ เคลมรางวัลล้มเหลว: " + err.message);
  }
}

export async function withdrawLP() {
  const contract = getStakingContract();
  const user = await getCurrentAccount(); // ✅ ต้อง await
  try {
    await contract.methods.withdrawLP().send({ from: user });
    alert("🔓 ถอน LP สำเร็จ");
  } catch (err) {
    alert("❌ ถอน LP ล้มเหลว: " + err.message);
  }
}
