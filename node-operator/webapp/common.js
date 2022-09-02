const abiRegistryJson = 
[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "upkeeperAddr",
				"type": "address"
			}
		],
		"name": "addUpkeeper",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "upkeeperAddr",
				"type": "address"
			}
		],
		"name": "changeComplete",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "upkeeperAddr",
				"type": "address"
			}
		],
		"name": "changePending",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "upkeeperAddr",
				"type": "address"
			}
		],
		"name": "deleteUpkeeper",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getUpkeeper",
		"outputs": [
			{
				"internalType": "address",
				"name": "upkeeperAddr",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "status",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "upkeeperAddr",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "status",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "GetUpkeeper",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "upkeeperAddr",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "upkeepNeeded",
				"type": "bool"
			}
		],
		"name": "performUpkeep",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "upkeeperAddr",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "upkeepNeeded",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "PerformUpkeep",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "length",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const abiUpkeeperJson = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "ammount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ProvideAmt",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "ammount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ShortageAmt",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "ammount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "Withdraw",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"name": "checkUpkeep",
		"outputs": [
			{
				"internalType": "bool",
				"name": "upkeepNeeded",
				"type": "bool"
			},
			{
				"internalType": "bytes",
				"name": "performData",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAmt",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "_amt",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_min_amt",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_avg_amt",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"name": "performUpkeep",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "setShortage",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "_amt",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amt",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	}
];


const abiUpkeeperInterfaceJson = 
[
	{
		"inputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"name": "checkUpkeep",
		"outputs": [
			{
				"internalType": "bool",
				"name": "upkeepNeeded",
				"type": "bool"
			},
			{
				"internalType": "bytes",
				"name": "performData",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}	
];

function getProvider(){
    var url = "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
        // url = "https://eth-goerli.g.alchemy.com/v2/7-AscD8I36JcFc43PcQQ-embBc0MY8U2";      
    var customHttpProvider = new ethers.providers.JsonRpcProvider(url, 5);
    return customHttpProvider;
  }  

  function logOutput(log){
    const output = document.getElementById("output");
    output.value = output.value + "\n" + log;
  }
