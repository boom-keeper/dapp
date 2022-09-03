// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @notice config of the registry
 * @dev only used in params and return values
 * @member blockCountPerTurn number of blocks each oracle has during their turn to
 * @member checkGasLimit gas limit when checking for upkeep
 * @member maxPerformGas max executeGas allowed for an upkeep on this registry
 * @member registrar address of the registrar contract
 */
struct Config {
    uint24 blockCountPerTurn;
    uint32 checkGasLimit;
    uint32 maxPerformGas;
    address registrar;
}

/**
 * @notice state of the registry
 * @dev only used in params and return values
 * @member nonce used for ID generation
 * @member numUpkeeps total number of upkeeps on the registry
 */
struct State {
    uint32 nonce;
    uint256 numUpkeeps;
}

interface IKeeperRegistryBase {
    function registerUpkeep(
        address target,
        uint32 gasLimit,
        address admin,
        bytes calldata checkData
    ) external returns (uint256 id);

    function performUpkeep(uint256 id, bytes calldata performData) external returns (bool success);

    function cancelUpkeep(uint256 id) external;

    function setUpkeepGasLimit(uint256 id, uint32 gasLimit) external;

    function getUpkeep(uint256 id)
        external
        view
        returns (
            address target,
            uint32 executeGas,
            bytes memory checkData,
            uint96 balance,
            address lastKeeper,
            address admin,
            uint64 maxValidBlocknumber,
            uint96 amountSpent
        );

    function getActiveUpkeepIDs(uint256 startIndex, uint256 maxCount) external view returns (uint256[] memory);

    function getKeeperInfo(address query)
        external
        view
        returns (
            address payee,
            bool active,
            uint96 balance
        );

    function getState()
        external
        view
        returns (
            State memory,
            Config memory,
            address[] memory
        );
}

/**
 * @dev The view methods are not actually marked as view in the implementation
 * but we want them to be easily queried off-chain. Solidity will not compile
 * if we actually inherit from this interface, so we document it here.
 */
interface IKeeperRegistry is IKeeperRegistryBase {
    function checkUpkeep(uint256 upkeepId, address from)
        external
        view
        returns (bytes memory performData, uint256 gasLimit);
}

interface IKeeperRegistryExecutable is IKeeperRegistryBase {
    function checkUpkeep(uint256 upkeepId, address from) external returns (bytes memory performData, uint256 gasLimit);
}
