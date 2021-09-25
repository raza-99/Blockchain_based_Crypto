const Block=require('./block');
const {REWARD_INPUT, MINING_REWARD}=require('../config');
const cryptoHash = require('../util/crypto-hash');
const Transaction=require('../wallet/transaction');

const Wallet=require('../wallet');
class Blockchain{
    constructor(){
        this.chain=[Block.genesis()];
    } 
addBlock({data}){
    const newBlock=Block.mineBlock({
lastBlock:this.chain[this.chain.length-1],
data

    });
    this.chain.push(newBlock);
}
replaceChain(chain,validateTransactions,onSuccess){


    if(chain.length<=this.chain.length){
        console.error('The incoming chain must be longer');
        return;
    }
    if(!Blockchain.isValidChain(chain)){
        console.error('The incoming chain must be valid ');
        return;
    }
    if(validateTransactions&&!this.validTransactionData({chain})){
        console.error('The incoming chain has invalid data');
        return ;
    }
    if(onSuccess)onSuccess();
    console.log('replacing chain with ');
    this.chain=chain;
}
validTransactionData({chain}){

    /*
    if some attacker created a entirre  fake block chain
4 rules
1) each transaction must be correctly formatted(this includes transaction haveing correct mimng reward value)
2)Only 1 mineing reward per block
3)the blocks input amount should be valid according to block chain history
4)there cannot be multiple identical transaction in the same block
    */
    for(let i=1;i<chain.length;i++){
        const block=chain[i];
        const transactionSet=new Set();
        let rewardTransactionCount=0;

        for(let transaction of block.data){
            if(transaction.input.address===REWARD_INPUT.address){
                rewardTransactionCount+=1;
            
            if(rewardTransactionCount>1){
                console.error('Miner rewards exceed limit');
                return false;
            }
if(Object.values(transaction.outputMap)[0]!==MINING_REWARD){//i am checking if a miner do get a reward is it from my block chain system or hsi so i will check the first value of the output field which has the data ie MINING_REWARD if it is greater than obviosly its not configured by me so error
    console.error('Miner reward amount is invalid');
    return false;
}
  }  else{
        if(!Transaction.validTransaction(transaction)){
            console.error('Invalid Transaction');
            return false;
        }

const trueBalance=Wallet.calculateBalance({
    chain:this.chain,//here we are not using chain given by attacker it is our chain ie system chain
    address:transaction.input.address
});
if(transaction.input.amount!==trueBalance){
    console.error(('Invalid input amount'));
    return false;
}


if(transactionSet.has(transaction)){
    console.error('An identical transaction appears more than once in the block');
    return false;
}else{
transactionSet.add(transaction);

}

    }
    }
    }
    return true;
}

static isValidChain(chain){
    if(JSON.stringify(chain[0])!==JSON.stringify(Block.genesis())){
        return false
    };
    for(let i=1;i<chain.length;i++){
        const{timestamp,lastHash,hash,nonce,difficulty,data}=chain[i];
        const actualLastHash=chain[i-1].hash;
        const lastDifficulty=chain[i-1].difficulty;
        if(lastHash!==actualLastHash)return false;
        const validatedHash=cryptoHash(timestamp,lastHash,data,nonce,difficulty);
        if(hash!==validatedHash)return false;
        if(Math.abs(lastDifficulty-difficulty)>1)return false;//what if someone does a funny buisness of increasing difficulty level and making block chain network slow or decreasing the difficulty to -1 and spamming the chain thats why we keep a condition that the absolute diffrence between last block and current  should not be greater than 1 //because in the code we adjust by one only and we difficulty is embeded as last block difficulty  if in case any attacker modified than we are checking last block - current block so it cannot be more than 1 if it is then it has been tampered
    }
    return true;
}
};
module.exports=Blockchain;