import Head from "next/head";
import styles from "../styles/Home.module.css";
import { BigNumber, Contract, providers, utils } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  STAKING_CONTRACT_ADDRESS,
  STAKING_CONTRACT_ABI,
} from "../constants";

export default function Home() {
  const zero = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  const [balanceOfBluedogToken, setBalanceOfBluedogToken] = useState(zero);
  const [timeUntilUnlock, setTimeUntilUntlock] = useState(zero);
  const web3ModalRef = useRef();
  const ref = useRef(null);
  const ref1 = useRef(null);

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 31337) {
      window.alert("Change the network to Goerli");
      throw new ERROR("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getStakedTokenBalance = async () => {
    console.log("hey");
    try {
      const provider = await getProviderOrSigner();
      const stakeContract = new Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_CONTRACT_ABI,
        provider
      );
      const balance = await stakeContract.getStakedBalance();
      const newBalance = balance.toString();
      setBalanceOfBluedogToken(balance);
      console.log(balanceOfBluedogToken);
      document.getElementById(
        "tokenAmount"
      ).innerHTML = `You have ${balanceOfBluedogToken} staked`;
      getTimeUntilWithdraw();
      getClaimableToken();
    } catch (err) {
      console.error(err);
      setBalanceOfBluedogToken(zero);
      document.getElementById(
        "tokenAmount"
      ).innerHTML = `You have ${balanceOfBluedogToken} staked`;
    }
  };

  const getTimeUntilWithdraw = async () => {
    try {
      const provider = await getProviderOrSigner();
      const stakeContract = new Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_CONTRACT_ABI,
        provider
      );
      const time = await stakeContract.withdrawTimeLeft();
      setTimeUntilUntlock(time);
      document.getElementById(
        "timeToStake"
      ).innerHTML = `Time until Withdraw: ${timeUntilUnlock} seconds`;
    } catch (err) {
      console.error(err);
      setTimeUntilUntlock(zero);
      document.getElementById(
        "timeToStake"
      ).innerHTML = `Time until Withdraw: ${timeUntilUnlock} seconds`;
    }
  };

  const getClaimableToken = async () => {
    try {
      const provider = await getProviderOrSigner();
      const stakeContract = new Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_CONTRACT_ABI,
        provider
      );
      const reward = await stakeContract.getTokensToBeClaimed();

      const newRewared = reward.toString();
      console.log(newRewared);
      setTokensToBeClaimed(reward);
      document.getElementById(
        "rewardToken"
      ).innerHTML = `You can claim ${tokensToBeClaimed} doggy tokens`;
    } catch (err) {
      console.error(err);
      setTokensToBeClaimed(zero);
      document.getElementById(tokensToBeClaimed);
      document.getElementById(
        "rewardToken"
      ).innerHTML = `You can claim ${tokensToBeClaimed} tokens`;
    }
  };

  const stake = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const stakeContract = new Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_CONTRACT_ABI,
        signer
      );
      const amount = document.getElementById("stakeAmount").value;
      const newAmount = Number(amount);
      console.log(typeof newAmount, newAmount);
      const time = document.getElementById("stakeTime").value;
      const tx = await stakeContract.stake(amount, time);
      console.log("i am here");
      setLoading(true);
      await tx.wait();
      setLoading(false);
      document.getElementById("stakeAmount").innerText = "";
      document.getElementById("stakeTime").innerText = "";

      ref.current.value = "";
      ref1.current.value = "";

      await getStakedTokenBalance();
    } catch (err) {
      console.error(err);
    }
  };

  const claimTokens = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const stakeContract = new Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_CONTRACT_ABI,
        signer
      );
      const tx = await stakeContract.claim();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      getStakedTokenBalance();
    } catch (err) {
      console.error(err);
    }
  };

  const withdrawToken = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const stakeContract = new Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_CONTRACT_ABI,
        signer
      );
      const tx = await stakeContract.withdraw();
      setLoading(true);
      await tx.wait();
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "localhost",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getStakedTokenBalance();
      getTimeUntilWithdraw();
      getClaimableToken();
    }
  });

  return (
    <div
      style={{
        display: "flex-col",
        color: "white",
      }}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>Staking APP</h1>
        <button onClick={connectWallet} className={styles.connect}>
          Connect your wallet
        </button>
      </div>
      <div className={styles.form}>
        <div className={styles.form1}>
          <label className={styles.label}>
            <div>Amount to Stake:</div>
            <input ref={ref} className="input" type="text" id="stakeAmount" />
          </label>

          <label className={styles.label}>
            <div>time to stake in days</div>
            <input ref={ref1} className="input" type="text" id="stakeTime" />
          </label>
        </div>
        <div className={styles.form1}>
          <button onClick={stake} className={styles.button} id="stake">
            Stake your token
          </button>
          <button onClick={claimTokens} className={styles.button} id="claim">
            Claim your rewards
          </button>
          <button
            onClick={withdrawToken}
            className={styles.button}
            id="withdraw"
          >
            Withdraw your token
          </button>
          <button
            onClick={getStakedTokenBalance}
            className={styles.button}
            id="getBalance"
          >
            Get balance
          </button>
        </div>
        <div className={styles.list}>
          <div className={styles.result} id="tokenAmount">
            Amount of Tokens
          </div>
          <div className={styles.result} id="timeToStake">
            Time until unlock
          </div>
          <div className={styles.result} id="rewardToken">
            Tokens to claim
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        Register for our Newletter or Buy more BlueDog Token
      </div>
    </div>
  );
}
