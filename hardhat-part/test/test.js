const { expect } = require("chai");
const { network, ethers } = require("hardhat");

describe("Testing BlueDog", () => {
  it("mints 1000 token and sends them to the owner", async () => {
    const BlueDogContract = await ethers.getContractFactory("Bluedog");
    const bluedogContract = await BlueDogContract.deploy(1000);
    await bluedogContract.deployed();
    const [deployer] = await ethers.getSigners(0);
    //console.log(deployer.address);
    const balance = await bluedogContract.balanceOf(deployer.address);
    expect(balance.toString()).to.equal("1000");
  });

  it("transfers token to other addresses", async () => {
    const BlueDogContract = await ethers.getContractFactory("Bluedog");
    const bluedogContract = await BlueDogContract.deploy(1000);
    await bluedogContract.deployed();
    const [deployer, signer1] = await ethers.getSigners();
    await bluedogContract.transfer(signer1.address, 100);
    const balance = await bluedogContract.balanceOf(signer1.address);
    expect(balance.toString()).to.equal("100");
  });
});

describe("StakindDapp tests", function () {
  let BlueDogContract, bluedogContract, StakingContract, stakingContract;
  beforeEach(async () => {
    BlueDogContract = await ethers.getContractFactory("Bluedog");
    bluedogContract = await BlueDogContract.deploy(100000000);
    await bluedogContract.deployed();

    StakingContract = await ethers.getContractFactory("StakingDapp");
    stakingContract = await StakingContract.deploy(bluedogContract.address);
    await stakingContract.deployed();

    bluedogContract.transfer(stakingContract.address, 5000000);
  });
  describe("StakingDapp functions", () => {
    it("tracks the staked balance", async () => {
      await stakingContract.stake(1000, 100);
      const [deployer] = await ethers.getSigners(0);
      const balance = await stakingContract.getStakedBalance();
      console.log(balance);
      const total = await stakingContract.totalStaked();
      expect(balance.toString()).to.equal("1000");
      expect(total.toString()).to.equal("1000");
      const withdrawTimeLeft = await stakingContract.withdrawTimeLeft();
      expect((withdrawTimeLeft / 60 / 60 / 24).toString()).to.equal("100");
    });
    it("cant claim token if I havent staked", async () => {
      expect(stakingContract.claim()).to.be.reverted;
    });

    it("The user can claim his rewards", async () => {
      await stakingContract.stake(1000, 700);
      await stakingContract.addRewards(100000);

      await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 365]);
      await network.provider.request({ method: "evm_mine", params: [] });
      const rewards = await stakingContract.claim();
      const [deployer] = await ethers.getSigners(0);

      const balance = await stakingContract.getStakedBalance();
      expect(balance.toString()).to.equal("2000");
    });
    it("wont lets the user claim more rewards after the deadline ends", async () => {
      await stakingContract.stake(1000, 10);
      await stakingContract.addRewards(100000);
      await network.provider.send("evm_increaseTime", [200 * 60 * 60 * 24]);
      await network.provider.request({ method: "evm_mine", params: [] });
      await stakingContract.claim();
      const balance = await stakingContract.getStakedBalance();
      expect(balance.toString()).to.equal("1027");

      await network.provider.send("evm_increaseTime", [20 * 60 * 60 * 24]);
      await network.provider.request({ method: "evm_mine", params: [] });
      await stakingContract.claim();
      const balance1 = await stakingContract.getStakedBalance();
      expect(balance1.toString()).to.equal("1027");
    });
    it("cant withdraw before the deadline is reached", async () => {
      await stakingContract.stake(1000, 100);
      expect(stakingContract.withdraw()).to.be.reverted;
    });
    it("lets the user withdraw after the time pasts", async () => {
      await stakingContract.stake(1000, 1);
      await network.provider.send("evm_increaseTime", [2 * 60 * 60 * 24]);
      await network.provider.request({ method: "evm_mine", params: [] });
      await stakingContract.withdraw();
      const [deployer] = await ethers.getSigners(0);
      const balance = await stakingContract.getStakedBalance();
      expect(balance.toString()).to.equal("0");
    });
    it("gives the user the claimable balance", async () => {
      await stakingContract.stake(1000, 100);
      await stakingContract.addRewards(200000);

      await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 365]);
      await network.provider.request({ method: "evm_mine", params: [] });
      const reward = await stakingContract.getTokensToBeClaimed();
      expect(reward.toString()).to.equal("547");
    });
    it("adds rewards to the contract", async () => {
      await stakingContract.addRewards(10000);
      const balance = await stakingContract.totalRewardAmount();
      expect(balance.toString()).to.equal("10000");
    });
    it("calculated the apy", async function () {
      await stakingContract.stake(2000, 100);
      await stakingContract.addRewards(200000);
      const apy = await stakingContract.apy();
      expect(apy.toString()).to.equal("100");
    });
    it("only owner can withdrawAll", async () => {
      await stakingContract.stake(2000, 100);
      await stakingContract.addRewards(200000);
      const [user1, user2] = await ethers.getSigners();
      expect(stakingContract.connect(user2).withdrawAll()).to.revertedWith(
        "Not the owner"
      );
    });
    it("owner can withdrawAll", async () => {
      await stakingContract.stake(2000, 100);
      await stakingContract.addRewards(200000);
      const [deployer] = await ethers.getSigners(0);
      let balance = await bluedogContract.balanceOf(deployer.address);
      expect(balance.toString()).to.equal("95000000");
      await stakingContract.withdrawAll();
      balance = await bluedogContract.balanceOf(deployer.address);
      expect(balance.toString()).to.equal("100000000");
    });
    it("let more people stake", async () => {
      await stakingContract.stake(2000, 100);
      await stakingContract.addRewards(200000);
      const [deployer, user1, user2] = await ethers.getSigners();
      bluedogContract.transfer(user1.address, 50000);
      bluedogContract.transfer(user2.address, 50000);
      await stakingContract.connect(user1).stake(2000, 100);
      await stakingContract.connect(user2).stake(4000, 100);
      const apy = await stakingContract.apy();
      expect(apy.toString()).to.equal("25");
    });
    it("let more people stake", async () => {
      await stakingContract.stake(2000, 200);
      await stakingContract.addRewards(200000);
      const [deployer, user1, user2] = await ethers.getSigners();
      bluedogContract.transfer(user1.address, 50000);
      await stakingContract.connect(user1).stake(2000, 100);
      await network.provider.send("evm_increaseTime", [60 * 60 * 24 * 100]);
      await network.provider.request({ method: "evm_mine", params: [] });
      await stakingContract.connect(user1).withdraw();
      expect(stakingContract.withdraw()).to.reverted;
    });
    it("keeps track of different wallets", async () => {
      await stakingContract.stake(4000, 200);
      await stakingContract.addRewards(200000);
      const [deployer, user1, user2] = await ethers.getSigners();
      bluedogContract.transfer(user1.address, 50000);
      await stakingContract.connect(user1).stake(1000, 100);
      const balance1 = await stakingContract.getStakedBalance();
      const balance2 = await stakingContract
        .connect(user1.address)
        .getStakedBalance();
      expect(balance1.toString()).to.equal("4000");
      expect(balance2.toString()).to.equal("1000");
    });
  });
});
