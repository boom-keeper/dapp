// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

contract BangkokContract is KeeperCompatibleInterface {
    event Withdraw(uint256 ammount, string name, address sender);
    event ShortageAmt(uint256 ammount, string name, address sender);
    event ProvideAmt(uint256 ammount, string name, address sender);

    uint256 private constant MIN_AMT = 500;
    uint256 private constant AVG_AMT = 1000;
    uint256 private amt;
    string name;

    constructor() {
        name = "BANGKOK";
        amt = AVG_AMT;
    }

    function getAmt()
        external
        view
        returns (
            uint256 _amt,
            uint256 _min_amt,
            uint256 _avg_amt
        )
    {
        _amt = amt;
        return (_amt, MIN_AMT, AVG_AMT);
    }

    function withdraw(uint256 _amt) external payable {
        amt = amt - _amt;
        emit Withdraw(_amt, name, msg.sender);
    }

    function setShortage() external payable returns (uint256 _amt) {
        amt = MIN_AMT - 1;
        _amt = amt;
        emit ShortageAmt(_amt, name, msg.sender);
        return _amt;
    }

    /**
        calldata ==> 0xe3d0d652
    */
    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        upkeepNeeded = amt < MIN_AMT;
        performData = abi.encode(msg.sender);
        return (upkeepNeeded, performData);
    }

    function performUpkeep(
        bytes calldata /** performData **/
    ) external override {
        // address memory checkAddress = abi.decode(performData, (address));

        if (amt < MIN_AMT) {
            amt = AVG_AMT;
            emit ProvideAmt(amt, name, msg.sender);
        }
    }
}
