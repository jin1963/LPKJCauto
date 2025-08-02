// js/staking.js

import {
  stakingContract,
  lpToken,
  getCurrentAccount,
  lpTokenDecimals,
  kjcTokenDecimals
} from './wallet.js';

import {
  getFriendlyErrorMessage,
  displayWeiToToken,
  toWeiFromInput
} from './utils.js';

// 🔁 Stake LP Token
export async function stakeLP() {
  const account = getCurrentAccount();
  if (!account) {
    alert("❌ กรุณาเชื่อมต่อกระเป๋า");
    return;
  }

  const input = document.getElementById("lpAmount").value.trim();
  if (!input || isNaN(input) || parseFloat(input) <= 0) {
    alert("❌ กรุณากรอกจำนวนที่ต้องการ Stake ให้ถูกต้อง");
    return;
  }

  const amountWei = toWeiFromInput(input, lpTokenDecimals);

  try {
    // ✅ อนุมัติ LP Token
    await lpToken.methods
      .approve(stakingContract.options.address, amountWei)
      .send({ from: account });

    // ✅ Stake
    await stakingContract.methods.stakeLP(amountWei).send({ from: account });

    alert("✅ Stake LP สำเร็จแล้ว!");
    loadStakeData();
  } catch (err) {
    alert(getFriendlyErrorMessage(err));
  }
}

// 🎁 เคลมรางวัล Staking
export async function claimStakingReward() {
  const account = getCurrentAccount();
  if (!account) {
    alert("❌ กรุณาเชื่อมต่อกระเป๋า");
    return;
  }

  try {
    await stakingContract.methods.claimStakingReward().send({ from: account });
    alert("✅ เคลมรางวัลสำเร็จ");
    loadStakeData();
  } catch (err) {
    alert(getFriendlyErrorMessage(err));
  }
}

// 🔓 ถอน LP หลังครบเวลา
export async function withdrawLP() {
  const account = getCurrentAccount();
  if (!account) {
    alert("❌ กรุณาเชื่อมต่อกระเป๋า");
    return;
  }

  try {
    await stakingContract.methods.withdrawLP().send({ from: account });
    alert("✅ ถอน LP สำเร็จแล้ว");
    loadStakeData();
  } catch (err) {
    alert(getFriendlyErrorMessage(err));
  }
}

// 📊 โหลดข้อมูล Stake
export async function loadStakeData() {
  const account = getCurrentAccount();
  if (!account) {
    document.getElementById("stakedLP").innerText = "-";
    document.getElementById("claimableReward").innerText = "-";
    return;
  }

  try {
    const stake = await stakingContract.methods.stakes(account).call();
    const amount = displayWeiToToken(stake.amount, lpTokenDecimals);

    const claimable = await stakingContract.methods.getClaimable(account).call();
    const reward = displayWeiToToken(claimable, kjcTokenDecimals);

    document.getElementById("stakedLP").innerText = `${amount}`;
    document.getElementById("claimableReward").innerText = `${reward}`;
  } catch (e) {
    console.warn("❌ โหลดข้อมูล stake ไม่ได้", e);
    document.getElementById("stakedLP").innerText = "-";
    document.getElementById("claimableReward").innerText = "-";
  }
}
