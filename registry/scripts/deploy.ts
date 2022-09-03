import { BigNumber } from "ethers";
import { ethers } from "hardhat";

async function main() {
  // For registery
  const blockCountPerTurn = BigNumber.from(3);
  const checkGasLimit = BigNumber.from(20000000);
  const maxPerformGas = BigNumber.from(5000000);

  const config = {
    blockCountPerTurn,
    checkGasLimit,
    maxPerformGas,
    registrar: ethers.constants.AddressZero,
  };
  const Registry = await ethers.getContractFactory("KeeperRegistry");
  const registry = await Registry.deploy(config);
  await registry.deployed();

  await registry.setConfig(config);

  console.log(`KeeperRegistry deployed to ${registry.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
