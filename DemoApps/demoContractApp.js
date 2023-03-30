import Web3 from 'web3';
import Ethers from 'ethers';
import fs from 'fs';
import solc from 'solc';
import { createRequire } from "module";
const require = createRequire(import.meta.url);



export default class demoContractObject {

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
    }

    async CompileAndDeploy(){

        let file=fs.readFileSync("../contracts/CountPerAccount.sol").toString();
        var input = {
            language: "Solidity",
            sources: {
                "CountPerAccount.sol" : {
                    content: file,
                },
            },

            settings: {
                outputSelection:{
                    "*" : {
                        "*": ["*"],
                    },
                },
            },
        };
        console.log(file);

        var output = JSON.parse(solc.compile(JSON.stringify(input)));
        //console.log("Result:  " + output.contracts);

        let ABI= output.contracts["CountPerAccount.sol"]["CountPerAccount"].abi;
        let bytecode= output.contracts["CountPerAccount.sol"]["CountPerAccount"].evm.bytecode.object;

        const CPAcontract = new this.web3obj.eth.Contract(ABI);

        //Create constructor tx
        const CPAcontractTx = CPAcontract.deploy({
            data: bytecode,
        });

        // Sign transacation and send
        const createTransaction = await this.web3obj.eth.accounts.signTransaction(
            {
                data: CPAcontractTx.encodeABI(),
                gas: await CPAcontractTx.estimateGas(),
            },
            this.privateKeys[0]
        );

        // 9. Send tx and wait for receipt
        const createReceipt = await this.web3obj.eth.sendSignedTransaction(createTransaction.rawTransaction);
        console.log(`Contract deployed at address: ${createReceipt.contractAddress}`);

        const contractInfo= {
            cABI: ABI,
            cAddress: createReceipt.contractAddress
        }
        const jsonString = JSON.stringify(contractInfo);
        fs.writeFileSync('../ContractInfo.json', jsonString);   
    }
};