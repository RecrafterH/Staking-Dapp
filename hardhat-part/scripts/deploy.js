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
// bluedog 0xdc95Ce17396E2015d2177eDcf786e735eA87eAC1
// stake 0x39a845E380Bd4250fFac145e0AeeddaB5B93C653
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
// npx hardhat verify --contract "contracts/BlueDog.sol:Bluedog" --network goerli 0x45125F75C57d377E9cBc472Fe46E591b55814472 "21000000"
