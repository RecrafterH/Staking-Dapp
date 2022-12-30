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
  beforeEach(async () => {});
});
