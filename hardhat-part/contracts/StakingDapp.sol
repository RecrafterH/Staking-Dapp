// SPDX-Licnese-Identifier: MIT;
pragma solidity ^0.8.9;

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

    constructor(address _bluedog) {
        bluedog = IBluedog(_bluedog);
    }

    mapping(address => uint256) public balances;
    mapping(address => uint256) public deadlines;
    mapping(address => uint256) public startingClaim;

    uint256 apyPerSecond = 1;

    event Stake(address indexed sender, uint256 amount);

    function stake(uint256 amount, uint256 time) public {
        require(amount >= bluedog.balanceOf(msg.sender), "Not enough token");
        uint256 timestamp = block.timestamp;
        startingClaim[msg.sender];
        uint256 deadline = block.timestamp + time * 60 * 60 * 24;
        deadlines[msg.sender] = deadline;
        bool success = bluedog.transfer(address(this), amount);
        require(success, "Transaction failed");
        balances[msg.sender] += amount;
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
        require(balances[msg.sender] > 0);
        _;
    }

    function withdraw() public withdrawalDeadlineReached {
        claim();
        uint256 individualBalance = balances[msg.sender];
        balances[msg.sender] = 0;
        bool success = bluedog.transferFrom(
            address(this),
            msg.sender,
            individualBalance
        );
        require(success, "Withdrawl failed");
    }

    function claim() public tokenStaked {
        uint256 stakedAmount = balances[msg.sender];
        uint256 timeStaked = block.timestamp - startingClaim[msg.sender];
        uint256 rewardAmount = stakedAmount * (timeStaked * apyPerSecond);
        balances[msg.sender] += rewardAmount;
    }
}