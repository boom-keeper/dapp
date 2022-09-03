

// 0xd2ec84C71b7456fd271284518eCBB23b5213A16D


// 0xE797334A8bAf3E2524b27d434d9682621abD325b
// 0xd9379ed804b8a22325D9f18Db5373383Ae1C7d17
// 0xF08AAd63c91241822e5B072f9829EAEb36633763

// Seoul : 0x13C920b7925A7569A1423a5940A374F0ed7de360

let beforeBlockNumber = 0;  
async function checkUpkeeper(){
    // console.log(abiRegistryJson);    
    logOutput("=================== 신규 프로세스 시작 =====================");
    
    const METAMASK_KEY = document.getElementById("nodes").value;
    const KEEPER_REGISTRY = document.getElementById("keeper_reg").value;
    const provider = getProvider();
    const signer = new ethers.Wallet(METAMASK_KEY, provider);
    const address = await signer.getAddress();
    console.log(address);

    const keeperRegistry = new ethers.Contract(KEEPER_REGISTRY, abiRegistryJson, signer);
    logOutput("Registyr에서 대상 Upkeeper 검색....");
    
    keeperRegistry.on("GetUpkeeper", (upkeeperAddr, status, sender, event) => {                
        if(address != sender) return;

        if( event.blockNumber > beforeBlockNumber ){
            console.log(upkeeperAddr + " : " + status + " : " + sender + " : " + JSON.stringify(event));    
            
            beforeBlockNumber = event.blockNumber;
            if(status =="2"){
                logOutput("Registry에서 대상 Upkeeper 검색 성공");            
                upkeepNeeded = callCheckUpkeeper(upkeeperAddr, signer); 
                if(upkeepNeeded){
                    // 호출 불가 
                }else{
                    // 호출 불가 
                    return;
                }
            }else{
                logOutput("Registyr에서 처리 대상 Upkeeper 없음");
                 return;
            }
        }else{
            console.log("이전 블럭 번호 보다 작다.");
        }
    });

    let tx = await keeperRegistry.getUpkeeper();
    const txData = await tx.wait();
    console.log("txData = " + JSON.stringify(txData));   
}

async function callCheckUpkeeper(upkeeperAddr, signer){
    const KEEPER_REGISTRY = document.getElementById("keeper_reg").value;
    const upkeeper = new ethers.Contract(upkeeperAddr, abiUpkeeperInterfaceJson, signer);                
    const checkUpkeep = await upkeeper.checkUpkeep("0xe3d0d652"); 
    

    console.log("checkUpkeep.upkeepNeeded : " + checkUpkeep.upkeepNeeded);    
    logOutput("Upkeeper 주소( " + upkeeperAddr + " ) checkUpkeep 실행 ==> " + checkUpkeep.upkeepNeeded);
    
    if(checkUpkeep.upkeepNeeded){
        logOutput("Registry 에 performUpkeep 실행 요청");            
    }else{
        logOutput("performUpkeep 실행 불가");            
    }

    const keeperRegistry = new ethers.Contract(KEEPER_REGISTRY, abiRegistryJson, signer);

    const provider = getProvider();    
    const address = await signer.getAddress();
    console.log(address);
 
    const approveTxUnsigned = await keeperRegistry.populateTransaction.performUpkeep(upkeeperAddr, checkUpkeep.upkeepNeeded);
    approveTxUnsigned.chainId = 5; // chainId 1 for Ethereum mainnet
    approveTxUnsigned.gasLimit = 10000000;
    approveTxUnsigned.gasPrice = await provider.getGasPrice();
    approveTxUnsigned.nonce = await provider.getTransactionCount(address);
    console.log("nonce = " + approveTxUnsigned.nonce);

    const approveTxSigned = await signer.signTransaction(approveTxUnsigned);
    const submittedTx = await provider.sendTransaction(approveTxSigned);
    const approveReceipt = await submittedTx.wait();
    
    logOutput("Registry 에 performUpkeep 실행 완료");

    return checkUpkeep.upkeepNeeded;
}



let timerId = null;
function startSchedule(){
  checkUpkeeper();
  timerId = setInterval(checkUpkeeper, 60 * 1000);
}

function stopSchedule(){
  clearInterval(timerId);
}

function clearOutput(){
	const output = document.getElementById("output");
    output.value = "";	
}
