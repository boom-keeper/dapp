import { NextPage } from "next";
import "@rainbow-me/rainbowkit/styles.css";
import Registry from "../src/features/Registry";
import CheckUpkeep from "../src/features/CheckUpkeep";
import { Button, Divider, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";

const Keepers = () => {
  const router = useRouter();

  let timerId = 0;

  const abiRegistryJson2 = [
    {
      inputs: [
        {
          components: [
            {
              internalType: "uint24",
              name: "blockCountPerTurn",
              type: "uint24",
            },
            {
              internalType: "uint32",
              name: "checkGasLimit",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "maxPerformGas",
              type: "uint32",
            },
          ],
          internalType: "struct Config",
          name: "config",
          type: "tuple",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "ArrayHasNoEntries",
      type: "error",
    },
    {
      inputs: [],
      name: "CannotCancel",
      type: "error",
    },
    {
      inputs: [],
      name: "DuplicateEntry",
      type: "error",
    },
    {
      inputs: [],
      name: "GasLimitCanOnlyIncrease",
      type: "error",
    },
    {
      inputs: [],
      name: "GasLimitOutsideRange",
      type: "error",
    },
    {
      inputs: [],
      name: "IndexOutOfRange",
      type: "error",
    },
    {
      inputs: [],
      name: "InvalidPayee",
      type: "error",
    },
    {
      inputs: [],
      name: "InvalidRecipient",
      type: "error",
    },
    {
      inputs: [],
      name: "KeepersMustTakeTurns",
      type: "error",
    },
    {
      inputs: [],
      name: "MigrationNotPermitted",
      type: "error",
    },
    {
      inputs: [],
      name: "NotAContract",
      type: "error",
    },
    {
      inputs: [],
      name: "OnlyActiveKeepers",
      type: "error",
    },
    {
      inputs: [],
      name: "OnlyCallableByAdmin",
      type: "error",
    },
    {
      inputs: [],
      name: "OnlyCallableByOwnerOrAdmin",
      type: "error",
    },
    {
      inputs: [],
      name: "OnlyCallableByPayee",
      type: "error",
    },
    {
      inputs: [],
      name: "OnlyCallableByProposedPayee",
      type: "error",
    },
    {
      inputs: [],
      name: "OnlySimulatedBackend",
      type: "error",
    },
    {
      inputs: [],
      name: "ParameterLengthError",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "reason",
          type: "bytes",
        },
      ],
      name: "TargetCheckReverted",
      type: "error",
    },
    {
      inputs: [],
      name: "UpkeepNotActive",
      type: "error",
    },
    {
      inputs: [],
      name: "UpkeepNotNeeded",
      type: "error",
    },
    {
      inputs: [],
      name: "ValueNotChanged",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          components: [
            {
              internalType: "uint24",
              name: "blockCountPerTurn",
              type: "uint24",
            },
            {
              internalType: "uint32",
              name: "checkGasLimit",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "maxPerformGas",
              type: "uint32",
            },
          ],
          indexed: false,
          internalType: "struct Config",
          name: "config",
          type: "tuple",
        },
      ],
      name: "ConfigSet",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address[]",
          name: "keepers",
          type: "address[]",
        },
        {
          indexed: false,
          internalType: "address[]",
          name: "payees",
          type: "address[]",
        },
      ],
      name: "KeepersUpdated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
      ],
      name: "OwnershipTransferRequested",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "Paused",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "keeper",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
      ],
      name: "PayeeshipTransferRequested",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "keeper",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
      ],
      name: "PayeeshipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "keeper",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "payee",
          type: "address",
        },
      ],
      name: "PaymentWithdrawn",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "Unpaused",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint64",
          name: "atBlockHeight",
          type: "uint64",
        },
      ],
      name: "UpkeepCanceled",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint96",
          name: "gasLimit",
          type: "uint96",
        },
      ],
      name: "UpkeepGasLimitSet",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "remainingBalance",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "destination",
          type: "address",
        },
      ],
      name: "UpkeepMigrated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "bool",
          name: "success",
          type: "bool",
        },
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint96",
          name: "payment",
          type: "uint96",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "performData",
          type: "bytes",
        },
      ],
      name: "UpkeepPerformed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "startingBalance",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "importedFrom",
          type: "address",
        },
      ],
      name: "UpkeepReceived",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint32",
          name: "executeGas",
          type: "uint32",
        },
        {
          indexed: false,
          internalType: "address",
          name: "admin",
          type: "address",
        },
      ],
      name: "UpkeepRegistered",
      type: "event",
    },
    {
      inputs: [],
      name: "acceptOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "keeper",
          type: "address",
        },
      ],
      name: "acceptPayeeship",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
      ],
      name: "cancelUpkeep",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
      ],
      name: "checkUpkeep",
      outputs: [
        {
          internalType: "bytes",
          name: "performData",
          type: "bytes",
        },
        {
          internalType: "uint256",
          name: "gasLimit",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "startIndex",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "maxCount",
          type: "uint256",
        },
      ],
      name: "getActiveUpkeepIDs",
      outputs: [
        {
          internalType: "uint256[]",
          name: "",
          type: "uint256[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "query",
          type: "address",
        },
      ],
      name: "getKeeperInfo",
      outputs: [
        {
          internalType: "address",
          name: "payee",
          type: "address",
        },
        {
          internalType: "bool",
          name: "active",
          type: "bool",
        },
        {
          internalType: "uint96",
          name: "balance",
          type: "uint96",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "gasLimit",
          type: "uint256",
        },
      ],
      name: "getMaxPaymentForGas",
      outputs: [
        {
          internalType: "uint96",
          name: "maxPayment",
          type: "uint96",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
      ],
      name: "getMinBalanceForUpkeep",
      outputs: [
        {
          internalType: "uint96",
          name: "minBalance",
          type: "uint96",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getState",
      outputs: [
        {
          components: [
            {
              internalType: "uint32",
              name: "nonce",
              type: "uint32",
            },
            {
              internalType: "uint256",
              name: "numUpkeeps",
              type: "uint256",
            },
          ],
          internalType: "struct State",
          name: "state",
          type: "tuple",
        },
        {
          components: [
            {
              internalType: "uint24",
              name: "blockCountPerTurn",
              type: "uint24",
            },
            {
              internalType: "uint32",
              name: "checkGasLimit",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "maxPerformGas",
              type: "uint32",
            },
          ],
          internalType: "struct Config",
          name: "config",
          type: "tuple",
        },
        {
          internalType: "address[]",
          name: "keepers",
          type: "address[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
      ],
      name: "getUpkeep",
      outputs: [
        {
          internalType: "address",
          name: "target",
          type: "address",
        },
        {
          internalType: "uint32",
          name: "executeGas",
          type: "uint32",
        },
        {
          internalType: "bytes",
          name: "checkData",
          type: "bytes",
        },
        {
          internalType: "uint96",
          name: "balance",
          type: "uint96",
        },
        {
          internalType: "address",
          name: "lastKeeper",
          type: "address",
        },
        {
          internalType: "address",
          name: "admin",
          type: "address",
        },
        {
          internalType: "uint64",
          name: "maxValidBlocknumber",
          type: "uint64",
        },
        {
          internalType: "uint96",
          name: "amountSpent",
          type: "uint96",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "pause",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "paused",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "performData",
          type: "bytes",
        },
      ],
      name: "performUpkeep",
      outputs: [
        {
          internalType: "bool",
          name: "success",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "target",
          type: "address",
        },
        {
          internalType: "uint32",
          name: "gasLimit",
          type: "uint32",
        },
        {
          internalType: "address",
          name: "admin",
          type: "address",
        },
        {
          internalType: "bytes",
          name: "checkData",
          type: "bytes",
        },
      ],
      name: "registerUpkeep",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: "uint24",
              name: "blockCountPerTurn",
              type: "uint24",
            },
            {
              internalType: "uint32",
              name: "checkGasLimit",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "maxPerformGas",
              type: "uint32",
            },
          ],
          internalType: "struct Config",
          name: "config",
          type: "tuple",
        },
      ],
      name: "setConfig",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address[]",
          name: "keepers",
          type: "address[]",
        },
        {
          internalType: "address[]",
          name: "payees",
          type: "address[]",
        },
      ],
      name: "setKeepers",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "uint32",
          name: "gasLimit",
          type: "uint32",
        },
      ],
      name: "setUpkeepGasLimit",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "keeper",
          type: "address",
        },
        {
          internalType: "address",
          name: "proposed",
          type: "address",
        },
      ],
      name: "transferPayeeship",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "typeAndVersion",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "unpause",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const abiRegistryJson = [
    {
      inputs: [
        {
          internalType: "address",
          name: "upkeeperAddr",
          type: "address",
        },
      ],
      name: "addUpkeeper",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "upkeeperAddr",
          type: "address",
        },
      ],
      name: "changeComplete",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "upkeeperAddr",
          type: "address",
        },
      ],
      name: "changePending",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "upkeeperAddr",
          type: "address",
        },
      ],
      name: "deleteUpkeeper",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "getUpkeeper",
      outputs: [
        {
          internalType: "address",
          name: "upkeeperAddr",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "status",
          type: "uint256",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "upkeeperAddr",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "status",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "sender",
          type: "address",
        },
      ],
      name: "GetUpkeeper",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "upkeeperAddr",
          type: "address",
        },
        {
          internalType: "bool",
          name: "upkeepNeeded",
          type: "bool",
        },
      ],
      name: "performUpkeep",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "upkeeperAddr",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "upkeepNeeded",
          type: "bool",
        },
        {
          indexed: false,
          internalType: "address",
          name: "sender",
          type: "address",
        },
      ],
      name: "PerformUpkeep",
      type: "event",
    },
    {
      inputs: [],
      name: "length",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  const abiUpkeeperJson = [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "ammount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          indexed: false,
          internalType: "address",
          name: "sender",
          type: "address",
        },
      ],
      name: "ProvideAmt",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "ammount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          indexed: false,
          internalType: "address",
          name: "sender",
          type: "address",
        },
      ],
      name: "ShortageAmt",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "ammount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          indexed: false,
          internalType: "address",
          name: "sender",
          type: "address",
        },
      ],
      name: "Withdraw",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      name: "checkUpkeep",
      outputs: [
        {
          internalType: "bool",
          name: "upkeepNeeded",
          type: "bool",
        },
        {
          internalType: "bytes",
          name: "performData",
          type: "bytes",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getAmt",
      outputs: [
        {
          internalType: "uint256",
          name: "_amt",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_min_amt",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_avg_amt",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      name: "performUpkeep",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "setShortage",
      outputs: [
        {
          internalType: "uint256",
          name: "_amt",
          type: "uint256",
        },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_amt",
          type: "uint256",
        },
      ],
      name: "withdraw",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
  ];

  const abiUpkeeperInterfaceJson = [
    {
      inputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes",
        },
      ],
      name: "checkUpkeep",
      outputs: [
        {
          internalType: "bool",
          name: "upkeepNeeded",
          type: "bool",
        },
        {
          internalType: "bytes",
          name: "performData",
          type: "bytes",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  function getProvider() {
    var url = "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
    // url = "https://eth-goerli.g.alchemy.com/v2/7-AscD8I36JcFc43PcQQ-embBc0MY8U2";
    var customHttpProvider = new ethers.providers.JsonRpcProvider(url, 5);
    return customHttpProvider;
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
  }

  async function callCheckUpkeeper(id, upkeeperAddr, signer) {
    id = router.query.id;
    console.log(upkeeperAddr);
    const KEEPER_REGISTRY = document.getElementById("keeper_reg").value;
    const upkeeper = new ethers.Contract(
      upkeeperAddr,
      abiUpkeeperInterfaceJson,
      signer
    );
    const checkUpkeep = await upkeeper.checkUpkeep("0xe3d0d652");

    console.log("checkUpkeep.upkeepNeeded : " + checkUpkeep.upkeepNeeded);
    logOutput(
      "Upkeeper 주소( " +
        upkeeperAddr +
        " ) checkUpkeep 실행 ==> " +
        checkUpkeep.upkeepNeeded
    );

    if (checkUpkeep.upkeepNeeded) {
      logOutput("Registry 에 performUpkeep 실행 요청");
    } else {
      logOutput("performUpkeep 실행 불가");
      // TODO: 주석 풀기
      //return;
    }

    const keeperRegistry = new ethers.Contract(
      KEEPER_REGISTRY,
      abiRegistryJson2,
      signer
    );

    const provider = getProvider();
    const address = await signer.getAddress();
    console.log(address);

    const approveTxUnsigned =
      await keeperRegistry.populateTransaction.performUpkeep(id, "0xe3d0d652");
    approveTxUnsigned.chainId = 5; // chainId 1 for Ethereum mainnet
    approveTxUnsigned.gasLimit = 5000000;
    approveTxUnsigned.gasPrice = await provider.getGasPrice();
    approveTxUnsigned.nonce = await provider.getTransactionCount(address);
    console.log("nonce = " + approveTxUnsigned.nonce);

    const approveTxSigned = await signer.signTransaction(approveTxUnsigned);
    const submittedTx = await provider.sendTransaction(approveTxSigned);
    const approveReceipt = await submittedTx.wait();

    logOutput("Registry 에 performUpkeep 실행 완료");

    return checkUpkeep.upkeepNeeded;
  }

  function logOutput(log) {
    const output = document.getElementById("output");
    output.value = output.value + "\n" + log;
  }

  async function checkUpkeeper() {
    // console.log(abiRegistryJson);

    const METAMASK_KEY = document.getElementById("nodes").value;
    const KEEPER_REGISTRY = document.getElementById("keeper_reg").value;
    const provider = getProvider();
    const signer = new ethers.Wallet(METAMASK_KEY, provider);
    const address = await signer.getAddress();
    console.log(address);

    const ZERO = ethers.constants.AddressZero;

    const keeperRegistry = new ethers.Contract(
      KEEPER_REGISTRY,
      abiRegistryJson2,
      signer
    );
    logOutput("Registyr에서 대상 Upkeeper 검색....");
    console.log(keeperRegistry.address + " : " + ZERO);
    // const checkUpkeep = await keeperRegistry.getUpkeep(1, ZERO);

    const ids = [0, 1, 2, 3, 4, 5];

    let id = ethers.BigNumber.from(0);
    if (
      METAMASK_KEY ==
      "3d16727befd3285dc36fd611adf51b52c46711009008411bb8cb2a9e03d2888c"
    ) {
      const rId = getRandomInt(0, 2);
      id = ethers.BigNumber.from(ids[rId]);
      // id = ethers.BigNumber.from(73295272705831020397636235264927597107493447273918553746595413202074548232609)

      //73295272705831020397636235264927597107493447273918553746595.413202074548232609
    } else {
      const rId = getRandomInt(3, 5);
      id = ethers.BigNumber.from(ids[rId]);
    }

    console.log("id : " + id.toNumber());

    console.log(id.toNumber());
    //id.add(1);

    const result = await keeperRegistry.getUpkeep(id);

    console.log("checkUpkeep.upkeepNeeded : " + result.target);
    logOutput(
      "Upkeeper 주소( " +
        result.target +
        " ) checkUpkeep 실행 ==> " +
        result.executeGas
    );
    let address2 = result.target;
    address2 = "0xBbd20477E1f84B1c23e4122124752CeB1A4878A0";

    if (result.target == ZERO) {
      logOutput("Registry 에 performUpkeep 실행 요청");
      callCheckUpkeeper(id, address2, signer);
    } else {
      logOutput("performUpkeep 실행 불가");
    }
    id = ethers.BigNumber.from(0);
    const cnt = ethers.BigNumber.from(0);
    //const idArray = await keeperRegistry.getActiveUpkeepIDs(id, cnt);
    const idArray = await keeperRegistry.getActiveUpkeepIDs(0, 0);

    console.log("id Arrays : " + JSON.stringify(idArray));

    for (let i = 0; i < idArray.length; i++) {
      console.log(ethers.utils.formatEther(idArray[i]));
      console.log(idArray[i].value);
    }
  }

  function startSchedule() {
    checkUpkeeper();
    timerId = setInterval(checkUpkeeper, 60 * 1000);
  }

  function stopSchedule() {
    clearInterval(timerId);
  }

  function clearOutput() {
    const output = document.getElementById("output");
    output.value = "";
  }

  return (
    <div style={{ padding: 20 }}>
      <div>
        Node List :
        <select name="nodes" id="nodes">
          <option value="3d16727befd3285dc36fd611adf51b52c46711009008411bb8cb2a9e03d2888c">
            Node1
          </option>
          <option value="4bd30ae2f241d08da4f2bb581a7dd14567862a4f1431009c454130673535c9f4">
            Node2
          </option>
        </select>
      </div>
      <div>
        KEEPER_REGSTRY :{" "}
        <input
          type="text"
          id="keeper_reg"
          value="0x595B999FaC4385b866661E5Bf254FEbFD1714Fab"
        />
      </div>

      <Flex gap="20px">
        <Button onClick={checkUpkeeper}>callTest</Button>

        <Button onClick={startSchedule}>startSchedule</Button>
        <Button onClick={stopSchedule}>stopSchedule</Button>
        <Button onClick={clearOutput}>Clear</Button>
      </Flex>

      <div>
        <textarea
          id="output"
          value=""
          style={{
            width: "100%",
            height: "35em",
            border: "none",
            resize: "none",
          }}
        ></textarea>
      </div>

      <script
        src="https://cdn.ethers.io/lib/ethers-5.2.umd.min.js"
        type="application/javascript"
      ></script>
    </div>
  );
};

export default Keepers;
