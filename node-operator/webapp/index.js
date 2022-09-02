const jsonInterface = [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "ammount",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "address",
          name: "sender",
          type: "address"
        }
      ],
      name: "CurrentAmt",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "ammount",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "address",
          name: "sender",
          type: "address"
        }
      ],
      name: "ProvideAmt",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "ammount",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "address",
          name: "sender",
          type: "address"
        }
      ],
      name: "ShortageAmt",
      type: "event"
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes"
        }
      ],
      name: "checkUpkeep",
      outputs: [
        {
          internalType: "bool",
          name: "upkeepNeeded",
          type: "bool"
        },
        {
          internalType: "bytes",
          name: "performData",
          type: "bytes"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "getAmt",
      outputs: [
        {
          internalType: "uint256",
          name: "_amt",
          type: "uint256"
        }
      ],
      stateMutability: "payable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "bytes",
          name: "",
          type: "bytes"
        }
      ],
      name: "performUpkeep",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "setShortage",
      outputs: [
        {
          internalType: "uint256",
          name: "_amt",
          type: "uint256"
        }
      ],
      stateMutability: "payable",
      type: "function"
    }
  ];
  
function getProvider(){
  var url = "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
      url = "https://eth-goerli.g.alchemy.com/v2/7-AscD8I36JcFc43PcQQ-embBc0MY8U2";      
  var customHttpProvider = new ethers.providers.JsonRpcProvider(url, 5);
  return customHttpProvider;
}  



// 테스트 용 : 4bd30ae2f241d08da4f2bb581a7dd14567862a4f1431009c454130673535c9f4


async function callContract(){
  const METAMASK_KEY = document.getElementById("private_key").value;
  const CONTRACT_ADDRESS = document.getElementById("upkeeper_add").value;
  const KEEPER_REGISTRY = document.getElementById("keeper_reg").value;
  const provider = getProvider();
  const signer = new ethers.Wallet(METAMASK_KEY, provider);
  const address = await signer.getAddress();
  console.log(address);
  

  const badUpkeeper = new ethers.Contract(CONTRACT_ADDRESS, jsonInterface, signer);
  
  badUpkeeper.on("CurrentAmt", (amount, sender, event) => {
    console.log("amount : " +  amount );
    console.log("sender : " + sender);
    console.log("event = " + JSON.stringify(event));
  }); 

  const checkUpkeep = await badUpkeeper.checkUpkeep("0xe3d0d652");    
  console.log("checkUpkeep.upkeepNeeded : " + checkUpkeep.upkeepNeeded);

  logOutput("UPKEEPER ADDRESS : " + CONTRACT_ADDRESS + " / Call checkUpkeep " +  checkUpkeep.upkeepNeeded);
  
  
  const approveTxUnsigned = await badUpkeeper.populateTransaction.getAmt();
  approveTxUnsigned.chainId = 5; // chainId 1 for Ethereum mainnet
  approveTxUnsigned.gasLimit = 10000000;
  approveTxUnsigned.gasPrice = await provider.getGasPrice();
  approveTxUnsigned.nonce = await provider.getTransactionCount(address);

  console.log("nonce = " + approveTxUnsigned.nonce);

  const approveTxSigned = await signer.signTransaction(approveTxUnsigned);
  const submittedTx = await provider.sendTransaction(approveTxSigned);
  const approveReceipt = await submittedTx.wait();

}


async function callContract2(){
    const METAMASK_KEY =  "4bd30ae2f241d08da4f2bb581a7dd14567862a4f1431009c454130673535c9f4";
    const CONTRACT_ADDRESS = "0xF08AAd63c91241822e5B072f9829EAEb36633763";    

    const customHttpProvider = getProvider();
    const signer = new ethers.Wallet(METAMASK_KEY, customHttpProvider);
    customHttpProvider.getBlockNumber().then((result) => {
        console.log("Current block number: " + result);
    });      

    const badUpkeeper = new ethers.Contract(CONTRACT_ADDRESS, jsonInterface, signer);
    
    badUpkeeper.on("CurrentAmt", (amount, sender, event) => {
      console.log("amount : " +  amount );
      console.log("sender : " + sender);
      console.log("event = " + JSON.stringify(event));
    }); 
    

    const checkUpkeep = await badUpkeeper.checkUpkeep("0xe3d0d652");    
    console.log("checkUpkeep.upkeepNeeded : " + checkUpkeep.upkeepNeeded);

    const estimatedGasLimit = await badUpkeeper.estimateGas.getAmt(); // approves 1 USDT
    const approveTxUnsigned = await badUpkeeper.populateTransaction.getAmt();
    approveTxUnsigned.chainId = 5; // chainId 1 for Ethereum mainnet
    approveTxUnsigned.gasLimit = 10000000;
    approveTxUnsigned.gasPrice = await customHttpProvider.getGasPrice();
    approveTxUnsigned.nonce = await customHttpProvider.getTransactionCount("0x5DD89B60686fa3CD4a712A56a711f4536B1aAc9a");

    console.log("nonce = " + approveTxUnsigned.nonce);

    const approveTxSigned = await signer.signTransaction(approveTxUnsigned);
    const submittedTx = await customHttpProvider.sendTransaction(approveTxSigned);
    const approveReceipt = await submittedTx.wait();
    if (approveReceipt.status === 0)
        throw new Error("Approve transaction failed");

    // await badUpkeeper.performUpkeep("0xe3d0d652"); 

    // const amt = await badUpkeeper.getAmt();
    console.log("approveReceipt = " + approveReceipt.status);
    console.log("approveReceipt = " + JSON.stringify(approveReceipt));

    console.log("aaa");
}

let timerId = null;
function startSchedule(){
  callContract();
  timerId = setInterval(callContract, 30 * 1000);
}

function stopSchedule(){
  clearInterval(timerId);
}

async function connectWallet(){
  // const wallet = new ethers.Wallet(privateKey1, provider)
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  // Prompt user for account connections
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  console.log("Account:", await signer.getAddress());

}