//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;

error InvalidSender(string message, address sender);

// This is the main building block for smart contracts.
//Keeps a counter per account, which is incremented or decremented when teh contract 
//function is called by that account
contract CountPerAccount {


    // The total of all counters.
    uint16 public totalCount = 0;

    // An address type variable is used to store ethereum accounts.
    address public owner;

    // A mapping is a key/value map. Here we store each account's balance.
    mapping(address => uint16) counts;

    // The Transfer event helps off-chain applications understand
    // what happens within your contract.
    event Incremented(address _from, uint16 _value);
    event Decremented(address _from, uint16 _value);
    event CountsResponse(uint16 Count, uint16 Totalcount);

    /**
     * Contract initialization.
     */
    constructor() {
        // The owner is set and count is incremented for the owner
        // account that is deploying the contract.
        owner = msg.sender;
        counts[owner]++;
        totalCount++;
    }

    /**
     * A function to increment count.
     */
    function IncrementCount() external {

        // Transfer the amount.
        counts[msg.sender]++;
        totalCount++;
       

        // Notify off-chain applications of Increment
        emit Incremented(msg.sender, counts[msg.sender]);
    }


     /**
     * A function to decrement count.
     */
    function DecrementCount() external {

         require(counts[msg.sender] > 0, "Count cannot be negative");

        counts[msg.sender]--;
        totalCount--;
       

        // Notify off-chain applications of Increment
        emit Decremented(msg.sender, counts[msg.sender]);
    }
    
    /**
     * Read only function to retrieve the counts.
     *
     * The `view` modifier indicates that it doesn't modify the contract's
     * state, which allows us to call it without executing a transaction.
     */
    function countOf(address account) external returns (uint16 Count, uint16 Totalcount) {
        if (msg.sender!=owner && msg.sender!=account)
            revert InvalidSender({
                message: "Invalid Sender: Only Contract owner or Self can check the count",
                sender: msg.sender
            });

        emit CountsResponse(counts[account], totalCount);    
        return (counts[account], totalCount);
    }
}
