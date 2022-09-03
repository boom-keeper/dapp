// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./KeeperBase.sol";
import "./ConfirmedOwner.sol";
import "./interfaces/IKeeperCompatible.sol";
import "./interfaces/IKeeperRegistry.sol";

/**
 * @notice Registry for adding work for Chainlink Keepers to perform on client
 * contracts. Clients must support the Upkeep interface.
 */
contract KeeperRegistry is ConfirmedOwner, KeeperBase, ReentrancyGuard, Pausable, IKeeperRegistryExecutable {
    using Address for address;
    using EnumerableSet for EnumerableSet.UintSet;

    address private constant ZERO_ADDRESS = address(0);
    address private constant IGNORE_ADDRESS = 0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF;
    bytes4 private constant CHECK_SELECTOR = IKeeperCompatible.checkUpkeep.selector;
    bytes4 private constant PERFORM_SELECTOR = IKeeperCompatible.performUpkeep.selector;
    uint256 private constant PERFORM_GAS_MIN = 2_300;
    uint256 private constant CANCELATION_DELAY = 50;
    uint256 private constant PERFORM_GAS_CUSHION = 5_000;
    uint256 private constant REGISTRY_GAS_OVERHEAD = 80_000;
    uint256 private constant PPB_BASE = 1_000_000_000;
    uint64 private constant UINT64_MAX = 2**64 - 1;

    address[] private s_keeperList;
    EnumerableSet.UintSet private s_upkeepIDs;
    mapping(uint256 => Upkeep) private s_upkeep;
    mapping(address => KeeperInfo) private s_keeperInfo;
    mapping(address => address) private s_proposedPayee;
    mapping(uint256 => bytes) private s_checkData;
    Storage private s_storage;
    // address private s_registrar;

    /**
   * @notice versions:
   * - BoomKeeperRegistry 1.0.0: initial release
   */
    string public constant typeAndVersion = "BoomKeeperRegistry 1.0.0";

    error CannotCancel();
    error UpkeepNotActive();
    error MigrationNotPermitted();
    error UpkeepNotNeeded();
    error NotAContract();
    error OnlyActiveKeepers();
    error KeepersMustTakeTurns();
    error ParameterLengthError();
    error OnlyCallableByOwnerOrAdmin();
    error InvalidPayee();
    error DuplicateEntry();
    error ValueNotChanged();
    error IndexOutOfRange();
    error ArrayHasNoEntries();
    error GasLimitOutsideRange();
    error OnlyCallableByPayee();
    error OnlyCallableByProposedPayee();
    error GasLimitCanOnlyIncrease();
    error OnlyCallableByAdmin();
    // error OnlyCallableByOwnerOrRegistrar();
    error InvalidRecipient();
    error TargetCheckReverted(bytes reason);

    enum MigrationPermission {
        NONE,
        OUTGOING,
        INCOMING,
        BIDIRECTIONAL
    }

    /**
     * @notice storage of the registry, contains a mix of config and state data
     */
    struct Storage {
        uint24 blockCountPerTurn;
        uint32 checkGasLimit;
        uint32 maxPerformGas;
        uint32 nonce; // 2 evm words
    }

    struct Upkeep {
        uint96 balance;
        address lastKeeper; // 1 storage slot full
        uint32 executeGas;
        uint64 maxValidBlocknumber;
        address target; // 2 storage slots full
        uint96 amountSpent;
        address admin; // 3 storage slots full
    }

    struct KeeperInfo {
        address payee;
        uint96 balance;
        bool active;
    }

    struct PerformParams {
        address from;
        uint256 id;
        bytes performData;
        uint256 gasLimit;
    }

    event UpkeepRegistered(uint256 indexed id, uint32 executeGas, address admin);
    event UpkeepPerformed(
        uint256 indexed id,
        bool indexed success,
        address indexed from,
        uint96 payment,
        bytes performData
    );
    event UpkeepCanceled(uint256 indexed id, uint64 indexed atBlockHeight);
    event UpkeepMigrated(uint256 indexed id, uint256 remainingBalance, address destination);
    event UpkeepReceived(uint256 indexed id, uint256 startingBalance, address importedFrom);
    event ConfigSet(Config config);
    event KeepersUpdated(address[] keepers, address[] payees);
    event PaymentWithdrawn(address indexed keeper, uint256 indexed amount, address indexed to, address payee);
    event PayeeshipTransferRequested(address indexed keeper, address indexed from, address indexed to);
    event PayeeshipTransferred(address indexed keeper, address indexed from, address indexed to);
    event UpkeepGasLimitSet(uint256 indexed id, uint96 gasLimit);

    /**
     * @param config registry config settings
     */
    constructor(Config memory config) ConfirmedOwner(msg.sender) {
        setConfig(config);
    }

    // ACTIONS

    /**
     * @notice adds a new upkeep
     * @param target address to perform upkeep on
     * @param gasLimit amount of gas to provide the target contract when
     * performing upkeep
     * @param admin address to cancel upkeep and withdraw remaining funds
     * @param checkData data passed to the contract when checking for upkeep
     */
    function registerUpkeep(
        address target,
        uint32 gasLimit,
        address admin,
        bytes calldata checkData
    // ) external override onlyOwnerOrRegistrar returns (uint256 id) {
    ) external override returns (uint256 id) {
        id = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), address(this), s_storage.nonce)));
        _createUpkeep(id, target, gasLimit, admin, 0, checkData);
        s_storage.nonce++;
        emit UpkeepRegistered(id, gasLimit, admin);
        return id;
    }

    /**
     * @notice simulated by keepers via eth_call to see if the upkeep needs to be
     * performed. If upkeep is needed, the call then simulates performUpkeep
     * to make sure it succeeds. Finally, it returns the success status along with
     * payment information and the perform data payload.
     * @param id identifier of the upkeep to check
     * @param from the address to simulate performing the upkeep from
     */
    function checkUpkeep(uint256 id, address from)
        external
        override
        cannotExecute
        returns (bytes memory performData, uint256 gasLimit)
    {
        Upkeep memory upkeep = s_upkeep[id];

        bytes memory callData = abi.encodeWithSelector(CHECK_SELECTOR, s_checkData[id]);
        (bool success, bytes memory result) = upkeep.target.call{ gas: s_storage.checkGasLimit }(callData);

        if (!success) revert TargetCheckReverted(result);

        (success, performData) = abi.decode(result, (bool, bytes));
        if (!success) revert UpkeepNotNeeded();

        PerformParams memory params = _generatePerformParams(from, id, performData);
        _prePerformUpkeep(upkeep, params.from);

        return (performData, params.gasLimit);
    }

    /**
     * @notice executes the upkeep with the perform data returned from
     * checkUpkeep, validates the keeper's permissions, and pays the keeper.
     * @param id identifier of the upkeep to execute the data with.
     * @param performData calldata parameter to be passed to the target upkeep.
     */
    function performUpkeep(uint256 id, bytes calldata performData)
        external
        override
        whenNotPaused
        returns (bool success)
    {
        return _performUpkeepWithParams(_generatePerformParams(msg.sender, id, performData));
    }

    /**
     * @notice prevent an upkeep from being performed in the future
     * @param id upkeep to be canceled
     */
    function cancelUpkeep(uint256 id) external override {
        uint64 maxValid = s_upkeep[id].maxValidBlocknumber;
        bool canceled = maxValid != UINT64_MAX;
        bool isOwner = msg.sender == owner();

        if (canceled && !(isOwner && maxValid > block.number)) revert CannotCancel();
        if (!isOwner && msg.sender != s_upkeep[id].admin) revert OnlyCallableByOwnerOrAdmin();

        uint256 height = block.number;
        if (!isOwner) {
            height = height + CANCELATION_DELAY;
        }
        s_upkeep[id].maxValidBlocknumber = uint64(height);
        s_upkeepIDs.remove(id);

        emit UpkeepCanceled(id, uint64(height));
    }

    /**
     * @notice allows the admin of an upkeep to modify gas limit
     * @param id upkeep to be change the gas limit for
     * @param gasLimit new gas limit for the upkeep
     */
    function setUpkeepGasLimit(uint256 id, uint32 gasLimit) external override onlyActiveUpkeep(id) onlyUpkeepAdmin(id) {
        if (gasLimit < PERFORM_GAS_MIN || gasLimit > s_storage.maxPerformGas) revert GasLimitOutsideRange();

        s_upkeep[id].executeGas = gasLimit;

        emit UpkeepGasLimitSet(id, gasLimit);
    }

    /**
     * @notice proposes the safe transfer of a keeper's payee to another address
     * @param keeper address of the keeper to transfer payee role
     * @param proposed address to nominate for next payeeship
     */
    function transferPayeeship(address keeper, address proposed) external {
        if (s_keeperInfo[keeper].payee != msg.sender) revert OnlyCallableByPayee();
        if (proposed == msg.sender) revert ValueNotChanged();

        if (s_proposedPayee[keeper] != proposed) {
            s_proposedPayee[keeper] = proposed;
            emit PayeeshipTransferRequested(keeper, msg.sender, proposed);
        }
    }

    /**
     * @notice accepts the safe transfer of payee role for a keeper
     * @param keeper address to accept the payee role for
     */
    function acceptPayeeship(address keeper) external {
        if (s_proposedPayee[keeper] != msg.sender) revert OnlyCallableByProposedPayee();
        address past = s_keeperInfo[keeper].payee;
        s_keeperInfo[keeper].payee = msg.sender;
        s_proposedPayee[keeper] = ZERO_ADDRESS;

        emit PayeeshipTransferred(keeper, past, msg.sender);
    }

    /**
     * @notice signals to keepers that they should not perform upkeeps until the
     * contract has been unpaused
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice signals to keepers that they can perform upkeeps once again after
     * having been paused
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // SETTERS

    /**
     * @notice updates the configuration of the registry
     * @param config registry config fields
     */
    function setConfig(Config memory config) public onlyOwner {
        if (config.maxPerformGas < s_storage.maxPerformGas) revert GasLimitCanOnlyIncrease();
        s_storage = Storage({
            blockCountPerTurn: config.blockCountPerTurn,
            checkGasLimit: config.checkGasLimit,
            maxPerformGas: config.maxPerformGas,
            nonce: s_storage.nonce
        });
        // s_registrar = config.registrar;
        emit ConfigSet(config);
    }

    /**
     * @notice update the list of keepers allowed to perform upkeep
     * @param keepers list of addresses allowed to perform upkeep
     * @param payees addresses corresponding to keepers who are allowed to
     * move payments which have been accrued
     */
    function setKeepers(address[] calldata keepers, address[] calldata payees) external onlyOwner {
        if (keepers.length != payees.length || keepers.length < 2) revert ParameterLengthError();
        for (uint256 i = 0; i < s_keeperList.length; i++) {
            address keeper = s_keeperList[i];
            s_keeperInfo[keeper].active = false;
        }
        for (uint256 i = 0; i < keepers.length; i++) {
            address keeper = keepers[i];
            KeeperInfo storage s_keeper = s_keeperInfo[keeper];
            address oldPayee = s_keeper.payee;
            address newPayee = payees[i];
            if (
                (newPayee == ZERO_ADDRESS) ||
                (oldPayee != ZERO_ADDRESS && oldPayee != newPayee && newPayee != IGNORE_ADDRESS)
            ) revert InvalidPayee();
            if (s_keeper.active) revert DuplicateEntry();
            s_keeper.active = true;
            if (newPayee != IGNORE_ADDRESS) {
                s_keeper.payee = newPayee;
            }
        }
        s_keeperList = keepers;
        emit KeepersUpdated(keepers, payees);
    }

    // GETTERS

    /**
     * @notice read all of the details about an upkeep
     */
    function getUpkeep(uint256 id)
        external
        view
        override
        returns (
            address target,
            uint32 executeGas,
            bytes memory checkData,
            uint96 balance,
            address lastKeeper,
            address admin,
            uint64 maxValidBlocknumber,
            uint96 amountSpent
        )
    {
        Upkeep memory reg = s_upkeep[id];
        return (
            reg.target,
            reg.executeGas,
            s_checkData[id],
            reg.balance,
            reg.lastKeeper,
            reg.admin,
            reg.maxValidBlocknumber,
            reg.amountSpent
        );
    }

    /**
     * @notice retrieve active upkeep IDs
     * @param startIndex starting index in list
     * @param maxCount max count to retrieve (0 = unlimited)
     * @dev the order of IDs in the list is **not guaranteed**, therefore, if making successive calls, one
     * should consider keeping the blockheight constant to ensure a wholistic picture of the contract state
     */
    function getActiveUpkeepIDs(uint256 startIndex, uint256 maxCount)
        external
        view
        override
        returns (uint256[] memory)
    {
        uint256 maxIdx = s_upkeepIDs.length();
        if (startIndex >= maxIdx) revert IndexOutOfRange();
        if (maxCount == 0) {
            maxCount = maxIdx - startIndex;
        }
        uint256[] memory ids = new uint256[](maxCount);
        for (uint256 idx = 0; idx < maxCount; idx++) {
            ids[idx] = s_upkeepIDs.at(startIndex + idx);
        }
        return ids;
    }

    /**
     * @notice read the current info about any keeper address
     */
    function getKeeperInfo(address query)
        external
        view
        override
        returns (
            address payee,
            bool active,
            uint96 balance
        )
    {
        KeeperInfo memory keeper = s_keeperInfo[query];
        return (keeper.payee, keeper.active, keeper.balance);
    }

    /**
     * @notice read the current state of the registry
     */
    function getState()
        external
        view
        override
        returns (
            State memory state,
            Config memory config,
            address[] memory keepers
        )
    {
        Storage memory store = s_storage;
        state.nonce = store.nonce;
        state.numUpkeeps = s_upkeepIDs.length();
        config.blockCountPerTurn = store.blockCountPerTurn;
        config.checkGasLimit = store.checkGasLimit;
        config.maxPerformGas = store.maxPerformGas;
        // config.registrar = s_registrar;
        return (state, config, s_keeperList);
    }

    /**
     * @notice calculates the minimum balance required for an upkeep to remain eligible
     * @param id the upkeep id to calculate minimum balance for
     */
    function getMinBalanceForUpkeep(uint256 id) external view returns (uint96 minBalance) {
        return getMaxPaymentForGas(s_upkeep[id].executeGas);
    }

    /**
     * @notice calculates the maximum payment for a given gas limit
     * @param gasLimit the gas to calculate payment for
     */
    function getMaxPaymentForGas(uint256 gasLimit) public pure returns (uint96 maxPayment) {
        return _calculatePaymentAmount(gasLimit);
    }

    /**
     * @notice creates a new upkeep with the given fields
     * @param target address to perform upkeep on
     * @param gasLimit amount of gas to provide the target contract when
     * performing upkeep
     * @param admin address to cancel upkeep and withdraw remaining funds
     * @param checkData data passed to the contract when checking for upkeep
     */
    function _createUpkeep(
        uint256 id,
        address target,
        uint32 gasLimit,
        address admin,
        uint96 balance,
        bytes memory checkData
    ) internal whenNotPaused {
        if (!target.isContract()) revert NotAContract();
        if (gasLimit < PERFORM_GAS_MIN || gasLimit > s_storage.maxPerformGas) revert GasLimitOutsideRange();
        s_upkeep[id] = Upkeep({
            target: target,
            executeGas: gasLimit,
            balance: balance,
            admin: admin,
            maxValidBlocknumber: UINT64_MAX,
            lastKeeper: ZERO_ADDRESS,
            amountSpent: 0
        });
        s_checkData[id] = checkData;
        s_upkeepIDs.add(id);
    }

    /**
     * @dev calculates LINK paid for gas spent plus a configure premium percentage
     */
    function _calculatePaymentAmount(uint256 gasLimit) private pure returns (uint96 payment) {
        uint256 weiForGas = gasLimit + REGISTRY_GAS_OVERHEAD;
        uint256 total = (weiForGas * (1e9) * PPB_BASE);
        return uint96(total);
    }

    /**
     * @dev calls target address with exactly gasAmount gas and data as calldata
     * or reverts if at least gasAmount gas is not available
     */
    function _callWithExactGas(
        uint256 gasAmount,
        address target,
        bytes memory data
    ) private returns (bool success) {
        assembly {
            let g := gas()
            // Compute g -= PERFORM_GAS_CUSHION and check for underflow
            if lt(g, PERFORM_GAS_CUSHION) {
                revert(0, 0)
            }
            g := sub(g, PERFORM_GAS_CUSHION)
            // if g - g//64 <= gasAmount, revert
            // (we subtract g//64 because of EIP-150)
            if iszero(gt(sub(g, div(g, 64)), gasAmount)) {
                revert(0, 0)
            }
            // solidity calls check that a contract actually exists at the destination, so we do the same
            if iszero(extcodesize(target)) {
                revert(0, 0)
            }
            // call and return whether we succeeded. ignore return data
            success := call(gasAmount, target, 0, add(data, 0x20), mload(data), 0, 0)
        }
        return success;
    }

    /**
     * @dev calls the Upkeep target with the performData param passed in by the
     * keeper and the exact gas required by the Upkeep
     */
    function _performUpkeepWithParams(PerformParams memory params)
        private
        nonReentrant
        validUpkeep(params.id)
        returns (bool success)
    {
        Upkeep memory upkeep = s_upkeep[params.id];
        _prePerformUpkeep(upkeep, params.from);

        uint256 gasUsed = gasleft();
        bytes memory callData = abi.encodeWithSelector(PERFORM_SELECTOR, params.performData);
        success = _callWithExactGas(params.gasLimit, upkeep.target, callData);
        gasUsed = gasUsed - gasleft();

        uint96 payment = _calculatePaymentAmount(gasUsed);

        s_upkeep[params.id].amountSpent = s_upkeep[params.id].amountSpent + payment;
        s_upkeep[params.id].lastKeeper = params.from;

        emit UpkeepPerformed(params.id, success, params.from, payment, params.performData);
        return success;
    }

    /**
     * @dev ensures all required checks are passed before an upkeep is performed
     */
    function _prePerformUpkeep(Upkeep memory upkeep, address from) private view {
        if (!s_keeperInfo[from].active) revert OnlyActiveKeepers();
        if (upkeep.lastKeeper == from) revert KeepersMustTakeTurns();
    }

    /**
     * @dev generates a PerformParams struct for use in _performUpkeepWithParams()
     */
    function _generatePerformParams(
        address from,
        uint256 id,
        bytes memory performData
    ) private view returns (PerformParams memory) {
        uint256 gasLimit = s_upkeep[id].executeGas;

        return PerformParams({ from: from, id: id, performData: performData, gasLimit: gasLimit });
    }

    // MODIFIERS

    /**
     * @dev ensures a upkeep is valid
     */
    modifier validUpkeep(uint256 id) {
        if (s_upkeep[id].maxValidBlocknumber <= block.number) revert UpkeepNotActive();
        _;
    }

    /**
     * @dev Reverts if called by anyone other than the admin of upkeep #id
     */
    modifier onlyUpkeepAdmin(uint256 id) {
        if (msg.sender != s_upkeep[id].admin) revert OnlyCallableByAdmin();
        _;
    }

    /**
     * @dev Reverts if called on a cancelled upkeep
     */
    modifier onlyActiveUpkeep(uint256 id) {
        if (s_upkeep[id].maxValidBlocknumber != UINT64_MAX) revert UpkeepNotActive();
        _;
    }

    /**
     * @dev ensures that burns don't accidentally happen by sending to the zero
     * address
     */
    modifier validRecipient(address to) {
        if (to == ZERO_ADDRESS) revert InvalidRecipient();
        _;
    }

    /**
     * @dev Reverts if called by anyone other than the contract owner or registrar.
     */
    // modifier onlyOwnerOrRegistrar() {
    //     if (msg.sender != owner() && msg.sender != s_registrar) revert OnlyCallableByOwnerOrRegistrar();
    //     _;
    // }
}
