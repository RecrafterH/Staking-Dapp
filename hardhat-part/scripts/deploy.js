const { ethers } = require("hardhat");

const main = async function () {
  const BlueDogContract = await ethers.getContractFactory("Bluedog");
  const bluedogContract = await BlueDogContract.deploy(21000000);
  await bluedogContract.deployed();

  console.log("BlueDogContract deployed to: ", bluedogContract.address);

  const StakingDappContract = await ethers.getContractFactory("StakingDapp");
  const stakingdappContract = await StakingDappContract.deploy(
    bluedogContract.address
  );
  await stakingdappContract.deployed();

  console.log("StakingDappContract deployed to: ", stakingdappContract.address);

  const tx = await bluedogContract.transfer(
    stakingdappContract.address,
    10000000
  );
  const tx1 = await bluedogContract.transfer(
    "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    100000
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
