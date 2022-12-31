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
    try {
      const provider = await getProviderOrSigner();
      const stakeContract = new Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_CONTRACT_ABI,
        provider
      );
      const balance = await stakeContract.getStakedBalance();
      const newBalance = balance.toString();
      setBalanceOfBluedogToken(newBalance);
      console.log(balanceOfBluedogToken);
      document.getElementById("tokenAmount").innerHTML = balanceOfBluedogToken;
    } catch (err) {
      console.error(err);
      setBalanceOfBluedogToken(zero);
      document.getElementById("tokenAmount").innerHTML = balanceOfBluedogToken;
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
      document.getElementById("timeToStake").innerHTML = timeUntilUnlock;
    } catch (err) {
      console.error(err);
      setTimeUntilUntlock(zero);
      document.getElementById("timeToStake").innerHTML = timeUntilUnlock;
    }
  };

  /*   const getClaimableToken = async () => {
    try {
      const provider = await getProviderOrSigner();
      const stakeContract = new Contract(
        STAKING_CONTRACT_ADDRESS,
        STAKING_CONTRACT_ABI,
        provider
      );
      const reward = await stakeContract.getTokensToBeClaimed();
      setTokensToBeClaimed(reward);
      document.getElementById("rewardToken").innerHTML = tokensToBeClaimed;
    } catch (err) {
      console.error(err);
      setTokensToBeClaimed(zero);
      document.getElementById(tokensToBeClaimed);
    }
  }; */

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
      document.getElementById("stakeAmount").innerHTML = "";
      document.getElementById("stakeTime").innerHTML = "";
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
      await getStakedTokenBalance();
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
      //getClaimableToken();
    }
  });

  return (
    <div style={{ display: "flex-col" }}>
      <h1>Staking APP</h1>
      <label className="label">
        Amount to Stake:
        <input className="input" type="text" id="stakeAmount" />
      </label>

      <label className="label">
        Time to Stake in Days
        <input className="input" type="text" id="stakeTime" />
      </label>
      <button onClick={connectWallet} className={styles.button}>
        Connect your wallet
      </button>
      <button onClick={stake} className={styles.button} id="stake">
        Stake your token
      </button>
      <button onClick={claimTokens} className={styles.button} id="claim">
        Claim your rewards
      </button>
      <button onClick={withdrawToken} className={styles.button} id="withdraw">
        Withdraw your token
      </button>
      <button
        onClick={getStakedTokenBalance}
        className={styles.button}
        id="getBalance"
      >
        Get balance
      </button>
      <div id="tokenAmount">Amount of Tokens</div>
      <div id="timeToStake">Time until unlock</div>
      <div id="rewardToken">Tokens to claim</div>
    </div>
  );
}
