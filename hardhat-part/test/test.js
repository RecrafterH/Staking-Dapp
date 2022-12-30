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
    bluedogContract = await BlueDogContract.deploy(100000);
    await bluedogContract.deployed();

    StakingContract = await ethers.getContractFactory("StakingDapp");
    stakingContract = await StakingContract.deploy(bluedogContract.address);
    await stakingContract.deployed();

    bluedogContract.transfer(stakingContract.address, 50000);
  });
  describe("StakingDapp functions", () => {
    it("tracks the staked balance", async () => {
      await stakingContract.stake(1000, 100);
      const [deployer] = await ethers.getSigners(0);
      const balance = await stakingContract.getStakedBalance(deployer.address);
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
      await stakingContract.stake(1000, 100);

      await network.provider.send("evm_increaseTime", [365 * 60 * 60 * 24]);
      await network.provider.request({ method: "evm_mine", params: [] });
      const rewards = await stakingContract.claim();
      const [deployer] = await ethers.getSigners(0);
      console.log(rewards.toString());
      const balance = await stakingContract.getStakedBalance(deployer.address);
      expect(balance.toString()).to.equal("1500");
    });
    it("cant withdraw before the deadline is reached", async () => {
      await stakingContract.stake(1000, 100);
      expect(stakingContract.withdraw()).to.be.reverted;
    });
    it("lets the user withdraw after the time pasts", async () => {
      await stakingContract.stake(1000, 100);
      await network.provider.send("evm_increaseTime", [101 * 60 * 60 * 24]);
      await network.provider.request({ method: "evm_mine", params: [] });
      await stakingContract.withdraw();
      const [deployer] = await ethers.getSigners(0);
      const balance = await stakingContract.getStakedBalance(deployer.address);
      expect(balance.toString()).to.equal("0");
    });
  });
});