import Web3 from 'web3';
import fs from 'fs';
import Ethers from 'ethers';


import { createRequire } from "module";
const require = createRequire(import.meta.url);
const contract= require("../ContractInfo.json");


export default class demoContractAccessObject {

    constructor() {
        
        this.web3obj = new Web3 (new Web3.providers.HttpProvider(process.env.AMB_TOKENACCESS_URL));

        this.ethereumAddress = [];
        this.privateKeys = [];
        this.NetworkID="";
        this.ChainID="";


        let path = "m/44'/60'/0'/0/0";
        console.log("First 10 Ethereum Addresses for Provided Mnemonic")
        for(let i=0;i<10;i++) {
            path=  "m/44'/60'/0'/0/" + i.toString();
            let mnemonicWallet = Ethers.Wallet.fromMnemonic(process.env.MNEMONIC, path);
            this.ethereumAddress[i]=mnemonicWallet.address;
            this.privateKeys[i]=mnemonicWallet.privateKey;
            console.log(this.ethereumAddress[i]);
        }  
        console.log("Contract Address", contract.cAddress);
        this.CPAcontract = new this.web3obj.eth.Contract(contract.cABI, contract.cAddress);      
    }

    async getCountOf(index){


        //let count = await this.CPAcontract.methods.countOf(this.ethereumAddress[0]).call();

        
        const countOfTx = this.CPAcontract.methods.countOf(this.ethereumAddress[index]);
  
        const createTransaction = await this.web3obj.eth.accounts.signTransaction(
            {
                to: contract.cAddress,
                from: this.ethereumAddress[index],
                data: countOfTx.encodeABI(),
                gas: await countOfTx.estimateGas({from: this.ethereumAddress[index]}) 
            },
            this.privateKeys[index]
        );
        console.log("Getting Counts from Contract......")
        // Send Tx and Wait for Receipt
        const createReceipt = await this.web3obj.eth.sendSignedTransaction(createTransaction.rawTransaction);
        //console.log("Data   " + JSON.stringify(createReceipt.logs));
        console.log(this.web3obj.eth.abi.decodeParameters([{
            type: 'uint16',
            name: 'Count'
        },{
            type: 'uint16',
            name: 'TotalCount'
        }],createReceipt.logs[0].data));
        

    }


    async sendIncrement(index){

        const incrementTx = this.CPAcontract.methods.IncrementCount();
  
        const createTransaction = await this.web3obj.eth.accounts.signTransaction(
            {
                to: contract.cAddress,
                from: this.ethereumAddress[index],
                data: incrementTx.encodeABI(),
                gas: await incrementTx.estimateGas({from: this.ethereumAddress[index]})
            },
            this.privateKeys[index]
        );
        console.log("Increment......")
        // Send Tx and Wait for Receipt
        const createReceipt = await this.web3obj.eth.sendSignedTransaction(createTransaction.rawTransaction);
        //console.log("Data   " + JSON.stringify(createReceipt.logs));
        console.log(this.web3obj.eth.abi.decodeParameters([{
            type: 'address',
            name: 'SenderAddress'
        },{
            type: 'uint16',
            name: 'Count'
        }],createReceipt.logs[0].data));
        

    }

    async sendDecrement(index){

        const decrementTx = this.CPAcontract.methods.DecrementCount();
    
        const createTransaction = await this.web3obj.eth.accounts.signTransaction(
            {
                to: contract.cAddress,
                from: this.ethereumAddress[index],
                data: decrementTx.encodeABI(),
                gas: await decrementTx.estimateGas({from: this.ethereumAddress[index]})
            },
            this.privateKeys[index]
        );
        console.log("Decrement......")
        // Send Tx and Wait for Receipt
        const createReceipt = await this.web3obj.eth.sendSignedTransaction(createTransaction.rawTransaction);
        //console.log("Data   " + JSON.stringify(createReceipt.logs));
        console.log(this.web3obj.eth.abi.decodeParameters([{
            type: 'address',
            name: 'SenderAddress'
        },{
            type: 'uint16',
            name: 'Count'
        }],createReceipt.logs[0].data));
        
    }
};


