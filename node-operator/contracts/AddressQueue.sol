// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract AddressQueue {
    struct Queue {
        address[200] data;
        uint256 front;
        uint256 back;
    }

    /// @dev the number of elements stored in the queue.
    function length(Queue storage q) internal view returns (uint256) {
        return q.back - q.front;
    }

    /// @dev the number of elements this queue can hold
    function capacity(Queue storage q) internal view returns (uint256) {
        return q.data.length - 1;
    }

    /// @dev push a new element to the back of the queue
    function push(Queue storage q, address data) internal {
        if ((q.back + 1) % q.data.length == q.front) return; // throw;
        q.data[q.back] = data;
        q.back = (q.back + 1) % q.data.length;
    }

    /// @dev remove and return the element at the front of the queue
    function pop(Queue storage q) internal returns (address r) {
        if (q.back == q.front) return q.data[q.front]; // throw;
        r = q.data[q.front];
        delete q.data[q.front];
        q.front = (q.front + 1) % q.data.length;
    }
}

contract QueueUserMayBeDeliveryDroneControl is AddressQueue {
    Queue requests;

    constructor() {}

    function push(address d) external {
        push(requests, d);
    }

    function popRequest() external returns (address) {
        return pop(requests);
    }

    function queueLength() external view returns (uint256) {
        return length(requests);
    }
}
