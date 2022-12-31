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
};
// bluedog 0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
// stake 0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
// npx hardhat verify --contract "contracts/BlueDog.sol:Bluedog" --network goerli 0x45125F75C57d377E9cBc472Fe46E591b55814472 "21000000"
