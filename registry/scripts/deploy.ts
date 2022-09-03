import { BigNumber } from "ethers";
import { ethers } from "hardhat";

async function main() {
  // For registery
  const blockCountPerTurn = BigNumber.from(3);
  const checkGasLimit = BigNumber.from(20000000);
  const maxPerformGas = BigNumber.from(5000000);

  // For registrar
  const autoApproveType_DISABLED = 0;
  const autoApproveType_ENABLED_SENDER_ALLOWLIST = 1;
  const autoApproveType_ENABLED_ALL = 2;
  const autoApproveMaxAllowed = BigNumber.from(0);

  const config = {
    blockCountPerTurn,
    checkGasLimit,
    maxPerformGas,
    registrar: ethers.constants.AddressZero,
  };
  const Registry = await ethers.getContractFactory("KeeperRegistry");
  const registry = await Registry.deploy(config);
  await registry.deployed();

  const Registrar = await ethers.getContractFactory("KeeperRegistrar");
  const registrar = await Registrar.deploy(autoApproveType_DISABLED, autoApproveMaxAllowed, registry.address);
  await registrar.deployed();

  config.registrar = registrar.address;
  await registry.setConfig(config);

  console.log(`KeeperRegistry deployed to ${registry.address}`);
  console.log(`KeeperRegistrar deployed to ${registrar.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
