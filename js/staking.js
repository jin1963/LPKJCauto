// js/staking.js
import { web3, lpToken, getCurrentAccount, getStakingContract } from './wallet.js';

export async function loadStakeData() {
  const contract = getStakingContract();
  const user = getCurrentAccount();

  const stakeData = await contract.methods.stakes(user).call();
  const staked = stakeData.amount;

  const reward = await contract.methods.getClaimable(user).call();
  const referrer = await contract.methods.referrerOf(user).call();
  const refReward = await contract.methods.referralReward(user).call();

  document.getElementById("stakedLP").innerText = `🪙 LP ที่คุณ Stake: ${web3.utils.fromWei(staked)}`;
  document.getElementById("claimableReward").innerText = `💎 รางวัลที่เคลมได้: ${web3.utils.fromWei(reward)} KJC`;
  document.getElementById("referrerInfo").innerText = `👤 ผู้นำแนะนำของคุณ: ${referrer}`;
  document.getElementById("refReward").innerText = `💰 รางวัล Referral: ${web3.utils.fromWei(refReward)} KJC`;
}

export async function stakeLP() {
  try {
    const contract = getStakingContract();
    const user = getCurrentAccount();
    const amount = document.getElementById("lpAmount").value;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("❗ โปรดระบุจำนวน LP ที่ถูกต้อง");
      return;
    }

    const decimals = await lpToken.methods.decimals().call();
    const factor = web3.utils.toBN(10).pow(web3.utils.toBN(decimals));
    const weiAmount = web3.utils.toBN(amount).mul(factor);

    // ✅ Approve ก่อน stake
    await lpToken.methods.approve(contract.options.address, weiAmount).send({ from: user });
    await contract.methods.stakeLP(weiAmount).send({ from: user });

    alert("✅ Stake LP สำเร็จ");
    loadStakeData();
  } catch (err) {
    console.error("❌ ผิดพลาด:", err);
    alert("❌ ผิดพลาด: " + err.message);
  }
}

export async function claimStakingReward() {
  try {
    const contract = getStakingContract();
    const user = getCurrentAccount();
    await contract.methods.claimStakingReward().send({ from: user });
    alert("🎉 เคลมรางวัลสำเร็จ");
    loadStakeData();
  } catch (err) {
    alert("❌ เคลมรางวัลไม่สำเร็จ: " + err.message);
  }
}

export async function withdrawLP() {
  try {
    const contract = getStakingContract();
    const user = getCurrentAccount();
    await contract.methods.withdrawLP().send({ from: user });
    alert("🔓 ถอน LP สำเร็จ");
    loadStakeData();
  } catch (err) {
    alert("❌ ถอน LP ไม่สำเร็จ: " + err.message);
  }
}
