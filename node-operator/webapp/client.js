function setCityAddress(){
    const city = document.getElementById("city").value;
    const cityAddress = document.getElementById("city_addr");
    cityAddress.value = city;
}
// 
const METAMASK_KEY = "4bd30ae2f241d08da4f2bb581a7dd14567862a4f1431009c454130673535c9f4";
async function addUpkeeper(){
    const cityAddress = document.getElementById("city_addr").value;
    const KEEPER_REGISTRY = document.getElementById("keeper_reg").value;
    const provider = getProvider();
    const signer = new ethers.Wallet(METAMASK_KEY, provider);
    const address = await signer.getAddress();
    console.log(address);

    logOutput("Registyr에 Upkeeper 등록 중....");

    const keeperRegistry = new ethers.Contract(KEEPER_REGISTRY, abiRegistryJson, signer);
    let tx = await keeperRegistry.addUpkeeper(cityAddress);
    const txData = await tx.wait();

    logOutput("Registyr에 Upkeeper 등록 성공!!!!");
}

function getUpkeeperContract(){
    const cityAddress = document.getElementById("city_addr").value;    
    const provider = getProvider();
    const signer = new ethers.Wallet(METAMASK_KEY, provider);    
    const upKeeper = new ethers.Contract(cityAddress, abiUpkeeperJson, signer);
    return upKeeper;
}

async function getAmt(){
    const upKeeper = getUpkeeperContract();
    const amtJson = await upKeeper.getAmt();

    console.log(amtJson._amt.toNumber(), amtJson._min_amt.toNumber(), amtJson._avg_amt.toNumber());   

    setData("amt", amtJson._amt.toNumber());
    setData("min_amt", amtJson._min_amt.toNumber());
    setData("avg_amt", amtJson._avg_amt.toNumber());
}

async function withdraw(){
    const withdraw_amt = getData('withdraw_amt');
    
    logOutput("금액 (" + withdraw_amt + " ) 출금 중!!!!!");

    const upKeeper = getUpkeeperContract();
    let tx = await upKeeper.withdraw(withdraw_amt);
    const txData = await tx.wait();
       
    const amtJson = await upKeeper.getAmt();
    console.log(amtJson._amt.toNumber(), amtJson._min_amt.toNumber(), amtJson._avg_amt.toNumber());   
    
    logOutput("출금 완료!!!!!");
    clearAmt();

    setData("amt", amtJson._amt.toNumber());
    setData("min_amt", amtJson._min_amt.toNumber());
    setData("avg_amt", amtJson._avg_amt.toNumber());
}

function clearAmt(){
    setData("amt", "");
    setData("min_amt", "");
    setData("avg_amt", "");
    setData("withdraw_amt", "");
}

function setData(id, value){
    const idEle = document.getElementById(id);
    idEle.value = value;
}
function getData(id){
    const idEle = document.getElementById(id);
    return idEle.value;
}

