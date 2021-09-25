const Transaction=require('./transaction');
class TransactionPool{
    constructor(){
        this.TransactionMap={};
    }

  
setTransaction(transaction){
    this.TransactionMap[transaction.id]=transaction;
}


clear(){
    this.TransactionMap={};
  
   }


setMap(transactionPoolMap){// the one that u use to do with get request ie output and input maps ie transaction pool maps
this.TransactionMap=transactionPoolMap;
}
existingTransaction({inputAddress}){
    const transactions=Object.values(this.TransactionMap);
    return transactions.find(transaction=>transaction.input.address===inputAddress);
}
validTransactions(){
    let a=Object.values(this.TransactionMap).filter(
transaction=>Transaction.validTransaction(transaction)

    );
  
    return a;
}
clearBlockchainTransactions({chain}){//those transaction which was beeing recoreded in the block chain
    for(let i=1;i<chain.length;i++){
        const block=chain[i];
        for(let transaction of block.data){
            if(this.TransactionMap[transaction.id]){
                delete this.TransactionMap[transaction.id];
            }
        }

    }
}


};
module.exports=TransactionPool;  