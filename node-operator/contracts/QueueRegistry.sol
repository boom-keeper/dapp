// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "./AddressQueue.sol";

contract QueueRegistry is AddressQueue {
    
    Queue private upkeeperQue;

    event GetUpkeeper(address upkeeperAddr, uint status, address sender);
    event PerformUpkeep(address upkeeperAddr, bool upkeepNeeded, address sender);

    uint constant private NO_STATUS = 0;
    uint constant private READY_STATUS = 1; 
    uint constant private PENDING_STATUS = 2;
    uint constant private COMPLETE_STATUS = 3;  
    address constant ZERO = 0x0000000000000000000000000000000000000000;

    uint constant private ARRAY_SIZE = 15;  

    mapping(address => uint) private upkeeperAddrMap;
    

    constructor(){                        
    }

    function _push(address upkeeperAddr) internal{
        push(upkeeperQue, upkeeperAddr);
    }

    function _pop() internal returns (address){
        if(length(upkeeperQue) == 0) return ZERO;
        
        return pop(upkeeperQue);
    }

    function addUpkeeper(address upkeeperAddr) external payable {
        _addUpkeeper(upkeeperAddr);
    }

    function deleteUpkeeper(address upkeeperAddr) external payable {
        _deleteUpkeeper(upkeeperAddr);      
    }


    function _deleteUpkeeper(address upkeeperAddr) internal  {                
        delete upkeeperAddrMap[upkeeperAddr];
    }

    function length() external view returns (uint){
        return length(upkeeperQue);
    }

    function _addUpkeeper(address upkeeperAddr) internal  {
        uint status = upkeeperAddrMap[upkeeperAddr];  
        if(status == READY_STATUS){ // 대기중인 건이 있으면 등록하지 않는다
            return;
        }

        _push(upkeeperAddr);        
        upkeeperAddrMap[upkeeperAddr] = READY_STATUS;
    }

    function getUpkeeper() external payable returns(address upkeeperAddr, uint status) {
        
        upkeeperAddr = _pop();
        if(upkeeperAddr != ZERO){
            status = PENDING_STATUS;
            upkeeperAddrMap[upkeeperAddr] = status;
            emit GetUpkeeper( upkeeperAddr, status, msg.sender );
        }else{
            status  = NO_STATUS;
            emit GetUpkeeper( upkeeperAddr, status, msg.sender );
        }

        return (upkeeperAddr, status);
    }

    function changePending(address upkeeperAddr) external payable {        
        upkeeperAddrMap[upkeeperAddr] = PENDING_STATUS;
    }

    function changeComplete(address upkeeperAddr) external payable {        
        upkeeperAddrMap[upkeeperAddr] = COMPLETE_STATUS;        
    }

    function performUpkeep(address upkeeperAddr, bool upkeepNeeded) external payable {     
        // checkUpkeep 성공했을 Contrac 호출 
        if(upkeepNeeded){ 
            // Contract 주소로 호출  (성공하면 기존 ADD에서 삭제함)               
            // TODO 여기서 외부 호출하는 함수 추가 
            
            (bool success, bytes memory data) = upkeeperAddr.call{value: msg.value, gas: 1000000}( 
                abi.encodeWithSignature("performUpkeep(bytes)", 0xb5)
            );

            upkeepNeeded = success;
            console.log(string(data));
    

            _deleteUpkeeper(upkeeperAddr);
        }else{
            _addUpkeeper(upkeeperAddr); // 실패한 주소는 제일 뒤로 옮긴다.
        }
        emit PerformUpkeep(upkeeperAddr, upkeepNeeded, msg.sender );
    }

}