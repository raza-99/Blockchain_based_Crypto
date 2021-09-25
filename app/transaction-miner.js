const Transaction = require('../wallet/transaction');

class TransactionMiner{
constructor({blockchain,transactionPool,wallet,pubsub}){
    this.blockchain=blockchain;
    this.transactionPool=transactionPool;
    this.wallet=wallet;
    this.pubsub=pubsub;
}
mineTransactions(){

//5 main things to do in order to become a miner
//get all valid transaction from poll
const validTransactions=this.transactionPool.validTransactions();//this contains an array of valid transactions
// generate the miner's reward
validTransactions.push(
    Transaction.rewardTransaction({minerWallet:this.wallet}) 
    );//i am adding this reward transactions also in the array of valid transaction


//add a block consisting of these valid transaction to the blockchain
this.blockchain.addBlock({data:validTransactions});//adding the array of valid transaction in the block to the block chain

//broadcast the updated blockchain
this.pubsub.broadcastChain();

//clear the pool

this.transactionPool.clear();


}

}
module.exports=TransactionMiner;