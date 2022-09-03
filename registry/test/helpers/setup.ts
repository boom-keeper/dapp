import { Signer } from "ethers";
import { ethers } from "hardhat";

// Suppress "Duplicate definition" error logs
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

export interface Contracts {
  contract1: Signer;
  contract2: Signer;
  contract3: Signer;
  contract4: Signer;
  contract5: Signer;
  contract6: Signer;
  contract7: Signer;
  contract8: Signer;
}

export interface Roles {
  defaultAccount: Signer;
  oracleNode: Signer;
  oracleNode1: Signer;
  oracleNode2: Signer;
  oracleNode3: Signer;
  oracleNode4: Signer;
  stranger: Signer;
  consumer: Signer;
}

export interface Personas {
  Owner: Signer;
  Keeper1: Signer;
  Keeper2: Signer;
  Keeper3: Signer;
  Nonkeeper: Signer;
  Admin: Signer;
  Payee1: Signer;
  Payee2: Signer;
  Payee3: Signer;
}

export interface Users {
  contracts: Contracts;
  roles: Roles;
  personas: Personas;
}

export async function getUsers() {
  let accounts = await ethers.getSigners();

  const personas: Personas = {
    Owner: accounts[0],
    Admin: accounts[1],
    Nonkeeper: accounts[2],
    Payee1: accounts[3],
    Keeper3: accounts[4],
    Payee2: accounts[5],
    Keeper1: accounts[6],
    Keeper2: accounts[7],
    Payee3: accounts[8],
  };

  const contracts: Contracts = {
    contract1: accounts[0],
    contract2: accounts[1],
    contract3: accounts[2],
    contract4: accounts[3],
    contract5: accounts[4],
    contract6: accounts[5],
    contract7: accounts[6],
    contract8: accounts[7],
  };

  const roles: Roles = {
    defaultAccount: accounts[0],
    oracleNode: accounts[1],
    oracleNode1: accounts[2],
    oracleNode2: accounts[3],
    oracleNode3: accounts[4],
    oracleNode4: accounts[5],
    stranger: accounts[6],
    consumer: accounts[7],
  };

  const users: Users = {
    personas,
    roles,
    contracts,
  };
  return users;
}
