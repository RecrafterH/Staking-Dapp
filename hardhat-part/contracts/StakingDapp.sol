// SPDX-Licnese-Identifier: MIT;
pragma solidity ^0.8.9;

import "hardhat/console.sol";

interface IBluedog {
    function transfer(address to, uint256 amount) external returns (bool);

    function balanceOf(address account) external view returns (uint256);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

contract StakingDapp {
    IBluedog bluedog;

    uint256 public totalStaked;
    uint256 public totalRewardAmount;
    address public owner;

    constructor(address _bluedog) {
        bluedog = IBluedog(_bluedog);
        owner = msg.sender;
    }

    mapping(address => uint256) public balances;
    mapping(address => uint256) public deadlines;
    mapping(address => uint256) public startingClaim;
    mapping(address => uint256) public stakeTimestamp;

    uint256 public apy;

    event Stake(address indexed sender, uint256 amount);

    function stake(uint256 amount, uint256 time) public {
        require(amount <= bluedog.balanceOf(msg.sender), "Not enough token");
        uint256 timestamp = block.timestamp;
        startingClaim[msg.sender] = timestamp;
        stakeTimestamp[msg.sender] = timestamp;
        uint256 deadline = block.timestamp + time * 60 * 60 * 24;
        deadlines[msg.sender] = deadline;
        bool success = bluedog.transfer(address(this), amount);
        require(success, "Transaction failed");
        balances[msg.sender] += amount;
        totalStaked += amount;
        calculateApy();
        emit Stake(msg.sender, amount);
    }

    function withdrawTimeLeft() public view returns (uint256) {
        if (block.timestamp >= deadlines[msg.sender]) {
            return (0);
        } else {
            return (deadlines[msg.sender] - block.timestamp);
        }
    }

    modifier withdrawalDeadlineReached() {
        uint256 timeRemaining = deadlines[msg.sender];
        require(block.timestamp >= timeRemaining);
        require(balances[msg.sender] > 0);
        _;
    }

    modifier tokenStaked() {
        require(balances[msg.sender] > 0, "No token staked");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function withdraw() public withdrawalDeadlineReached {
        claim();
        uint256 individualBalance = balances[msg.sender];
        balances[msg.sender] = 0;

        bool success = bluedog.transfer(msg.sender, individualBalance);
        require(success, "Withdrawl failed");
    }

    function claim() public tokenStaked {
        console.log("You are in the claim fucntion");
        if (block.timestamp <= deadlines[msg.sender]) {
            uint256 stakedAmount = balances[msg.sender];
            uint256 timeStaked = (block.timestamp - startingClaim[msg.sender]);
            uint256 rewardAmount = ((stakedAmount) * ((timeStaked) * apy)) /
                100 /
                365 /
                24 /
                60 /
                60;
            console.log("Now you ");
            startingClaim[msg.sender] = block.timestamp;
            balances[msg.sender] += rewardAmount;
            totalStaked += rewardAmount;
            calculateApy();
        } else {
            console.log("i am in this part");
            if (startingClaim[msg.sender] < deadlines[msg.sender]) {
                uint256 stakedAmount = balances[msg.sender];
                uint256 timeStaked = (deadlines[msg.sender] -
                    startingClaim[msg.sender]);
                uint256 rewardAmount = ((stakedAmount) * ((timeStaked) * apy)) /
                    100 /
                    365 /
                    24 /
                    60 /
                    60;
                console.log(rewardAmount);
                startingClaim[msg.sender] = block.timestamp;
                balances[msg.sender] += rewardAmount;
                totalStaked += rewardAmount;
                calculateApy();
            }
        }
    }

    function calculateApy() internal {
        if (totalStaked == 0) {
            apy = totalRewardAmount / 1;
        } else {
            apy = totalRewardAmount / totalStaked;
        }
    }

    function addRewards(uint256 amount) external {
        require(amount > 0, "Send more than 0");
        bluedog.transfer(address(this), amount);
        totalRewardAmount += amount;
        calculateApy();
    }

    function withdrawAll() external onlyOwner {
        uint256 balance = bluedog.balanceOf(address(this));
        bool success = bluedog.transfer(msg.sender, balance);
        require(success, "Transaction failed");
    }

    function getStakedBalance() external view returns (uint) {
        return (balances[msg.sender]);
    }

    function getTokensToBeClaimed() public view returns (uint256) {
        if (block.timestamp > deadlines[msg.sender]) {
            if (startingClaim[msg.sender] < deadlines[msg.sender]) {
                uint256 stakedAmount = balances[msg.sender];
                uint256 timeStaked = (deadlines[msg.sender] -
                    startingClaim[msg.sender]);
                uint256 rewardAmount = ((stakedAmount) * ((timeStaked) * apy)) /
                    100 /
                    365 /
                    24 /
                    60 /
                    60;
                return rewardAmount;
            }
        } else {
            uint256 stakedAmount = balances[msg.sender];
            uint256 timeStaked = (block.timestamp - startingClaim[msg.sender]);
            uint256 rewardAmount = ((stakedAmount) * ((timeStaked) * apy)) /
                100 /
                365 /
                24 /
                60 /
                60;
            console.log("Now you ");
            return rewardAmount;
        }
    }

    receive() external payable {}

    fallback() external payable {}
}
