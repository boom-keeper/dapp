// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

abstract contract ITypeAndVersion {
    function typeAndVersion() external pure virtual returns (string memory);
}
