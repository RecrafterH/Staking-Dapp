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
// bluedog 0x5FbDB2315678afecb367f032d93F642f64180aa3
// stake 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
// npx hardhat verify --contract "contracts/BlueDog.sol:Bluedog" --network goerli 0x45125F75C57d377E9cBc472Fe46E591b55814472 "21000000"
