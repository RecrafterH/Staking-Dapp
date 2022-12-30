const { expect } = require("chai");
const { ethers } = require("hardhat");

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
  });
});
