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
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
