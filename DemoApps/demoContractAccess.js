import demoContractAccessObject from './demoContractAccessApp.js';

var contract=new demoContractAccessObject();

await contract.getCountOf(0);

await contract.sendIncrement(1);

await contract.getCountOf(0);

await contract.sendDecrement(1);

await contract.getCountOf(1);


