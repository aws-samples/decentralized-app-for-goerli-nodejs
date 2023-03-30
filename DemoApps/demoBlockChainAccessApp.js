import Web3 from 'web3';
import Ethers from 'ethers';
//import ethTx from '@ethereumjs/tx'
import { createRequire } from "module";
const require = createRequire(import.meta.url);



export default class DAppObject {

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

        
        console.log();
        this.web3obj.eth.net.getId().then(netid=>{this.NetworkID=netid});
        this.web3obj.eth.getChainId().then(chainid=>{this.ChainID=chainid});
        
    }

    async getAllAddressBalance(){
        var EtherBalance, bal, blockNum, gasPrice;
        
        console.log()
        blockNum= await this.web3obj.eth.getBlockNumber();
        gasPrice= await this.web3obj.eth.getGasPrice();
        console.log(`Current Block Number: ${blockNum}`);
        console.log('Current Gas Price:' + gasPrice +' WEI');

        console.log();
        console.log("Goerli Eth Balance for the accounts");
        this.ethereumAddress.forEach(async (item)=>{
            bal = await this.web3obj.eth.getBalance(item);
            EtherBalance=this.web3obj.utils.fromWei(bal,'ether');
            console.log(`Account: ${item} --Goerli Eth Balance: ${EtherBalance}`);
        });
    };
         
    

    async transferEther(){
        //const ethTx = require('ethereumjs-tx');
        const ethTx = require('ethereumjs-tx').Transaction;
        var fromAddress=this.ethereumAddress[0];
        var actPrivateKey, countN, gasP;
        actPrivateKey=this.privateKeys[0];
            
        countN = await this.web3obj.eth.getTransactionCount(fromAddress);
        gasP= await this.web3obj.eth.getGasPrice();
        const txParams = {
            nonce: Web3.utils.toHex(countN), // Replace by nonce for your account on geth node
            gasPrice: Web3.utils.toHex(gasP), 
            gasLimit: '0x300000',
            to: this.ethereumAddress[1], 
            value: 1000000000
        };
        // Transaction is created
        const tx = new ethTx(txParams, {'chain': 'goerli'});
        actPrivateKey = actPrivateKey.substring(2);
        let privKey = Buffer.from(actPrivateKey, 'hex');
        // Transaction is signed
        tx.sign(privKey);
        const serializedTx = tx.serialize();
        const rawTx = '0x' + serializedTx.toString('hex');
        this.web3obj.eth.sendSignedTransaction(rawTx).then((returnObj)=>{
            console.log("Goerli Eth transferred from Accout 1 to Account 2");
            //console.log(returnObj.logs);
        }).catch(err => {
            console.log("Error While transferring eth");
            console.log(err);
        });
    }
};