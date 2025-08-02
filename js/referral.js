// js/referral.js

import { web3, stakingContract, getCurrentAccount, kjcToken } from './wallet.js';
import { getFriendlyErrorMessage, displayWeiToToken, getTokenDecimals } from './utils.js';
import { kjcAddress } from './config.js';

// ✅ สมัคร referrer
export async function registerReferrer() {
  const account = getCurrentAccount();
  if (!account) return alert("❌ กรุณาเชื่อมต่อกระเป๋า");

  const refAddress = document.getElementById("refAddress").value.trim();

  if (!web3.utils.isAddress(refAddress)) {
    return alert("❌ กรุณากรอก Address ให้ถูกต้อง");
  }

  try {
    await stakingContract.methods.setReferrer(refAddress).send({ from: account });
    alert("✅ ลงทะเบียนผู้แนะนำเรียบร้อย");
    showReferrerInfo();
  } catch (err) {
    alert(getFriendlyErrorMessage(err));
  }
}

// ✅ แสดงลิงก์แนะนำ
export function showReferralLink() {
  const account = getCurrentAccount();
  const refLinkElement = document.getElementById("refLink");

  if (!account) {
    refLinkElement.innerText = "❌ ยังไม่เชื่อมต่อ";
    refLinkElement.href = "#";
    return;
  }

  const baseUrl = window.location.origin + window.location.pathname;
  const link = `${baseUrl}?ref=${account}`;
  refLinkElement.innerText = "📎 ลิงก์แนะนำของคุณ";
  refLinkElement.href = link;
}

// ✅ คัดลอกลิงก์
export function copyRefLink() {
  const account = getCurrentAccount();
  if (!account) return alert("❌ กรุณาเชื่อมต่อกระเป๋า");

  const link = `${window.location.origin + window.location.pathname}?ref=${account}`;
  navigator.clipboard.writeText(link)
    .then(() => alert("📋 คัดลอกลิงก์แล้ว"))
    .catch(() => alert("❌ ไม่สามารถคัดลอกลิงก์ได้"));
}

// ✅ เคลมรางวัลแนะนำ
export async function claimReferralReward() {
  const account = getCurrentAccount();
  if (!account) return alert("❌ กรุณาเชื่อมต่อกระเป๋า");

  try {
    await stakingContract.methods.claimReferralReward().send({ from: account });
    alert("✅ เคลมรางวัลแนะนำเรียบร้อย");
    loadReferralData();
  } catch (err) {
    alert(getFriendlyErrorMessage(err));
  }
}

// ✅ โหลดข้อมูล referral reward
export async function loadReferralData() {
  const account = getCurrentAccount();
  const refRewardElement = document.getElementById("refReward");
  if (!account) {
    refRewardElement.innerText = "-";
    return;
  }

  try {
    const rewardWei = await stakingContract.methods.referralReward(account).call();
    const decimals = await getTokenDecimals(kjcToken);
    const reward = displayWeiToToken(rewardWei, decimals);
    refRewardElement.innerText = `${reward} KJC`;
  } catch (e) {
    console.warn("❌ โหลดข้อมูล referral ไม่ได้", e);
    refRewardElement.innerText = "-";
  }
}

// ✅ แสดง referrer ที่เราผูกไว้
export async function showReferrerInfo() {
  const account = getCurrentAccount();
  const yourReferrerElement = document.getElementById("referrerInfo");
  if (!account) {
    yourReferrerElement.innerText = "-";
    return;
  }

  try {
    const ref = await stakingContract.methods.referrerOf(account).call();
    yourReferrerElement.innerText =
      ref === "0x0000000000000000000000000000000000000000" ? "❌ ไม่มีผู้นำแนะนำ" : ref;
  } catch (e) {
    console.warn("❌ ไม่สามารถโหลดข้อมูลผู้นำแนะนำ", e);
    yourReferrerElement.innerText = "-";
  }
}
